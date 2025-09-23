/**
 * 指定されたイベントIDのconnpass情報をAPIから取得
 * 内部APIエンドポイントを経由してCORS制限とAPI KEY保護を実現
 */
export async function fetchConnpassEvent(eventId: string): Promise<any> {
    try {
        const res = await fetch(`/api/search-event?event_id=${eventId}`);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `API Error: ${res.status}${res.statusText}`);
        }
        return await res.json();
    } catch (error) {
        // 開発時のデバッグ情報を保持しつつ、ユーザーフレンドリーなメッセージ
        if (error instanceof Error) {
            console.error('Event fetch error:', error.message);
            throw new Error(`イベント取得に失敗しました: ${error.message}`);
        }
        throw new Error('イベント取得に失敗しました。');
    }
}