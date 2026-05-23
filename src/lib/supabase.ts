"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// シングルトンインスタンスを作成
export const supabase = createSupabaseBrowserClient();

// 既存コード互換用
export const createClient = createSupabaseBrowserClient;