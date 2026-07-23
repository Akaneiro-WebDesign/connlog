import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_START = 0;
const DEFAULT_COUNT = 20;
const MAX_COUNT = 100;
const MAX_NICKNAME_LENGTH = 100;

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

    const nickname = request.nextUrl.searchParams.get("nickname")?.trim() ?? "";

    const startValue =
      request.nextUrl.searchParams.get("start") ?? String(DEFAULT_START);

    const countValue =
      request.nextUrl.searchParams.get("count") ?? String(DEFAULT_COUNT);

    const start = Number(startValue);
    const count = Number(countValue);

    if (!nickname || nickname.length > MAX_NICKNAME_LENGTH) {
      return NextResponse.json(
        { error: "有効なnicknameを指定してください。" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(start) || start < 0) {
      return NextResponse.json(
        { error: "startは0以上の整数で指定してください。" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
      return NextResponse.json(
        {
          error: `countは1以上${MAX_COUNT}以下の整数で指定してください。`,
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.CONNPASS_API_KEY;

    if (!apiKey) {
      console.error("[GET /api/search-user] CONNPASS_API_KEY is missing");

      return NextResponse.json(
        { error: "サーバーの設定に問題があります。" },
        { status: 500 },
      );
    }

    /*
     * ConnLogの画面では、最初の取得位置を0として扱う。
     * connpass APIへ送るときだけ、1から始まる値へ変換する。
     *
     * ConnLog start=0  → connpass start=1
     * ConnLog start=20 → connpass start=21
     */

    const connpassStart = start + 1;

    const encodedNickname = encodeURIComponent(nickname);
    const apiUrl = new URL(
      `https://connpass.com/api/v2/users/${encodedNickname}/attended_events/`,
    );

    apiUrl.searchParams.set("start", String(connpassStart));
    apiUrl.searchParams.set("count", String(count));

    const apiResponse = await fetch(apiUrl, {
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      console.error(
        "[GET /api/search-user] connpass API error:",
        apiResponse.status,
      );

      return NextResponse.json(
        { error: "connpass APIからの取得に失敗しました。" },
        { status: 502 },
      );
    }

    const data = await apiResponse.json();
    const events = Array.isArray(data?.events) ? data.events : [];

    const totalResults =
      typeof data?.results_available === "number"
        ? data.results_available
        : events.length;

    const returnedResults =
      typeof data?.results_returned === "number"
        ? data.results_returned
        : events.length;

    return NextResponse.json({
      ...data,
      events,
      pagination: {
        start,
        count,
        total: totalResults,
        returned: returnedResults,
        hasMore: start + returnedResults < totalResults,
      },
    });
  } catch (error) {
    console.error("[GET /api/search-user] unexpected error:", error);

    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
