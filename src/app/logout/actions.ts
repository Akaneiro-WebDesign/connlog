'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export const logout = async () => {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.signOut();
};