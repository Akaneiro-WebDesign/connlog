// 

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// 環境変数
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// シンプルなクライアント
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
)

export function getSupabaseClient() {
  return supabase
}
