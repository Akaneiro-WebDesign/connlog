import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  console.log('🔍 Token検証開始');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    console.log('❌ Authorizationヘッダーなし');
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  const token = authorization.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.log('❌ 認証エラー:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  console.log('✅ 認証成功:', user.id);

  const { tags, event_id, note } = await req.json();

  // event_idが数値であることを保証
  const eventIdNumber = typeof event_id === 'string' ? parseInt(event_id, 10) : event_id;

// タグを1件ずつinsert（重複チェックあり／23505は無視）
// タグを1件ずつinsert - カラムを明示的に指定
for (const tagName of tags) {
  console.log('🔍 処理中のタグ:', tagName);
  
  // 既存チェックは一旦スキップして、直接INSERTを試す
  console.log('📝 SQLで直接挿入を試みる');
  
  // 方法1: fromの後にカラムを明示
  const { error: tagError1, data: insertedTag1 } = await supabase
    .from('tags')
    .insert([{  // 配列で渡す
      tag_name: tagName,  // nameから変更
      event_id: eventIdNumber,
      owner_id: user.id,  // user_idから変更
      created_by_id: user.id  // created_byから変更
    }])
    .select();
  
  console.log('🔍 方法1の結果:', { insertedTag1, tagError1 });
  
  if (!tagError1) {
    console.log('✅ 方法1で成功！');
    continue;
  }
  
  // 方法2: rpcを使ってSQL実行
  const { error: tagError2, data } = await supabase.rpc('execute_sql', {
    query: `
      INSERT INTO public.tags (name, event_id, user_id, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    params: [tagName, eventIdNumber, user.id, user.id]
  });
  
  console.log('🔍 方法2の結果:', { data, tagError2 });
}

  // メモもupsertは使わず、既存チェック→update or insert
  const { data: existingNote } = await supabase
    .from('notes')
    .select('id')
    .eq('event_id', eventIdNumber)
    .eq('user_id', user.id)
    .single();

  if (existingNote) {
    // 更新
    const { error: updateError } = await supabase
      .from('notes')
      .update({ note, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id);

    if (updateError) {
      console.log('❌ メモ更新エラー:', updateError);
      return NextResponse.json({ error: 'メモ更新エラー', detail: updateError.message }, { status: 400 });
    }
  } else {
    // 新規作成
    const { error: insertError } = await supabase
      .from('notes')
      .insert({
        event_id: eventIdNumber,
        user_id: user.id,
        note
      });

    if (insertError) {
      console.log('❌ メモ挿入エラー:', insertError);
      return NextResponse.json({ error: 'メモ保存エラー', detail: insertError.message }, { status: 400 });
    }
  }

  console.log('✅ 保存成功');
  return NextResponse.json({ success: true });
}
