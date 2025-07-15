'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider} from '@supabase/auth-helpers-react';
import type { Database } from '../lib/database.types';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,	
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

return (
  <SessionContextProvider
  supabaseClient={supabaseClient}
  initialSession={null}
  >
    {children}
  </SessionContextProvider>
);
}