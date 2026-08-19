import { NextRequest, NextResponse } from "next/server";
import {
  validatePositiveIntegerId,
  validateTagsAndNote,
} from "@/lib/eventInputValidation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "リクエストの形式が正しくありません" },
        { status: 400 },
      );
    }

    const { event_id, tags, note } = body as Record<string, unknown>;
    const eventIdResult = validatePositiveIntegerId(event_id, "event_id");

    if (!eventIdResult.ok) {
      return NextResponse.json({ error: eventIdResult.error }, { status: 400 });
    }

    const tagsAndNoteResult = validateTagsAndNote(tags, note);

    if (!tagsAndNoteResult.ok) {
      return NextResponse.json(
        { error: tagsAndNoteResult.error },
        { status: 400 },
      );
    }

    const eventId = eventIdResult.value;

    const { tags: normalizedTags, note: normalizedNote } =
      tagsAndNoteResult.value;

    // すべての入力検証が完了してから既存データを変更する
    const { error: deleteTagsError } = await supabase
      .from("tags")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (deleteTagsError) {
      console.error("タグ削除エラー:", deleteTagsError);
      return NextResponse.json(
        { error: "タグの更新に失敗しました" },
        { status: 500 },
      );
    }

    if (normalizedTags.length > 0) {
      const tagsData = normalizedTags.map((tag) => ({
        event_id: eventId,
        tag_name: tag,
        owner_id: user.id,
        user_id: user.id,
        created_by_id: user.id,
      }));

      const { error: insertTagsError } = await supabase
        .from("tags")
        .insert(tagsData);

      if (insertTagsError) {
        console.error("タグ保存エラー:", insertTagsError);
        return NextResponse.json(
          {
            error: "タグの更新に失敗しました",
          },
          { status: 500 },
        );
      }
    }

    const { error: deleteNoteError } = await supabase
      .from("notes")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (deleteNoteError) {
      console.error("メモ削除エラー:", deleteNoteError);
      return NextResponse.json(
        { error: "メモの更新に失敗しました" },
        { status: 500 },
      );
    }

    if (normalizedNote) {
      const { error: insertNoteError } = await supabase.from("notes").insert({
        event_id: eventId,
        note: normalizedNote,
        user_id: user.id,
      });

      if (insertNoteError) {
        console.error("メモ保存エラー:", insertNoteError);
        return NextResponse.json(
          {
            error: "メモの更新に失敗しました",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { message: "タグとメモを更新しました" },
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
