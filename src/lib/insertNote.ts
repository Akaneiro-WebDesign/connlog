import { supabase } from './supabaseClient';

const insertNote = async ({
    event_id,
    user_id,
    note,
}: {
    event_id: number;
    user_id: string;
    note: string;
}):Promise<void>=> {
    const { error } = await supabase
    .from('notes')
    .upsert([
        {
            event_id,
            user_id,
            note
        }],{onConflict:['event_id','user_id']});

    if (error) {
    console.error('メモ保存に失敗しました:', error.message);
    throw error;
    }
};

export default insertNote;