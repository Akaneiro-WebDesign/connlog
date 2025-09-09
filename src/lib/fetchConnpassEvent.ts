export async function fetchConnpassEvent(eventId: string) {
    try {
        const res = await fetch(`/api/search-event?event_id=${eventId}`);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'イベント取得に失敗しました。');
        }
        return await res.json();
    } catch (error: any) {
        throw new Error('イベント取得に失敗しました。');
    }
}