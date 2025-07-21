import { supabase } from '@/lib/_supabaseClient';

type InsertTagsParams = {
    eventId: number;
    userId: string;
    tags: string[];
};

export default async function insertTags({ eventId, userId, tags }: InsertTagsParams){
    await supabase
    .from('tags')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

const inserts = tags.map((tag) => ({
    event_id: eventId,
    user_id: userId,
    name: tag,
    }));

const { error } = await supabase.from('tags').insert(inserts);
    if (error) throw error;
}