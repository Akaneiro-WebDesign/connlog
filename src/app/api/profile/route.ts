import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DISPLAY_NAME_MAX_LENGTH = 50;
const BIO_MAX_LENGTH = 300;

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未ログインです。" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("display_name, bio")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[GET /api/profile] profile fetch error:", error);
      return NextResponse.json(
        { error: "プロフィールの取得に失敗しました。" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: {
        displayName: data?.display_name ?? "",
        bio: data?.bio ?? "",
      },
    });
  } catch (error) {
    console.error("[GET /api/profile] unexpected error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未ログインです。" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const displayName =
      typeof body?.displayName === "string" ? body.displayName.trim() : "";
    const bio =
      typeof body?.bio === "string" ? body.bio.trim() : "";

    if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `ユーザー名は${DISPLAY_NAME_MAX_LENGTH}文字以内で入力してください。`,
        },
        { status: 400 },
      );
    }

    if (bio.length > BIO_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `自己紹介は${BIO_MAX_LENGTH}文字以内で入力してください。`,
        },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error(
        "[PUT /api/profile] existing user check error:",
        selectError,
      );
      return NextResponse.json(
        { error: "プロフィール保存前の確認に失敗しました。" },
        { status: 500 },
      );
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        display_name: displayName || null,
        bio: bio || null,
        created_at: now,
        updated_at: now,
      });

      if (insertError) {
        console.error("[PUT /api/profile] insert error:", insertError);
        return NextResponse.json(
          { error: "プロフィールの新規作成に失敗しました。" },
          { status: 500 },
        );
      }
    } else {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          display_name: displayName || null,
          bio: bio || null,
          updated_at: now,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("[PUT /api/profile] update error:", updateError);
        return NextResponse.json(
          { error: "プロフィールの更新に失敗しました。" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        displayName,
        bio,
      },
    });
  } catch (error) {
    console.error("[PUT /api/profile] unexpected error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}