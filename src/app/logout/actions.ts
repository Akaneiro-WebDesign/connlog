'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const logout = async () => {
    const supabase = createServerActionClient({cookies});
    await supabase.auth.signOut();
} ;