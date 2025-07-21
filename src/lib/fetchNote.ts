import { supabase } from './_supabaseClient';

const fetchNote = async ({
  event_id,
  user_id,
}: {
  event_id: number;
  user_id: string;
}): Promise<string> => {
  const { data, error } = await supabase
    .from('notes')
    .select('note')
    .eq('event_id', event_id)
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('メモ取得エラー:', error.message);
    throw error;
  }

  return data?.note ?? '';
};

export default fetchNote;
