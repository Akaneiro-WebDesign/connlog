/**
 * connpassユーザーの主催・参加イベント一覧を取得
 * ページング機能付きで大量データにも対応
 * @param nickname - connpassのユーザー名
 * @param start - 取得開始位置
 * @param count - 1回で取得する件数
 */
export async function fetchUserEvents(nickname: string, start = 0, count = 20) {
    const encodedNickname = encodeURIComponent(nickname);
    
    const res = await fetch(
        `/api/search-user?nickname=${encodedNickname}&start=${start}&count=${count}`);

    if (!res.ok) {
        throw new Error('connpassユーザーのイベント取得に失敗しました。');
    }

    const data = await res.json();

    return {
        events: data.events || [],
        pagination: data.pagination || {}
    };
}