'use client';

import { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { type Session } from '@supabase/supabase-js';


export default function SupabaseProvider({
    children,
    initialSession,
}:{
    children:React.ReactNode;
    initialSession?: Session | null;
}){
    const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient());

return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={initialSession}
    >
        {children}
    </SessionContextProvider>
);
}