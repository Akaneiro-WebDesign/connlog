"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/UserProvider";
import Sidebar from "@/components/Sidebar";
import EventListComponent from "@/components/EventListComponent";
import { CalendarClock, CheckCircle, Search, Meh } from "lucide-react";
import { Header } from "@/components/Header";

type RecentEvent = {
  id: number | null;
  noteId: string | null;
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
  recentEvents: RecentEvent[];
}

const isEmptyEventsStats = (data: DashboardStats) => {
  return data.recentEvents.length === 0;
};

export default function EventsPage() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dataSource, setDataSource] = useState<"real" | "empty">("empty");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const userId = user?.id;

  const loadDashboardData = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setApiError(null);

      if (process.env.NODE_ENV === "development") {
        console.log("[events] loadDashboardData called:", {
          userId: targetUserId,
          time: new Date().toISOString(),
        });
      }
      const response = await fetch("/api/dashboard-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: targetUserId,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `API呼び出しエラー: ${response.status} ${response.statusText}`,
        );
      }
      const data = (await response.json()) as DashboardStats;
      const recentEvents = data.recentEvents ?? [];
      const nextStats = { recentEvents };

      if (isEmptyEventsStats(nextStats)) {
        setDataSource("empty");
        setStats(nextStats);
      } else {
        setDataSource("real");
        setStats(nextStats);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "データ取得エラー";
      console.error("データ取得エラー:", error);

      setApiError(errorMessage);
      setDataSource("empty");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user, isLoading, mounted, router]);

  useEffect(() => {
    if (!mounted || isLoading || !userId) return;
    loadDashboardData(userId);
  }, [mounted, isLoading, userId, loadDashboardData]);

  const confirmDeleteEvent = async (event: RecentEvent) => {
    try {
      setIsDeleting(true);

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

      if (stats) {
        const updatedEvents = stats.recentEvents.filter(
          (item) => item.noteId !== event.noteId,
        );
        setStats({ recentEvents: updatedEvents });

        if (updatedEvents.length === 0) {
          setDataSource("empty");
        }
      }
      setSuccessMessage(`「${event.title}」を削除しました。`);

      if (userId) {
        await loadDashboardData(userId);
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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        ログイン状態を確認中...
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <CalendarClock className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              イベント履歴
            </h1>
          </div>

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
                      時間をおいて再読み込みするか、ログイン状態を確認してください。
                    </span>
                  </div>
                </div>
              </div>
            )}
            {!loading && !apiError && dataSource === "real" && (
              <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                <div className="text-sm">
                  <span className="text-green-800">
                    <strong>実データ表示中:</strong>{" "}
                    Supabaseから最新データを取得しました。
                  </span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4 md:space-y-6">
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
          ) : stats && dataSource === "empty" ? (
            <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <Meh className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                保存したイベントはまだありません
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
                参加した勉強会や気になるイベントを保存すると、ここでタグやメモと一緒に振り返れます。
              </p>
              <button
                type="button"
                onClick={() => router.push("/search")}
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                <Search className="h-4 w-4 mr-2" />
                イベントを検索する
              </button>
            </div>
          ) : stats ? (
            <EventListComponent
              events={stats.recentEvents}
              maxDisplayCount={20}
              showViewAllButton={false}
              showHeader={false}
              showContainer={false}
              showPagination={true}
              onEdit={() => {}}
              onDelete={confirmDeleteEvent}
              isDeleting={isDeleting}
            />
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
