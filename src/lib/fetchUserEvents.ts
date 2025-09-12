export async function fetchUserEvents(nickname: string, start = 0, count = 20) {
    const res = await fetch(`/api/search-user?nickname=${nickname}&wstart=${start}&count=${count}`);
    if (!res.ok) {
        throw new Error('connpassユーザーのイベント取得に失敗しました。');
    }
    const data = await res.json();
    if (!data.events || data.events.length === 0) {
        throw new Error('イベントが見つかりませんでした。')
    }
    return {
        events: data.events,
        pagination: data.pagination
    };
}