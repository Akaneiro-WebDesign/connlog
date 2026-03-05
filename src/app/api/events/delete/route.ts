import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();

        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('削除API: 認証ユーザー',user?.id); //デバッグログ

        if (authError || !user) {
            console.error('認証エラー:',authError);
            return NextResponse.json(
                { error: '認証が必要です' },
                { status: 401 }
            );
        }

        //　　リクエストボディから event_id を取得
        const { event_id } = await request.json();

        console.log('削除API: event_id=', event_id); //デバッグログ

        if (!event_id) {
            return NextResponse.json(
                { error: 'event_idが必要です' },
                { status: 400 }
            );
        }

        // イベントを削除 (RLSポリシーが owner_id をチェック)
        const { data, error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('id', event_id)
            .select(); // 削除されたレコードを返す

            console.log('削除結果:', data, deleteError); //デバッグログ

        if (deleteError) {
            console.error('削除エラー:', deleteError);
            return NextResponse.json(
                { error: '削除に失敗しました', details: deleteError.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'イベントが見つからないか、削除権限がありません'},
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'イベントを削除しました', deleted: data },
            { status: 200 }
        );

    } catch (error) {
        console.error('予期しないエラー:', error);
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        );
    }
}