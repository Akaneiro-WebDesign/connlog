import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies as getCookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await getCookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) => {
          cookies.forEach((cookie) => {
            cookieStore.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { tags, event_id, note } = await req.json();

  // デバッグ
  console.log('user:', user);
  console.log('event_id:', event_id);
  console.log('tags:', tags);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', detail: userError?.message }, { status: 401 });
  }

  // タグ保存
  const { error: tagError } = await supabase.from('tags').upsert(
    tags.map((name: string) => ({
      name,
      event_id,
      user_id: user.id,
      created_by: user.id,
    })),
    { onConflict: ['event_id', 'user_id', 'name'] }
  );
  if (tagError) {
    return NextResponse.json({ error: 'タグ保存エラー', detail: tagError.message }, { status: 400 });
  }

  // メモ保存
  const { error: noteError } = await supabase.from('notes').upsert(
    [{ event_id, user_id: user.id, note }],
    { onConflict: ['event_id', 'user_id'] }
  );
  if (noteError) {
    return NextResponse.json({ error: 'メモ保存エラー', detail: noteError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
