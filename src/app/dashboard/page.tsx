'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    ExternalLink,
    LayoutDashboard,
    CalendarDays,
    UserRound,
    MapPinned,
    Tag,
    PenTool,
    X,
    ChevronsLeft,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

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

    recentEvents: Array<{
        id: number;
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
    }>;
}

export default function DashboardPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [dataSource, setDataSource] = useState<'real' | 'fallback'>('fallback');
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        ],
        recentEvents: [
            {
                id: 1,
                title: 'フォールバックデータ #1',
                date: '2025年5月7日（水）',
                time: '19:00〜21:00',
                type: 'React勉強会',
                organizer: 'フォールバックデータorganizer #1',
                venue: 'オンライン',
                tags: ['React', 'JavaScript', 'フロントエンド'],
                description: 'フォールバックデータ #1のdescriptionです。',
                event_description: 'フォールバックデータ #1のevent_descriptionです。',
                url: 'https://connpass.com/event/123456/',
                event_url: 'https://connpass.com/event/123456/'
            },
            {
                id: 2,
                title: 'フォールバックデータ #2',
                date: '2025年5月7日（水）',
                time: '19:00〜21:00',
                type: 'Vue.js勉強会',
                organizer: 'フォールバックデータorganizer #2',
                venue: 'オンライン',
                tags: ['Vue.js', 'JavaScript', 'フロントエンド'],
                description: 'フォールバックデータ #2のdescriptionです。',
                event_description: 'フォールバックデータ #2のevent_descriptionです。',
                url: 'https://connpass.com/event/123457/',
                event_url: 'https://connpass.com/event/123457/'
            },
            {
                id: 3,
                title: 'フォールバックデータ #3',
                date: '2025年5月7日（水）',
                time: '19:00〜21:00',
                type: 'Node.js勉強会',
                organizer: 'フォールバックデータorganizer #3',
                venue: 'オンライン',
                tags: ['Node.js', 'JavaScript', 'バックエンド'],
                description: 'フォールバックデータ #3のdescriptionです。',
                event_description: 'フォールバックデータ #3のevent_descriptionです。',
                url: 'https://connpass.com/event/123458/',
                event_url: 'https://connpass.com/event/123458/'
            },
            {
                id: 4,
                title: 'フォールバックデータ #4',
                date: '2025年5月6日（火）',
                time: '19:00〜21:00',
                type: 'Python勉強会',
                organizer: 'フォールバックデータorganizer #4',
                venue: 'オンライン',
                tags: ['Python', 'データサイエンス', 'AI'],
                description: 'フォールバックデータ #4のdescriptionです。',
                event_description: 'フォールバックデータ #4のevent_descriptionです。',
                url: 'https://connpass.com/event/123459/',
                event_url: 'https://connpass.com/event/123459/'
            },
            {
                id: 5,
                title: 'フォールバックデータ #5',
                date: '2025年5月5日（月）',
                time: '19:00〜21:00',
                type: 'TypeScript勉強会',
                organizer: 'フォールバックデータorganizer #5',
                venue: 'オンライン',
                tags: ['TypeScript', 'JavaScript', 'フロントエンド'],
                description: 'フォールバックデータ #5のdescriptionです。',
                event_description: 'フォールバックデータ #5のevent_descriptionです。',
                url: 'https://connpass.com/event/123460/',
                event_url: 'https://connpass.com/event/123460/'
            },
            {
                id: 6,
                title: 'フォールバックデータ #6',
                date: '2025年5月4日（日）',
                time: '14:00〜16:00',
                type: 'Go勉強会',
                organizer: 'フォールバックデータorganizer #6',
                venue: 'オンライン',
                tags: ['Go', 'バックエンド', 'サーバー'],
                description: 'フォールバックデータ #6のdescriptionです。',
                event_description: 'フォールバックデータ #6のevent_descriptionです。',
                url: 'https://connpass.com/event/123461/',
                event_url: 'https://connpass.com/event/123461/'
            }
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

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

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
                data.weeklyParticipation.length === 0 &&
                data.recentEvents.length === 0
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

    const handleViewAllEvents = () => {
        router.push('/events');
    };

    const handleEditEvent = (eventId: number) => {
        setIsModalOpen(false);

        setTimeout(() => {
            setSuccessMessage(`イベント（ID: ${eventId}）の編集ページに移動しました。\n※編集機能は開発中です。`);
        }, 300);

        console.log('編集機能:', `イベントID ${eventId} を編集します`);
    };

    const handleDeleteEvent = () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteEvent = async () => {
        if (!selectedEvent) return;

        try {
            setIsDeleting(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            if (stats) {
                const updatedEvents = stats.recentEvents.filter(event => event.id !== selectedEvent.id);
                setStats({
                    ...stats,
                    recentEvents: updatedEvents
                });
            }

            console.log('イベントが削除されました:', selectedEvent.id);
            setSuccessMessage(`「${selectedEvent.title}」を削除しました。`);

            setIsModalOpen(false);
            setIsDeleteConfirmOpen(false);
            setSelectedEvent(null);

        } catch (error) {
            console.error('削除エラー:', error);
            setSuccessMessage('削除処理でエラーが発生しました。');
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDeleteEvent = () => {
        setIsDeleteConfirmOpen(false);
    };

    if (!mounted) return null;
    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-600">ログイン状態を確認中...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center">
                    <div className="flex items-center justify-end w-full">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#FF8C42' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">ダッシュボード</h1>
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
                            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm animate-pulse">
                                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 md:h-20 bg-gray-100 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : stats ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">タグ別割合</h3>
                                    <div className="h-48 md:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.tagDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    className="md:!inner-radius-[60] md:!outer-radius-[100]"
                                                >
                                                    {stats.tagDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [`${value}%`, '']}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '6px',
                                                        fontSize: '14px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {stats.tagDistribution.map((item, index) => (
                                            <div key={index} className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                ></div>
                                                <span className="text-xs md:text-sm text-gray-700 truncate">
                                                    {item.name}({item.value}%)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10 lg:mb-20">週ごとの参加数</h3>
                                    <div className="h-48 md:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.weeklyParticipation} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis
                                                    dataKey="week"
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                    axisLine={{ stroke: '#e5e7eb' }}
                                                    className="md:!text-xs"
                                                />
                                                <YAxis
                                                    tick={{ fill: '#6b7280', fontSize: 10 }}
                                                    axisLine={{ stroke: '#e5e7eb' }}
                                                    allowDecimals={false}
                                                    domain={[0, 'dataMax']}
                                                    className="md:!text-xs"
                                                />
                                                <Tooltip
                                                    formatter={(value) => [`${value}件`, '']}
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '6px',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="count"
                                                    fill="#ee7800"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
                                <div className="flex justify-between items-center mb-6 md:mb-10">
                                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">イベント履歴</h3>
                                </div>
                                <div className="space-y-3 md:space-y-4">
                                    {stats.recentEvents.slice(0, 5).map((event) => (
                                        <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 lg:p-10 mb-4 md:mb-6 lg:mb-9 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-13 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                            <span className="text-sm md:text-base text-gray-500">{event.date}</span>
                                                            <span className="text-sm md:text-base text-gray-500">{event.time}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <UserRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                            <span className="px-2 py-0.5 text-gray-700 text-sm md:text-base rounded truncate">
                                                                {event.organizer}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={event.event_url || event.url || 'https://example.com'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-gray-900 mb-3 md:mb-4 mt-2 md:mt-4 text-lg md:text-xl hover:text-red-600 cursor-pointer block line-clamp-2"
                                                    >
                                                        {event.title}
                                                    </a>

                                                    <div className="flex items-center gap-2 mb-3 md:mb-5">
                                                        <MapPinned className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                        <span className="text-sm md:text-base text-gray-500 truncate">{event.venue}</span>
                                                    </div>

                                                    <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-5 line-clamp-3">
                                                        {event.event_description}
                                                    </p>

                                                    <div className="flex items-start gap-2">
                                                        <Tag className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                                                        <div className="flex flex-wrap gap-1 md:gap-2">
                                                            {event.tags.slice(0, 3).map((tag, index) => (
                                                                <div key={index} className="flex items-center gap-1 px-3 md:px-4 lg:px-6 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm lg:text-base rounded-full">
                                                                    <span className="truncate">{tag}</span>
                                                                </div>
                                                            ))}
                                                            {event.tags.length > 3 && (
                                                                <div className="flex items-center px-3 md:px-4 py-1 bg-gray-200 text-gray-600 text-xs md:text-sm rounded-full">
                                                                    +{event.tags.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:ml-4 md:self-start">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedEvent(event);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="w-full md:w-auto p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                                                        title="詳細を表示"
                                                    >
                                                        <ExternalLink className="w-4 md:w-5 h-4 md:h-5" />
                                                        <span className="md:hidden ml-2 text-sm">詳細</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {stats.recentEvents.length > 0 && (
                                        <div className="flex justify-center pt-4 md:pt-6">
                                            <button
                                                onClick={handleViewAllEvents}
                                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
                                            >
                                                <ChevronsLeft className="w-4 h-4" />
                                                {stats.recentEvents.length > 5 ? 'すべてのイベントを見る' : 'イベント一覧へ'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">データの読み込みに失敗しました</div>
                    )}
                </main>
            </div>

            {isModalOpen && selectedEvent && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                >
                    <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative mx-2 md:mx-0">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 md:top-6 right-3 md:right-6 text-gray-400 hover:text-gray-600 p-2 z-10"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        <div className="p-4 md:p-8 lg:p-30">
                            <div className="flex justify-between items-start mb-4 pr-8">
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-13 mb-4 md:mb-6">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-sm md:text-base text-gray-500">{selectedEvent.date}</span>
                                            <span className="text-sm md:text-base text-gray-500">{selectedEvent.time}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <UserRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                            <span className="text-gray-700 text-sm md:text-base">
                                                {selectedEvent.organizer}
                                            </span>
                                        </div>
                                    </div>
                                    <a
                                        href={selectedEvent.event_url || selectedEvent.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 mt-2 md:mt-4 hover:text-red-600 cursor-pointer block"
                                    >
                                        {selectedEvent.title}
                                    </a>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MapPinned className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-sm md:text-base text-gray-500">{selectedEvent.venue}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 whitespace-pre-wrap">
                                {selectedEvent.event_description}
                            </p>
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <h3 className="text-sm md:text-base font-bold text-gray-900">タグ</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEvent.tags.map((tag: string, index: number) => (
                                        <div key={index} className="px-3 md:px-4 lg:px-6 py-1 bg-gray-100 text-gray-700 text-sm md:text-base rounded-full">
                                            <span>{tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4 mt-6 md:mt-8">
                                    <PenTool className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <h3 className="text-sm md:text-base font-bold text-gray-900">メモ</h3>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-center gap-3 mt-8 md:mt-15">
                                <button
                                    onClick={() => handleEditEvent(selectedEvent.id)}
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    編集
                                </button>
                                <button
                                    onClick={handleDeleteEvent}
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteConfirmOpen && selectedEvent && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-[60] p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                >
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                イベントを削除しますか？
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-2">
                                「{selectedEvent.title}」を削除します。
                            </p>
                            <p className="text-sm text-red-600 text-center mb-6">
                                この操作は取り消すことができません。
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={cancelDeleteEvent}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={confirmDeleteEvent}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            削除中...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            削除
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}