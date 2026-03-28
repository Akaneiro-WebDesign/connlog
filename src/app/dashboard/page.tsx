"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/components/UserProvider";
import Sidebar from "@/components/Sidebar";
import { Header } from "@/components/Header";
import EventListComponent from "@/components/EventListComponent";
import TagChartComponent from "@/components/TagChartComponent";
import WeeklyChartComponent from "@/components/WeeklyChartComponent";
import { CheckCircle } from "lucide-react";

type RecentEvent = {
  id: number | null;
  noteId: string;
  externalEventId?: number | null;
  title: string;
  date: string;
  time: string;
  type: string;
  organizer: string;
  venue: string;
  tags: string[];
  description: string;
  event_description: string;
  url?: string;
  event_url?: string;
};

interface DashboardStats {
  tagDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  weeklyParticipation: Array<{
    week: string;
    count: number;
  }>;
  recentEvents: RecentEvent[];
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dataSource, setDataSource] = useState<"real" | "fallback">("fallback");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const fallbackData: DashboardStats = {
    tagDistribution: [
      { name: "React", value: 25, color: "#DC2626" },
      { name: "LT発表", value: 24, color: "#F97316" },
      { name: "もくもく会", value: 19, color: "#EAB308" },
      { name: "Rails", value: 13, color: "#22C55E" },
      { name: "PHP", value: 10, color: "#3B82F6" },
      { name: "その他", value: 9, color: "#9E9E9E" },
    ],
    weeklyParticipation: [
      { week: "4週間前", count: 8 },
      { week: "3週間前", count: 12 },
      { week: "2週間前", count: 15 },
      { week: "先週", count: 10 },
      { week: "今週", count: 5 },
    ],
    recentEvents: [
      {
        id: 1,
        noteId: "fallback-note-1",
        externalEventId: 100001,
        title: "フォールバックデータ #1",
        date: "2025年5月7日（水）",
        time: "19:00〜21:00",
        type: "React勉強会",
        organizer: "フォールバックデータorganizer #1",
        venue: "オンライン",
        tags: ["React", "JavaScript", "フロントエンド"],
        description: "フォールバックデータ #1のdescriptionです。",
        event_description: "フォールバックデータ #1のevent_descriptionです。",
        url: "https://connpass.com/event/123456/",
        event_url: "https://connpass.com/event/123456/",
      },
      {
        id: 2,
        noteId: "fallback-note-2",
        externalEventId: 100002,
        title: "フォールバックデータ #2",
        date: "2025年5月7日（水）",
        time: "19:00〜21:00",
        type: "Vue.js勉強会",
        organizer: "フォールバックデータorganizer #2",
        venue: "オンライン",
        tags: ["Vue.js", "JavaScript", "フロントエンド"],
        description: "フォールバックデータ #2のdescriptionです。",
        event_description: "フォールバックデータ #2のevent_descriptionです。",
        url: "https://connpass.com/event/123457/",
        event_url: "https://connpass.com/event/123457/",
      },
      {
        id: 3,
        noteId: "fallback-note-3",
        externalEventId: 100003,
        title: "フォールバックデータ #3",
        date: "2025年5月7日（水）",
        time: "19:00〜21:00",
        type: "Node.js勉強会",
        organizer: "フォールバックデータorganizer #3",
        venue: "オンライン",
        tags: ["Node.js", "JavaScript", "バックエンド"],
        description: "フォールバックデータ #3のdescriptionです。",
        event_description: "フォールバックデータ #3のevent_descriptionです。",
        url: "https://connpass.com/event/123458/",
        event_url: "https://connpass.com/event/123458/",
      },
      {
        id: 4,
        noteId: "fallback-note-4",
        externalEventId: 100004,
        title: "フォールバックデータ #4",
        date: "2025年5月6日（火）",
        time: "19:00〜21:00",
        type: "Python勉強会",
        organizer: "フォールバックデータorganizer #4",
        venue: "オンライン",
        tags: ["Python", "データサイエンス", "AI"],
        description: "フォールバックデータ #4のdescriptionです。",
        event_description: "フォールバックデータ #4のevent_descriptionです。",
        url: "https://connpass.com/event/123459/",
        event_url: "https://connpass.com/event/123459/",
      },
      {
        id: 5,
        noteId: "fallback-note-5",
        externalEventId: 100005,
        title: "フォールバックデータ #5",
        date: "2025年5月5日（月）",
        time: "19:00〜21:00",
        type: "TypeScript勉強会",
        organizer: "フォールバックデータorganizer #5",
        venue: "オンライン",
        tags: ["TypeScript", "JavaScript", "フロントエンド"],
        description: "フォールバックデータ #5のdescriptionです。",
        event_description: "フォールバックデータ #5のevent_descriptionです。",
        url: "https://connpass.com/event/123460/",
        event_url: "https://connpass.com/event/123460/",
      },
      {
        id: 6,
        noteId: "fallback-note-6",
        externalEventId: 100006,
        title: "フォールバックデータ #6",
        date: "2025年5月4日（日）",
        time: "14:00〜16:00",
        type: "Go勉強会",
        organizer: "フォールバックデータorganizer #6",
        venue: "オンライン",
        tags: ["Go", "バックエンド", "サーバー"],
        description: "フォールバックデータ #6のdescriptionです。",
        event_description: "フォールバックデータ #6のevent_descriptionです。",
        url: "https://connpass.com/event/123461/",
        event_url: "https://connpass.com/event/123461/",
      },
    ],
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading || !user?.id) return;
    loadDashboardData(user.id);
  }, [mounted, isLoading, user?.id]);

  const loadDashboardData = async (userId: string) => {
    try {
      setLoading(true);
      setApiError(null);

      console.log("[dashboard] loadDashboardData called:", {
        userId,
        time: new Date().toISOString(),
      });

      const response = await fetch("/api/dashboard-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API呼び出しエラー: ${response.status} ${response.statusText}`,
        );
      }
      const data: DashboardStats = await response.json();

      if (
        data.tagDistribution.length === 0 &&
        data.weeklyParticipation.length === 0 &&
        data.recentEvents.length === 0
      ) {
        setDataSource("fallback");
        setStats(fallbackData);
      } else {
        setDataSource("real");
        setStats(data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "データ取得エラー";
      console.error("データ取得エラー:", error);
      setApiError(errorMessage);
      setDataSource("fallback");
      setStats(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllEvents = () => {
    router.push("/events");
  };

  const handleEditEvent = (eventId: number) => {
    setTimeout(() => {
      setSuccessMessage(
        `イベント（ID: ${eventId}）の編集ページに移動しました。\n※編集機能は開発中です。`,
      );
    }, 300);
  };

  const confirmDeleteEvent = async (event: {
    id: number | null;
    noteId: string;
    externalEventId?: number | null;
    title: string;
  }) => {
    try {
      setIsDeleting(true);

      // APIを呼び出して削除
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: event.id,
          note_id: event.noteId,
          external_event_id: event.externalEventId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "削除に失敗しました");
      }

      // 成功したらUIを更新
      if (stats) {
        const updatedEvents = stats.recentEvents.filter(
          (item) => item.noteId !== event.noteId,
        );
        setStats({ ...stats, recentEvents: updatedEvents });
      }

      setSuccessMessage(`「${event.title}」を削除しました。`);

      // データを再読み込み
      if (user?.id) {
        await loadDashboardData(user.id);
      }
    } catch (error) {
      console.error("削除エラー:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "削除処理でエラーが発生しました。";
      setSuccessMessage(`エラー: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) return null;
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        ログイン状態を確認中...
      </div>
    );
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="ダッシュボード" />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
          {successMessage && (
            <div className="mb-4 md:mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-green-800 text-sm whitespace-pre-line">
                    {successMessage}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 md:mb-6 space-y-2">
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-red-800 text-sm">
                    <strong>API エラー:</strong> {apiError}
                    <br />
                    <span className="text-red-600">
                      フォールバックデータを表示しています。
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!loading && !apiError && (
              <div
                className={`border rounded-lg p-3 ${
                  dataSource === "real"
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="text-sm">
                  {dataSource === "real" ? (
                    <span className="text-green-800">
                      <strong>実データ表示中:</strong>{" "}
                      Supabaseから最新データを取得しました。
                    </span>
                  ) : (
                    <span className="text-blue-800">
                      <strong>デモデータ表示中:</strong>
                      登録データがないため、サンプルデータを表示しています。
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-48 md:h-64 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-48 md:h-64 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 md:h-20 bg-gray-100 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <TagChartComponent
                  data={stats.tagDistribution}
                  title="タグ別割合"
                  showLegend={true}
                />
                <WeeklyChartComponent
                  data={stats.weeklyParticipation}
                  title="週ごとの参加数"
                  barColor="#ee7800"
                />
              </div>
              <EventListComponent
                events={stats.recentEvents}
                maxDisplayCount={5}
                showViewAllButton={true}
                onViewAll={handleViewAllEvents}
                onEdit={handleEditEvent}
                onDelete={confirmDeleteEvent}
                isDeleting={isDeleting}
              />
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              データの読み込みに失敗しました
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
