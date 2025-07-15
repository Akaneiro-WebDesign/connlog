'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import SkillTagInput from '@/components/SkillTagInput';
import NoteInput from '@/components/NoteInput';
import insertTagsAndNote from '@/lib/insertTagsAndNote';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

dayjs.locale('ja');
dayjs.extend(weekday);
dayjs.extend(localizedFormat);

type Props = {
    event: {
     event_id: number;
     title: string;
     started_at: string;
     place: string | null;
     event_url: string;
    };
};

export default function EventCard({ event }: Props) {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);

    const handleOpenModal = () => {
        if (isLoading) return;
        if (!user) {
            alert('ログインが必要です。ログイン画面に移動します。');
            router.push('/login');
            return;
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    useEffect(() => {
        const loadNoteAndTags = async () => {
            if (!user?.id || !event.event_id) return;
            setLoading(true);
            try {
                const { data: noteData, error: noteError } = await supabase
                .from('notes')
                .select('note')
                .eq('event_id', event.event_id)
                .eq('user_id', user.id)
                .single();

                if (noteError && noteError.code !== 'PGRST116'){
                console.error('Note読み込み失敗:', noteError.message);
                } else if (noteData?.note){
                    setNote(noteData.note);
                }

                const { data: tagData, error:tagError } = await supabase
                .from('tags')
                .select('name')
                .eq('event_id', event.event_id)
                .eq('user_id', user.id);

                if (tagError) {
                    console.error('タグ読み込み失敗:',tagError.message);
                } else if (tagData){
                    setTags(tagData.map((tag) => tag.name));
                }
            } finally {
    setLoading(false);
    }
    };
    loadNoteAndTags();
},[event.event_id, user?.id]);

const handleSave = async () => {
    const res = await fetch('/api/save-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        tags,
        event_id: event.event_id,
        note,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(`保存失敗: ${data.error} / ${data.detail}`);
    } else {
      alert('保存成功！');
    }
  };

    return (
        <div className="border rounded p-4 shadow-sm bg-white relative">
        <h2 className="text-lg font-bold">{event.title}</h2>
        <p className="text-sm text-gray-600 mt-1">📅 {dayjs(event.started_at).format('YYYY年M月D日(ddd)HH:mm〜')}</p>
        <p className="text-sm text-gray-600">📍{event.place || '未定'}</p>

        <a
        href={event.event_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline block mt-2"
        >
            connpassページへ
        </a>

        <button
        onClick={handleOpenModal}
        className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
            タグ登録 & メモ
        </button>
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow max-w-md w-full">
                    <h3 className="text-lg font-bold mb-4">スキルタグ登録</h3>
                    <div className="mb-2 text-sm text-gray-700">
                    <p>
                        <strong>イベント名：</strong>
                        {event.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-4"><strong>日時：</strong>
                        {dayjs(event.started_at).format('YYYY年M月D日(ddd)HH:mm〜')}
                    </p>
                    </div>
                    <SkillTagInput
                    tags={tags}
                    setTags={setTags}
                    />
                    <div className="mt-4">
                        {loading? (
                            <p>読み込み中です…</p>
                        ) : (
                        <NoteInput note={note} setNote={setNote} />
                        )}
                    </div>
                    <button
                    onClick={handleSave}
                    className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        タグとメモを保存する
                    </button>

                    <button
                    onClick={handleCloseModal}
                    className="mt-2 block text-sm text-blue-600 underline"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        )}
        </div>
    );
}