import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }

    const eventId = request.nextUrl.searchParams.get("event_id");

    if (!eventId || !/^\d+$/.test(eventId)) {
      return NextResponse.json(
        { error: "有効なevent_idを指定してください。" },
        { status: 400 },
      );
    }

    const apiKey = process.env.CONNPASS_API_KEY;

    if (!apiKey) {
      console.error("[GET /api/search-event] CONNPASS_API_KEY is missing");

      return NextResponse.json(
        { error: "サーバーの設定に問題があります。" },
        { status: 500 },
      );
    }

    const apiUrl = new URL("https://connpass.com/api/v2/events/");
    apiUrl.searchParams.set("event_id", eventId);

    const apiResponse = await fetch(apiUrl, {
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      console.error(
        "[GET /api/search-event] connpass API error:",
        apiResponse.status,
      );

      return NextResponse.json(
        { error: "connpass APIからの取得に失敗しました。" },
        { status: 502 },
      );
    }

    const data = await apiResponse.json();
    const event = Array.isArray(data?.events) ? data.events[0] : null;

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません。" },
        { status: 404 },
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("[GET /api/search-event] unexpected error:", error);

    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
