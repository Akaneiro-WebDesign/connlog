import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: '認証が必要です' },
                { status: 401 }
            );
        }

        // リクエストボディから更新データを取得
        const { event_id, title, started_at, ended_at, place, description, organizer } = await request.json();

        if (!event_id) {
            return NextResponse.json(
                { error: 'event_idが必要です' },
                { status: 400 }
            );
        }

        // 更新するデータを準備
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (started_at !== undefined) updateData.started_at = started_at;
        if (ended_at !== undefined) updateData.ended_at = ended_at;
        if (place !== undefined) updateData.place = place;
        if (description !== undefined) updateData.description = description;
        if (organizer !== undefined) updateData.organizer = organizer;

        // イベントを更新 (RLSポリシーが owner_id をチェック)	
        const { error: updateError } = await supabase
            .from('events')
            .update(updateData)
            .eq('id', event_id);

        if (updateError) {
            console.error('更新エラー:', updateError);
            return NextResponse.json(
                { error: '更新に失敗しました', details: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'イベントを更新しました' },
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