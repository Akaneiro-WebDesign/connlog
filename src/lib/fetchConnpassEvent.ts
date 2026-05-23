/**
 * 指定されたイベントIDのconnpass情報をAPIから取得
 * 内部APIエンドポイントを経由してCORS制限とAPI KEY保護を実現
 */
type ConnpassEvent = {
    id?: number
    event_id?: number
    title?: string
    started_at?: string
    ended_at?: string
    url?: string
    event_url?: string
    address?: string
    place?: string
    owner_display_name?: string
    owner_text?: string
    organizer?: string
    group?: {
        title?: string
    }
    catch?: string
    description?: string
    event_description?: string
    hash_tag?: string
    tags?: string[]
}

type SearchEventErrorResponse = {
    error?: string
}

export async function fetchConnpassEvent(eventId: string): Promise<ConnpassEvent> {
    try {
        const res = await fetch(`/api/search-event?event_id=${eventId}`)

        if (!res.ok) {
            const errorData = (await res.json().catch(() => ({}))) as SearchEventErrorResponse
            throw new Error(errorData.error || `API Error: ${res.status} ${res.statusText}`)
        }
        return (await res.json()) as ConnpassEvent
    } catch (error) {
        // 開発時のデバッグ情報を保持しつつ、ユーザーフレンドリーなメッセージ
        if (error instanceof Error) {
            console.error('Event fetch error:', error.message)
            throw new Error(`イベント取得に失敗しました: ${error.message}`)
        }
        throw new Error('イベント取得に失敗しました。')
    }
}