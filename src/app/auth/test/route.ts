import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from('users').select('id').limit(1)
    return NextResponse.json({
      success: !error,
      message: error ? error.message : '接続成功',
      env_check: {
        url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'サーバーエラー',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
