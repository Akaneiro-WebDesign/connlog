import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service Role key で管理者クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← 必須
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // ユーザー作成
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { created_via_api: true },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // usersテーブルへも登録
    if (data.user) {
      await supabaseAdmin.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      user: { id: data.user?.id, email: data.user?.email }
    })
  } catch (error) {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
