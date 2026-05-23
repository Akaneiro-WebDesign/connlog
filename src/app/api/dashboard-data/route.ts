import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  date?: string | null;
  event_date?: string | null;
};

type EventRow = {
  id?: number | string | null;
  event_id: EventId | null;
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
  created_by_id?: string | null;
};

const getEventKey = (eventId: EventId | null | undefined) => {
  if (eventId == null) return null;
  return String(eventId);
};

export async function POST(request: NextRequest) {
  const totalStart = performance.now();

  try {
    console.log("[dashboard-data] start");

    // 環境変数チェック
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error: "環境変数が未設定です",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const bodyStart = performance.now();
    const body = await request.json();
    console.log(
      "[dashboard-data] request.json:",
      Math.round(performance.now() - bodyStart),
      "ms",
    );

    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // 1. notes と tags を同時に取得
    const dbStart = performance.now();

    const [notesResult, tagsResult] = await Promise.all([
      supabase
        .from("notes")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", { ascending: false }),

      supabase
        .from("tags")
        .select("*")
        .eq("owner_id", user_id),
    ]);

    const { data: notes, error: notesError } = notesResult;
    const { data: tags, error: tagsError } = tagsResult;

    console.log(
      "[dashboard-data] notes + tags fetch:",
      Math.round(performance.now() - dbStart),
      "ms",
      {
        notesCount: notes?.length ?? 0,
        tagsCount: tags?.length ?? 0,
      },
    );

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

    const typedNotes = (notes ?? []) as NoteRow[];
    const typedTags = (tags ?? []) as TagRow[];

    // 2. events テーブル取得
    let events: EventRow[] = [];
    if (typedNotes.length > 0) {
      const eventsStart = performance.now();

      const eventIds = [
        ...new Set(
          typedNotes
          .map((note) => note.event_id)
          .filter((id): id is EventId => id != null),
        ),
      ];

      if (eventIds.length > 0) {
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, organizer")
          .in("event_id", eventIds);

        if (eventsError) {
          console.error("[dashboard-data] eventsError:", eventsError);
        } else {
          events = (eventsData ?? []) as EventRow[];
        }
      }

      console.log(
        "[dashboard-data] events fetch:",
        Math.round(performance.now() - eventsStart),
        "ms",
        {
          eventIdsCount: eventIds.length,
          eventsCount: events.length,
        },
      );
    }

    // データが空の場合は空のレスポンスを返す
    if ((!notes || notes.length === 0) && (!tags || tags.length === 0)) {
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

    // 3. find/filter を減らすための Map を作る
    const mapStart = performance.now();

    const eventMap = new Map<string, EventRow>();

    for (const event of events) {
      const eventKey = getEventKey(event.event_id);

      if (eventKey) {
        eventMap.set(eventKey, event);
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

    // 4. タグ別割合の計算
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

    // 5. 週ごとの参加数計算（イベント開催日ベース）
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

    // notesの実際のイベント開催日を使用
    if (typedNotes.length > 0) {
      typedNotes.forEach((note) => {
        const eventKey = getEventKey(note.event_id);
        const relatedEvent = eventKey ? eventMap.get(eventKey) : undefined;

        let eventDate: string | null = null;
        if (relatedEvent?.started_at) {
          eventDate = relatedEvent.started_at;
        } else {
          const possibleDates = [
            note.updated_at,
            note.created_at,
            note.date,
            note.event_date,
          ].filter((d): d is string => typeof d === "string" && d.trim() !== "");

          const firstPossibleDate = possibleDates[0];

          if (firstPossibleDate) {
            eventDate = firstPossibleDate;
          }
        }

        if (eventDate) {
          try {
            let date = new Date(eventDate);

            // UTC時刻の場合、日本時間に調整
            if (eventDate.includes("T") && eventDate.includes("Z")) {
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

    // 6. 最近のイベント履歴作成
    const recentEventsStart = performance.now();

    const recentEvents = typedNotes.map((note, index) => {
    const eventKey = getEventKey(note.event_id);
    const relatedEvent = eventKey ?  eventMap.get(eventKey) : undefined;

      return {
        id: relatedEvent?.id ?? null,
        noteId: note.id,
        externalEventId: note.event_id ?? null,
        title: relatedEvent?.title || `イベント #${note.event_id || index + 1}`,
        date: formatEventDate(
          relatedEvent?.started_at || note.updated_at || note.created_at,
        ),
        time: formatEventTime(relatedEvent?.started_at, relatedEvent?.ended_at),
        type: "イベント",
        organizer: getOrganizerName(relatedEvent),
        venue: relatedEvent?.place || "オンライン",
        tags: eventKey ? (tagsMap.get(eventKey) ?? []).slice(0, 3) : [],
        description: note.note || "メモはありません",
        event_description:
          relatedEvent?.catch ||
          (relatedEvent?.description
            ? relatedEvent.description.replace(/<[^>]*>/g, "").slice(0, 100) +
              "..."
            : "イベントの概要はありません"),
        event_url:
          relatedEvent?.event_url ||
          (note.event_id ? `https://connpass.com/event/${note.event_id}/` : ""),
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