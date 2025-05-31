'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../types/supabase';
import { useState } from 'react';

export default function SupabaseProvider({
    children,
}:{
    children:React.ReactNode;
}){
    const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
);

return (
    <SessionContextProvider supabaseClient={supabaseClient}>
        {children}
    </SessionContextProvider>
);
}