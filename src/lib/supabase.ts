'use client';

import { createClient as createBrowserClient } from './supabase/browser';

// シングルトンインスタンスを作成
export const supabase = createBrowserClient();

// 名前付きエクスポートも提供
export { createClient } from './supabase/browser';