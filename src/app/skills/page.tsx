"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/components/UserProvider";
import Sidebar from "@/components/Sidebar";
import TagChartComponent from "@/components/TagChartComponent";
import WeeklyChartComponent from "@/components/WeeklyChartComponent";
import { ChartPie, Search } from "lucide-react";
import { Header } from "@/components/Header";

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
}

const isEmptySkillsStats = (data: DashboardStats) => {
  const hasTagDistribution = data.tagDistribution.length > 0;
  const hasWeeklyParticipation = data.weeklyParticipation.some(
    (item) => item.count > 0,
  );

  return !hasTagDistribution && !hasWeeklyParticipation;
};

export default function SkillsPage() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dataSource, setDataSource] = useState<"real" | "empty">("empty");
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const userId = user?.id;

  const loadDashboardData = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setApiError(null);
      if (process.env.NODE_ENV === "development") {
        console.log("[skills] loadDashboardData called:", {
          userId: targetUserId,
          time: new Date().toISOString(),
        });
      }

      const response = await fetch("/api/dashboard-data", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `API呼び出しエラー: ${response.status} ${response.statusText}`,
        );
      }
      const data = (await response.json()) as DashboardStats;
      const nextStats: DashboardStats = {
        tagDistribution: data.tagDistribution ?? [],
        weeklyParticipation: data.weeklyParticipation ?? [],
      };

      if (isEmptySkillsStats(nextStats)) {
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
            <ChartPie className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              スキル分析
            </h1>
          </div>
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
            </div>
          ) : stats && dataSource === "empty" ? (
            <div className="bg-white rounded-lg p-6 md:p-10 shadow-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50">
                <ChartPie className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                スキル分析はまだありません
              </h2>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">
                イベントにタグを付けて保存すると、学習テーマの傾向や参加ペースがここに表示されます。
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
