'use client';

import { useState } from 'react';
import { insertTag } from '@/lib/insertTag';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  eventId: number;
  onSaveSuccess: () => void;
};

export default function SkillTagInput({
  tags,
  setTags,
  eventId,
  onSaveSuccess,
}: Props) {
  const [tagInput, setTagInput] = useState('');
  const router = useRouter();

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      alert('保存にはログインが必要です。ログイン画面に移動します');
      router.push('/login');
      return;
    }

    try {
      for (const tag of tags) {
        await insertTag({
          name: tag,
          event_id: eventId,
          user_id: user.id,
        });
      }

      alert('タグを保存しました');
      onSaveSuccess(); // モーダルを閉じる
    } catch (error: any) {
      console.error('保存に失敗しました', error.message ?? error);
      alert(`保存に失敗しました: ${error.message ?? '原因不明のエラー'}`);
    }
  };

  return (
    <div className="max-w-md p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-semibold mb-2">スキルタグを追加</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="例：React, Next.js"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <button
          onClick={handleAddTag}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          追加
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        タグを保存する
      </button>
    </div>
  );
}
