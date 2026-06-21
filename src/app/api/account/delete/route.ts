import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabaseの環境変数が設定されていません。");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "ログインが必要です。" },
        { status: 401 },
      );
    }

    const userId = user.id;
    const supabaseAdmin = createSupabaseAdminClient();

    const { error: notesDeleteError } = await supabaseAdmin
      .from("notes")
      .delete()
      .eq("user_id", userId);

    if (notesDeleteError) {
      console.error(
        "[DELETE /api/account/delete] notes delete error:",
        notesDeleteError,
      );
      return NextResponse.json(
        { error: "メモの削除に失敗しました。" },
        { status: 500 },
      );
    }

    const { error: tagsByOwnerDeleteError } = await supabaseAdmin
      .from("tags")
      .delete()
      .eq("user_id", userId);

    if (tagsByOwnerDeleteError) {
      console.error(
        "[DELETE /api/account/delete] tags owner delete error:",
        tagsByOwnerDeleteError,
      );
      return NextResponse.json(
        { error: "タグの削除に失敗しました。" },
        { status: 500 },
      );
    }
    const { error: tagsByCreatedByDeleteError } = await supabaseAdmin
      .from("tags")
      .delete()
      .eq("created_by_id", userId);

    if (tagsByCreatedByDeleteError) {
      console.error(
        "[DELETE /api/account/delete] tags created_by delete error:",
        tagsByCreatedByDeleteError,
      );
      return NextResponse.json(
        { error: "タグの削除に失敗しました。" },
        { status: 500 },
      );
    }
    const { error: eventsDeleteError } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("user_id", userId);

    if (eventsDeleteError) {
      console.error(
        "[DELETE /api/account/delete] events delete error:",
        eventsDeleteError,
      );
      return NextResponse.json(
        { error: "登録イベントの削除に失敗しました。" },
        { status: 500 },
      );
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error(
        "[DELETE /api/account/delete] users delete error:",
        profileDeleteError,
      );
      return NextResponse.json(
        { error: "プロフィールの削除に失敗しました。" },
        { status: 500 },
      );
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error(
        "[DELETE /api/account/delete] auth user delete error:",
        authDeleteError,
      );
      return NextResponse.json(
        { error: "認証ユーザーの削除に失敗しました。" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "アカウントを削除しました。",
    });
  } catch (error) {
    console.error("[DELETE /api/account/delete] unexpected error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
