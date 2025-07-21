import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  const token = authorization.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const { tags, event_id, note } = await req.json();
  const eventIdNumber = typeof event_id === 'string' ? parseInt(event_id, 10) : event_id;

for (const tagName of tags) {
  const { error: tagError} = await supabase
    .from('tags')
    .insert([{
      tag_name: tagName,
      event_id: eventIdNumber,
      owner_id: user.id,
      created_by_id: user.id
    }]);
    if (tagError && tagError.code !== '23505') {	
      return NextResponse.json({ error: 'タグ保存エラー', detail: tagError.message }, { status: 400 });	
      }
}

  const { data: existingNote } = await supabase
    .from('notes')
    .select('id')
    .eq('event_id', eventIdNumber)
    .eq('user_id', user.id)
    .single();

  if (existingNote) {
    const { error: updateError } = await supabase
      .from('notes')
      .update({ note, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id);

    if (updateError) {
      return NextResponse.json({ error: 'メモ更新エラー', detail: updateError.message }, { status: 400 });
    }
  } else {
    const { error: insertError } = await supabase
      .from('notes')
      .insert({
        event_id: eventIdNumber,
        user_id: user.id,
        note
      });

    if (insertError) {
      return NextResponse.json({ error: 'メモ保存エラー', detail: insertError.message }, { status: 400 });
    }
  }
  return NextResponse.json({ success: true });
}
