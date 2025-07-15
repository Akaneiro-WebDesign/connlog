import { supabase } from '@/lib/supabase/client';

const sessionInfo = await supabase.auth.getSession();
console.log("Supabaseセッション情報:", sessionInfo);

type Params = {
  event_id: number;
  user_id: string;
  created_by: string;
  tags: string[];
  note: string;
};

export default async function insertTagsAndNote({
  event_id,
  user_id,
  created_by,
  tags,
  note,
}: Params) {
  for (const name of tags) {
    console.log('タグ保存用の user_id:', user_id);
    console.log('タグ保存用の created_by:', created_by);
    console.log('保存前ログ確認:', {
      event_id,
      user_id,
      created_by,
      tags,
      note,
    });

    console.log('タグ保存アップサート内容:', {
      name,
      event_id,
      user_id,
      created_by,
    });

    const { error: tagError } = await supabase.from('tags').upsert(
      [
        {
          name,
          event_id,
          user_id,
          created_by,
        },
      ],
      {
        onConflict: ['event_id', 'user_id', 'name'] as unknown as string,
      }
    );

    if (tagError) {
      throw new Error(`タグの保存に失敗しました: ${tagError.message}`);
    }
  }

  const { error: noteError } = await supabase
    .from('notes')
    .upsert([{ event_id, user_id, note }], {
      onConflict: ['event_id', 'user_id'] as unknown as string,
    });

  if (noteError) {
    throw new Error(`メモの保存に失敗しました: ${noteError.message}`);
  }

  return { success: true };
}
