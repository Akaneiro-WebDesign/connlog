import { NextRequest, NextResponse } from "next/server";
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

    const { event_id, tags, note } = await request.json();

    if (!event_id) {
      return NextResponse.json(
        { error: "event_idが必要です" },
        { status: 400 },
      );
    }

    const eventIdString = String(event_id);

    // 既存タグを削除
    const { error: deleteTagsError } = await supabase
      .from("tags")
      .delete()
      .eq("event_id", eventIdString)
      .eq("owner_id", user.id);

    if (deleteTagsError) {
      console.error("タグ削除エラー:", deleteTagsError);
      return NextResponse.json(
        { error: "タグの更新に失敗しました", details: deleteTagsError.message },
        { status: 500 },
      );
    }

    // 新しいタグを保存
    if (Array.isArray(tags) && tags.length > 0) {
      const tagsData = tags
        .filter((tag: string) => tag && tag.trim())
        .map((tag: string) => ({
          event_id: eventIdString,
          tag_name: tag.trim(),
          owner_id: user.id,
          created_by_id: user.id,
        }));

      if (tagsData.length > 0) {
        const { error: insertTagsError } = await supabase
          .from("tags")
          .insert(tagsData);

        if (insertTagsError) {
          console.error("タグ保存エラー:", insertTagsError);
          return NextResponse.json(
            {
              error: "タグの更新に失敗しました",
              details: insertTagsError.message,
            },
            { status: 500 },
          );
        }
      }
    }

    // 既存メモを削除
    const { error: deleteNoteError } = await supabase
      .from("notes")
      .delete()
      .eq("event_id", eventIdString)
      .eq("user_id", user.id);

    if (deleteNoteError) {
      console.error("メモ削除エラー:", deleteNoteError);
      return NextResponse.json(
        { error: "メモの更新に失敗しました", details: deleteNoteError.message },
        { status: 500 },
      );
    }

    // 新しいメモを保存
    if (note && note.trim()) {
      const { error: insertNoteError } = await supabase.from("notes").insert({
        event_id: eventIdString,
        note: note.trim(),
        user_id: user.id,
      });

      if (insertNoteError) {
        console.error("メモ保存エラー:", insertNoteError);
        return NextResponse.json(
          {
            error: "メモの更新に失敗しました",
            details: insertNoteError.message,
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
