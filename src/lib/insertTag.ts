import { supabase } from './_supabaseClient';

export async function insertTag ({
    name,
    event_id,
    user_id,
}: {
    name: string;
    event_id: number;
    user_id: string;
}) {
    const { error } = await supabase.from('tags').insert([
        {
            name,
            event_id,
            user_id,
            created_by: user_id,
        },
    ]);

if (error) {
    console.error('タグの保存に失敗しました:', error.message);
    throw error;
}
}