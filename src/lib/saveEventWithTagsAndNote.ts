/**
 * ConnLogのイベント・タグ・メモ管理システム
 * connpassイベントをSupabaseデータベースに保存し、ユーザー固有のタグとメモを管理
 */
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const supabase = createSupabaseBrowserClient()

type ConnpassEvent = {
    id?: number
    event_id?: number | string
    title?: string
    started_at?: string
    ended_at?: string | null
    place?: string | null
    url?: string
    event_url?: string
    description?: string | null
    catch?: string | null
    owner_display_name?: string
    owner_text?: string
    organizer?: string
    group?: {
        title?: string
    }
}

type TagsAndNote = {
    tags: string[]
    note: string
}

type RegisteredEventRow = {
    event_id: string | number | null;
}

/**
 * connpass APIレスポンスをSupabaseテーブル形式に変換
 * 異なるAPI仕様に対応するため柔軟なフィールドマッピングを実装
 */
export const convertConnpassToDatabase = (
    connpassEvent: ConnpassEvent,
    userId: string
) => {
    const eventId = connpassEvent.id ?? connpassEvent.event_id
    if (!eventId) {
        throw new Error('イベントIDが存在しません')
    }

    return {
        event_id: String(eventId),
        title: connpassEvent.title || 'タイトルなし',
        started_at: connpassEvent.started_at || new Date().toISOString(),
        ended_at: connpassEvent.ended_at || null,
        place: connpassEvent.place || null,
        event_url: connpassEvent.url || connpassEvent.event_url || '',
        description: connpassEvent.description || null,
        catch: connpassEvent.catch || null,
        organizer:
            connpassEvent.group?.title ||
            connpassEvent.organizer ||
            connpassEvent.owner_text ||
            connpassEvent.owner_display_name ||
            '主催者未定',
        owner_id: userId,
        user_id: userId,
        created_by: userId,
    }
}

/**
 * イベント・タグ・メモの一括保存処理
 * UPSERT方式でデータの重複を防ぎ、タグとメモは削除→挿入で整合性を保証
 * @param connpassEvent - connpass APIから取得したイベントデータ
 * @param tagsAndNote - ユーザーが入力したタグとメモ
 */
export const saveEventWithTagsAndNote = async (
    connpassEvent: ConnpassEvent,
    tagsAndNote: TagsAndNote
) => {
    if (!connpassEvent) {
        throw new Error('イベントデータが存在しません')
    }
    const eventId = connpassEvent.id ?? connpassEvent.event_id
    if (!eventId) {
        throw new Error('イベントIDが存在しません')
    }

    const {
        data: { user },
        error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
        console.error('認証エラー:', authError)
        throw new Error('ログインが必要です。Supabaseにログインしてください。')
    }

    const userId = user.id
    const eventIdString = String(eventId)

    try {
        const eventData = convertConnpassToDatabase(connpassEvent, userId)

        // 既存データをチェック
        const { data: existingEvent, error: selectError } = await supabase
            .from('events')
            .select('id')
            .eq('event_id', eventIdString)
            .eq('user_id', userId)
            .maybeSingle()

        if (selectError) {
            console.error('イベント取得エラー:', selectError)
            throw new Error(`イベントの取得に失敗しました:
                ${selectError.message}`)
        }

        let savedEvent
        let isUpdate = false

        if (existingEvent) {
            isUpdate = true
            // 既存データを更新
            const { data, error: updateError } = await supabase
                .from('events')
                .update(eventData)
                .eq('event_id', eventIdString)
                .eq('user_id', userId)
                .select()
                .single()

            if (updateError) {
                console.error('イベント更新エラー:', updateError)
                throw new Error(`イベントの更新に失敗しました: ${updateError.message}`)
            }
            savedEvent = data
        } else {
            // 新規データを挿入
            const { data, error: insertError } = await supabase
                .from('events')
                .insert(eventData)
                .select()
                .single()

            if (insertError) {
                console.error('イベント挿入エラー:', insertError)
                throw new Error(`イベントの挿入に失敗しました: ${insertError.message}`)
            }
            savedEvent = data
        }

        // 既存のタグを削除
        const { error: deleteTagsError } = await supabase
            .from('tags')
            .delete()
            .eq('event_id', eventIdString)
            .eq('user_id', userId)

        if (deleteTagsError) {
            console.error('タグ削除エラー:', deleteTagsError)
        }

        // 新しいタグを保存
        if (tagsAndNote.tags && tagsAndNote.tags.length > 0) {
            const tagsData = tagsAndNote.tags
                .filter((tag) => tag && tag.trim())
                .map((tag) => ({
                    event_id: eventIdString,
                    tag_name: tag.trim(),
                    owner_id: userId,
                    user_id: userId,
                    created_by_id: userId,
                }))

            if (tagsData.length > 0) {
                const { error: tagsError } = await supabase
                    .from('tags')
                    .insert(tagsData)

                if (tagsError) {
                    console.error('タグ保存エラー:', tagsError)
                    throw new Error(`タグの保存に失敗しました: ${tagsError.message}`)
                }
            }
        }

        // 既存メモを削除
        const { error: deleteNoteError } = await supabase
            .from('notes')
            .delete()
            .eq('event_id', eventIdString)
            .eq('user_id', userId)

        if (deleteNoteError) {
            console.error('既存メモ削除エラー:', deleteNoteError)
            throw new Error(`既存メモの削除に失敗しました: ${deleteNoteError.message}`)
        }

        const noteText = tagsAndNote.note.trim()

        // 新しいメモを保存
        if (noteText) {
            const { error: insertNoteError } = await supabase
                .from('notes')
                .insert({
                    event_id: eventIdString,
                    note: noteText,
                    user_id: userId,
                })

            if (insertNoteError) {
                console.error('メモ保存エラー:', insertNoteError)
                throw new Error(`メモの保存に失敗しました: ${insertNoteError.message}`)
            }
        }

        return {
            event: savedEvent,
            tags: tagsAndNote.tags || [],
            note: tagsAndNote.note || '',
            isUpdate,
        }
    } catch (error) {
        console.error('保存処理でエラーが発生しました:', error)
        throw error
    }
}

/**
 * ユーザーが登録済みのイベントID一覧を取得
 * UI表示でのイベント登録状態判定に使用
 */
export const getUserRegisteredEventIds = async (): Promise<Set<number>> => {
    try {
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return new Set()
        }

        const { data, error } = await supabase
            .from('events')
            .select('event_id')
            .eq('user_id', user.id)

        if (error) {
            console.error('登録済みイベント取得エラー:', error)
            return new Set()
        }

        if (!data) {
            return new Set()
        }

        const registeredEvents = (data ?? []) as RegisteredEventRow[];

        const eventIds = registeredEvents
            .map((event) => {
                const id = event.event_id;

                if (id) {
                    return parseInt(String(id), 10);
                }

                return null;
            })
            .filter((id): id is number => id !== null && !isNaN(id));
        return new Set(eventIds)
    } catch (error) {
        console.error('登録済みイベント取得でエラー:', error)
        return new Set()
    }
}