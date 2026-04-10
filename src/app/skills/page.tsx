'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import TagChartComponent from '@/components/TagChartComponent';
import WeeklyChartComponent from '@/components/WeeklyChartComponent';
import {
    ChartPie
} from 'lucide-react';
import { Header } from '@/components/Header';

interface DashboardStats {
    tagDistribution: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    weeklyParticipation: Array<{
        week: string;
        count: number;
    }>
}

export default function SkillsPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [dataSource, setDataSource] = useState<'real' | 'fallback'>('fallback');
    const [apiError, setApiError] = useState<string | null>(null);
    const router = useRouter();

    const fallbackData: DashboardStats = {
        tagDistribution: [
            { name: 'React', value: 25, color: '#DC2626' },
            { name: 'LT発表', value: 24, color: '#F97316' },
            { name: 'もくもく会', value: 19, color: '#EAB308' },
            { name: 'Rails', value: 13, color: '#22C55E' },
            { name: 'PHP', value: 10, color: '#3B82F6' },
            { name: 'その他', value: 9, color: '#9E9E9E' }
        ],
        weeklyParticipation: [
            { week: '4週間前', count: 8 },
            { week: '3週間前', count: 12 },
            { week: '2週間前', count: 15 },
            { week: '先週', count: 10 },
            { week: '今週', count: 5 }
        ]
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoading || !mounted) return;
        if (!user) {
            router.replace('/login');
            return;
        }
    }, [user, isLoading, mounted, router]);

    useEffect(() => {
        if (!user) return;
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setApiError(null);

            const response = await fetch('/api/dashboard-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id
                })
            });

            if (!response.ok) {
                throw new Error(`API呼び出しエラー: ${response.status} ${response.statusText}`);
            }
            const data: DashboardStats = await response.json();

            if (
                data.tagDistribution.length === 0 &&
                data.weeklyParticipation.length === 0
            ) {
                console.log('データが空のため、フォールバックデータを使用します');
                setDataSource('fallback');
                setStats(fallbackData);
            } else {
                console.log('実データを取得しました:', data);
                setDataSource('real');
                setStats(data);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ?
                error.message : 'データ取得エラー';
            console.error('データ取得エラー:', error);
            setApiError(errorMessage);
            setDataSource('fallback');
            setStats(fallbackData);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;
    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-600">ログイン状態を確認中...</div>;
    if (!user) return null;


    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
            <Header />
                <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <ChartPie className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">スキル分析</h1>
                    </div>
                    <div className="mb-4 md:mb-6 space-y-2">
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center">
                                    <div className="text-red-800 text-sm">
                                        <strong>API エラー:</strong> {apiError}
                                        <br />
                                        <span className="text-red-600">フォールバックデータを表示しています。</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!loading && !apiError && (
                            <div className={`border rounded-lg p-3 ${dataSource === 'real'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-blue-50 border-blue-200'
                                }`}>
                                <div className="text-sm">
                                    {dataSource === 'real' ? (
                                        <span className="text-green-800">
                                            <strong>実データ表示中:</strong> Supabaseから最新データを取得しました。
                                        </span>
                                    ) : (
                                        <span className="text-blue-800">
                                            <strong>デモデータ表示中:</strong>登録データがないため、サンプルデータを表示しています。
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
                        <div className="text-center py-8 text-gray-500">データの読み込みに失敗しました</div>
                    )}
                </main>
            </div>
        </div>
    );
}