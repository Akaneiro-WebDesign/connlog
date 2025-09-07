import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Color palette for tags
const TAG_COLORS = [
    '#DC2626', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#9E9E9E', '#8B5CF6', '#EC4899'
];

export async function POST(request: NextRequest) {
    try {
        // 環境変数チェック
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                error: '環境変数が未設定です'
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const body = await request.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // 1. notesテーブル取得
        const { data: notes, error: notesError } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user_id)
            .order('updated_at', { ascending: false });

        if (notesError) {
            return NextResponse.json({
                error: 'Failed to fetch notes data'
            }, { status: 500 });
        }
        // 2. tagsテーブル取得
        const { data: tags, error: tagsError } = await supabase
            .from('tags')
            .select('*')
            .eq('owner_id', user_id);

        if (tagsError) {
            return NextResponse.json({
                error: 'Failed to fetch tags data'
            }, { status: 500 });
        }

        // 3. eventsテーブル取得
        let events: any[] = [];
        if (notes && notes.length > 0) {
            const eventIds = [...new Set(notes.map(note => note.event_id).filter(id => id != null))];

            if (eventIds.length > 0) {
                const { data: eventsData, error: eventsError } = await supabase
                    .from('events')
                    .select('*, organizer')
                    .in('event_id', eventIds);

                if (!eventsError) {
                    events = eventsData || [];
                }
            }
        }

        // データが空の場合は空のレスポンスを返す
        if ((!notes || notes.length === 0) && (!tags || tags.length === 0)) {
            return NextResponse.json({
                tagDistribution: [],
                weeklyParticipation: [],
                recentEvents: []
            });
        }

        // 4. タグ別割合の計算
        const tagCount: Record<string, number> = {};

        if (tags && tags.length > 0) {
            tags.forEach((tag: any) => {
                const tagName = tag.tag_name || tag.name || 'Unknown';
                tagCount[tagName] = (tagCount[tagName] || 0) + 1;
            });
        }

        const totalTags = Object.values(tagCount).reduce((sum, count) => sum + count, 0);
        const tagDistribution = Object.entries(tagCount)
            .map(([name, count], index) => ({
                name,
                value: totalTags > 0 ? Math.round((count / totalTags) * 100) : 0,
                color: TAG_COLORS[index % TAG_COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);

        // 5. 週ごとの参加数計算（イベント開催日ベース）
        const weeklyCount: Record<string, number> = {};
        const now = new Date();

        // 過去5週間の初期化
        for (let i = 4; i >= 0; i--) {
            const weekDate = new Date(now);
            weekDate.setDate(now.getDate() - (i * 7));
            const weekKey = getWeekKey(weekDate);
            weeklyCount[weekKey] = 0;
        }

        // notesの実際のイベント開催日を使用
        if (notes && notes.length > 0) {
            notes.forEach((note: any) => {
                // 対応するイベントの開催日を取得
                const relatedEvent = events.find(event => event.event_id === note.event_id);

                let eventDate = null;
                if (relatedEvent?.started_at) {
                    eventDate = relatedEvent.started_at;
                } else {
                    // イベント開催日が見つからない場合はノートの作成日を使用
                    const possibleDates = [
                        note.updated_at,
                        note.created_at,
                        note.date,
                        note.event_date
                    ].filter(d => d != null && d !== '');

                    if (possibleDates.length > 0) {
                        eventDate = possibleDates[0];
                    }
                }

                if (eventDate) {
                    try {
                        let date = new Date(eventDate);

                        // UTC時刻の場合、日本時間に調整
                        if (eventDate.includes('T') && eventDate.includes('Z')) {
                            date = new Date(date.getTime() + (9 * 60 * 60 * 1000));
                        }

                        if (!isNaN(date.getTime())) {
                            const weekKey = getWeekKey(date);

                            if (weekKey in weeklyCount) {
                                weeklyCount[weekKey]++;
                            } else {
                                // 範囲外の場合、最新週に追加
                                const latestWeekKey = Object.keys(weeklyCount).sort().pop();
                                const latestWeekDate = parseWeekKey(latestWeekKey!);
                                if (date >= latestWeekDate) {
                                    weeklyCount[latestWeekKey!]++;
                                }
                            }
                        }
                    } catch (error) {
                        // 日付解析エラーは無視
                    }
                }
            });
        }

        // 5. 週別データに変換
        const sortedWeekKeys = Object.keys(weeklyCount).sort();
        const weeklyParticipation = [
            { week: '4週間前', count: weeklyCount[sortedWeekKeys[0]] || 0 },
            { week: '3週間前', count: weeklyCount[sortedWeekKeys[1]] || 0 },
            { week: '2週間前', count: weeklyCount[sortedWeekKeys[2]] || 0 },
            { week: '先週', count: weeklyCount[sortedWeekKeys[3]] || 0 },
            { week: '今週', count: weeklyCount[sortedWeekKeys[4]] || 0 }
        ];

        // 6. connpass APIから主催者情報を取得
        if (events && events.length > 0) {
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                if (event.event_id) {
                    try {
                        const connpassResponse = await fetch(
                            `https://connpass.com/api/v2/events/?event_id=${event.event_id}`,
                            {
                                headers: {
                                    'X-API-Key': process.env.CONNPASS_API_KEY || '',
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (connpassResponse.ok) {
                            const connpassData = await connpassResponse.json();

                            if (connpassData.events && connpassData.events.length > 0) {
                                const connpassEvent = connpassData.events[0];

                                // connpass APIから取得した主催者情報を統合
                                event.connpass_owner_text = connpassEvent.owner_text;
                            }
                        } else if (connpassResponse.status === 429) {
                            // Rate Limitの場合は少し待機してスキップ
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }

                        // API制限対策：各リクエスト間に待機
                        if (i < events.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }

                    } catch (error) {
                        // エラーの場合はスキップして続行
                        console.error(`connpass API error for event ${event.event_id}:`, error);
                    }
                }
            }
        }

        // 7. 最近のイベント履歴作成
        const recentEvents = (notes || []).map((note: any, index: number) => {
            const relatedEvent = events.find(event => event.event_id === note.event_id);
        
            return {
                id: note.id || index + 1,
                title: relatedEvent?.title || `イベント #${note.event_id || index + 1}`,
                date: formatEventDate(relatedEvent?.started_at || note.updated_at || note.created_at),
                // 🔧 修正: ended_at も渡す
                time: formatEventTime(relatedEvent?.started_at, relatedEvent?.ended_at),
                type: 'イベント',
                organizer: getOrganizerName(relatedEvent),
                venue: relatedEvent?.place || 'オンライン',
                tags: getEventTags(note.event_id, tags),
                description: note.note || 'メモはありません',
                event_description: relatedEvent?.catch || (relatedEvent?.description ? relatedEvent.description.replace(/<[^>]*>/g, '').slice(0, 100) + '...' : 'イベントの概要はありません'),
                event_url: relatedEvent?.event_url || `https://connpass.com/event/${relatedEvent?.event_id}/`
            };
        });

        const dashboardStats = {
            tagDistribution,
            weeklyParticipation,
            recentEvents
        };

        return NextResponse.json(dashboardStats);

    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
    const month = (monday.getMonth() + 1).toString().padStart(2, '0');
    const day_str = monday.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day_str}`;
}

function parseWeekKey(weekKey: string): Date {
    const [year, month, day] = weekKey.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatEventDate(dateString: string | null): string {
    if (!dateString) return '日付未定';

    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];

        return `${year}年${month}月${day}日 （${weekday}）`;
    } catch {
        return '日付エラー';
    }
}

function formatEventTime(startDateTime: string | null, endDateTime?: string | null): string {
    if (!startDateTime) return '時間未定';

    try {
        const startDate = new Date(startDateTime);
        const startHours = startDate.getHours().toString().padStart(2, '0');
        const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
        
        let timeStr = `${startHours}:${startMinutes}`;

        // 正確な終了時間がある場合のみ表示
        if (endDateTime) {
            try {
                const endDate = new Date(endDateTime);
                if (!isNaN(endDate.getTime())) {
                    const endHours = endDate.getHours().toString().padStart(2, '0');
                    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
                    timeStr = `${timeStr}〜${endHours}:${endMinutes}`;
                }
            } catch {
                // 終了時間が不正な場合は開始時間のみ表示
            }
        }
        // ended_atがnullの場合は開始時間のみ表示（推定時間は表示しない）

        return timeStr;
    } catch {
        return '時間エラー';
    }
}

function getOrganizerName(event: any): string {
    if (!event) return '主催者未定';

    // Supabaseの organizer カラムを最優先
    if (event.organizer && event.organizer !== '主催者未定') {
        return event.organizer;
    }

    // connpass APIから取得した主催者情報
    if (event.connpass_owner_text && event.connpass_owner_text.trim() !== '') {
        return event.connpass_owner_text.trim();
    }

    return '主催者未定';
}
function getEventTags(eventId: number | null, allTags: any[]): string[] {
    if (!eventId || !allTags || allTags.length === 0) return [];

    return allTags
        .filter(tag => tag.event_id === eventId)
        .map(tag => tag.tag_name || tag.name || 'タグ')
        .slice(0, 3);
}