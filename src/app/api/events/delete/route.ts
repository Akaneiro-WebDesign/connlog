import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function deleteRelatedData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  externalEventId: number,
) {
  const { error: notesDeleteError } = await supabase
    .from("notes")
    .delete()
    .eq("event_id", externalEventId)
    .eq("user_id", userId);

  if (notesDeleteError) {
    console.error("notes削除エラー:", notesDeleteError);
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "メモの削除に失敗しました",
          details: notesDeleteError.message,
        },
        { status: 500 },
      ),
    };
  }

  const { error: tagsDeleteError } = await supabase
    .from("tags")
    .delete()
    .eq("event_id", externalEventId)
    .eq("owner_id", userId);

  if (tagsDeleteError) {
    console.error("tags削除エラー:", tagsDeleteError);
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "タグの削除に失敗しました", details: tagsDeleteError.message },
        { status: 500 },
      ),
    };
  }
  return { ok: true as const };
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("認証エラー:", authError);
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { event_id, external_event_id } = await request.json();

    // イベント本体が存在しない場合は、関連データのみ削除する
    if (event_id == null && external_event_id != null) {
      const relatedDeleteResult = await deleteRelatedData(
        supabase,
        user.id,
        external_event_id,
      );

      if (!relatedDeleteResult.ok) {
        return relatedDeleteResult.response;
      }

      return NextResponse.json(
        { message: "関連データ（メモ・タグ）を削除しました" },
        { status: 200 },
      );
    }

    if (event_id == null) {
      return NextResponse.json(
        { error: "event_idが必要です" },
        { status: 400 },
      );
    }

    const { data, error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", event_id)
      .select();

    if (deleteError) {
      console.error("削除エラー:", deleteError);
      return NextResponse.json(
        { error: "削除に失敗しました", details: deleteError.message },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "イベントが見つからないか、削除権限がありません" },
        { status: 404 },
      );
    }

    const deletedEvent = data[0];
    const externalEventId = deletedEvent.event_id;

    const relatedDeleteResult = await deleteRelatedData(
      supabase,
      user.id,
      externalEventId,
    );

    if (!relatedDeleteResult.ok) {
      return relatedDeleteResult.response;
    }

    return NextResponse.json(
      {
        message: "関連データ（メモ・タグ）を削除しました",
        deleted: data,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("予期しないエラー:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 },
    );
  }
}
