import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Color palette for tags
const TAG_COLORS = [
  "#DC2626",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#9E9E9E",
  "#8B5CF6",
  "#EC4899",
];

type EventId = string | number;

type NoteRow = {
  id: string;
  event_id: EventId | null;
  note?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type EventRow = {
  id?: number | string | null;
  event_id: EventId | null;
  owner_id?: string | null;
  user_id?: string | null;
  title?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  place?: string | null;
  venue?: string | null;
  event_url?: string | null;
  description?: string | null;
  event_description?: string | null;
  url?: string | null;
  catch?: string | null;
  organizer?: string | null;
};

type TagRow = {
  id?: string | number;
  event_id: EventId | null;
  tag_name?: string | null;
  name?: string | null;
  owner_id?: string | null;
  user_id?: string | null;
  created_by_id?: string | null;
};

const getEventKey = (eventId: EventId | null | undefined) => {
  if (eventId == null) return null;
  return String(eventId);
};

export async function POST() {
  const totalStart = performance.now();

  try {
    console.log("[dashboard-data] start");

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[dashboard-data] auth error:", authError);
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const userId = user.id;

    // 1. events / notes / tags を取得
    const dbStart = performance.now();

    const [eventsResult, notesResult, tagsResult] = await Promise.all([
      supabase
        .from("events")
        .select("*, organizer")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),

      supabase
        .from("notes")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),

      supabase.from("tags").select("*").eq("user_id", userId),
    ]);

    const { data: events, error: eventsError } = eventsResult;
    const { data: notes, error: notesError } = notesResult;
    const { data: tags, error: tagsError } = tagsResult;

    console.log(
      "[dashboard-data] events + notes + tags fetch:",
      Math.round(performance.now() - dbStart),
      "ms",
      {
        eventsCount: events?.length ?? 0,
        notesCount: notes?.length ?? 0,
        tagsCount: tags?.length ?? 0,
      },
    );

    if (eventsError) {
      console.error("[dashboard-data] eventsError:", eventsError);
      return NextResponse.json(
        {
          error: "Failed to fetch events data",
          details: eventsError.message,
        },
        { status: 500 },
      );
    }

    if (notesError) {
      console.error("[dashboard-data] notesError:", notesError);
      return NextResponse.json(
        {
          error: "Failed to fetch notes data",
          details: notesError.message,
        },
        { status: 500 },
      );
    }

    if (tagsError) {
      console.error("[dashboard-data] tagsError:", tagsError);
      return NextResponse.json(
        {
          error: "Failed to fetch tags data",
          details: tagsError.message,
        },
        { status: 500 },
      );
    }

    const typedEvents = (events ?? []) as EventRow[];
    const typedNotes = (notes ?? []) as NoteRow[];
    const typedTags = (tags ?? []) as TagRow[];

    // データが空の場合は空のレスポンスを返す
    if (
      typedEvents.length === 0 &&
      typedNotes.length === 0 &&
      typedTags.length === 0
    ) {
      console.log(
        "[dashboard-data] total:",
        Math.round(performance.now() - totalStart),
        "ms",
      );

      return NextResponse.json({
        tagDistribution: [],
        weeklyParticipation: [],
        recentEvents: [],
      });
    }

    // 2. find/filter を減らすための Map を作る
    const mapStart = performance.now();

    const eventMap = new Map<string, EventRow>();

    for (const event of typedEvents) {
      const eventKey = getEventKey(event.event_id);

      if (eventKey) {
        eventMap.set(eventKey, event);
      }
    }

    const noteMap = new Map<string, NoteRow>();

    for (const note of typedNotes) {
      const eventKey = getEventKey(note.event_id);

      if (!eventKey) continue;

      // notes は updated_at 降順で取得しているため、最初の1件を最新メモとして扱う

      if (!noteMap.has(eventKey)) {
        noteMap.set(eventKey, note);
      }
    }
    const tagsMap = new Map<string, string[]>();

    for (const tag of typedTags) {
      const eventKey = getEventKey(tag.event_id);

      if (!eventKey) continue;

      const tagName = tag.tag_name || tag.name || "タグ";
      const currentTags = tagsMap.get(eventKey) ?? [];

      currentTags.push(tagName);
      tagsMap.set(eventKey, currentTags);
    }

    console.log(
      "[dashboard-data] map build:",
      Math.round(performance.now() - mapStart),
      "ms",
    );

    // 3. タグ別割合の計算
    const tagCount: Record<string, number> = {};

    if (typedTags.length > 0) {
      typedTags.forEach((tag) => {
        const tagName = tag.tag_name || tag.name || "Unknown";
        tagCount[tagName] = (tagCount[tagName] || 0) + 1;
      });
    }

    const totalTags = Object.values(tagCount).reduce(
      (sum, count) => sum + count,
      0,
    );
    const tagDistribution = Object.entries(tagCount)
      .map(([name, count], index) => ({
        name,
        value: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
        color: TAG_COLORS[index % TAG_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    // 4. 週ごとの参加数計算（イベント開催日ベース）
    const weeklyStart = performance.now();

    const weeklyCount: Record<string, number> = {};
    const now = new Date();

    // 過去5週間の初期化
    for (let i = 4; i >= 0; i--) {
      const weekDate = new Date(now);
      weekDate.setDate(now.getDate() - i * 7);
      const weekKey = getWeekKey(weekDate);
      weeklyCount[weekKey] = 0;
    }

    // events.started_atをイベント開催日として使用
    if (typedEvents.length > 0) {
      typedEvents.forEach((event) => {
        if (!event.started_at) return;
        try {
          let date = new Date(event.started_at);

          // UTC時刻の場合、日本時間に調整
          if (
            event.started_at.includes("T") &&
            event.started_at.includes("Z")
          ) {
            date = new Date(date.getTime() + 9 * 60 * 60 * 1000);
          }

          if (!isNaN(date.getTime())) {
            // 未来のイベントは「参加した回数」に含めない
            if (date > now) return;

            const weekKey = getWeekKey(date);

            // 直近5週間に入るものだけ加算
            if (weekKey in weeklyCount) {
              weeklyCount[weekKey]++;
            }
          }
        } catch {
          // 日付解析エラーは無視
        }
      });
    }

    const sortedWeekKeys = Object.keys(weeklyCount).sort();
    const weeklyParticipation = [
      { week: "4週間前", count: weeklyCount[sortedWeekKeys[0]] || 0 },
      { week: "3週間前", count: weeklyCount[sortedWeekKeys[1]] || 0 },
      { week: "2週間前", count: weeklyCount[sortedWeekKeys[2]] || 0 },
      { week: "先週", count: weeklyCount[sortedWeekKeys[3]] || 0 },
      { week: "今週", count: weeklyCount[sortedWeekKeys[4]] || 0 },
    ];

    console.log(
      "[dashboard-data] weeklyParticipation build:",
      Math.round(performance.now() - weeklyStart),
      "ms",
    );

    // 5. 最近のイベント履歴作成
    const recentEventsStart = performance.now();

    const sortedEvents = [...typedEvents].sort((a, b) => {
      const aTime = a.started_at ? new Date(a.started_at).getTime() : 0;
      const bTime = b.started_at ? new Date(b.started_at).getTime() : 0;

      return bTime - aTime;
    });

    const recentEvents = sortedEvents.map((event, index) => {
      const eventKey = getEventKey(event.event_id);
      const relatedNote = eventKey ? noteMap.get(eventKey) : undefined;

      return {
        id: event.id ?? null,
        noteId: relatedNote?.id ?? null,
        externalEventId: event.event_id ?? null,
        title: event.title || `イベント #${event.event_id || index + 1}`,
        date: formatEventDate(event.started_at),
        time: formatEventTime(event.started_at, event.ended_at),
        type: "イベント",
        organizer: getOrganizerName(event),
        venue: event.place || event.venue || "オンライン",
        tags: eventKey ? (tagsMap.get(eventKey) ?? []).slice(0, 3) : [],
        description: relatedNote?.note || "メモはありません",
        event_description:
          event.catch ||
          (event.description
            ? `${event.description.replace(/<[^>]*>/g, "").slice(0, 100)}...`
            : "イベントの概要はありません"),
        event_url:
          event.event_url ||
          event.url ||
          (event.event_id
            ? `https://connpass.com/event/${event.event_id}/`
            : ""),
      };
    });

    console.log(
      "[dashboard-data] recentEvents build:",
      Math.round(performance.now() - recentEventsStart),
      "ms",
    );

    const dashboardStats = {
      tagDistribution,
      weeklyParticipation,
      recentEvents,
    };

    console.log(
      "[dashboard-data] total:",
      Math.round(performance.now() - totalStart),
      "ms",
    );

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("dashboard-data unexpected error:", error);
    console.log(
      "[dashboard-data] total until error:",
      Math.round(performance.now() - totalStart),
      "ms",
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper functions
function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const daysToMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(d);
  monday.setDate(d.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  const year = monday.getFullYear();
  const month = (monday.getMonth() + 1).toString().padStart(2, "0");
  const dayStr = monday.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${dayStr}`;
}

function formatEventDate(dateString?: string | null): string {
  if (!dateString) return "日付未定";

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];

    return `${year}年${month}月${day}日 （${weekday}）`;
  } catch {
    return "日付エラー";
  }
}

function formatEventTime(
  startDateTime?: string | null,
  endDateTime?: string | null,
): string {
  if (!startDateTime) return "時間未定";

  try {
    const startDate = new Date(startDateTime);
    const startHours = startDate.getHours().toString().padStart(2, "0");
    const startMinutes = startDate.getMinutes().toString().padStart(2, "0");

    let timeStr = `${startHours}:${startMinutes}`;

    if (endDateTime) {
      try {
        const endDate = new Date(endDateTime);
        if (!isNaN(endDate.getTime())) {
          const endHours = endDate.getHours().toString().padStart(2, "0");
          const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
          timeStr = `${timeStr}〜${endHours}:${endMinutes}`;
        }
      } catch {
        // 終了時間が不正な場合は開始時間のみ表示
      }
    }

    return timeStr;
  } catch {
    return "時間エラー";
  }
}

function getOrganizerName(event?: EventRow): string {
  if (!event) return "主催者未定";

  if (event.organizer && event.organizer.trim() !== "") {
    return event.organizer;
  }

  return "主催者未定";
}
