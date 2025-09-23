/**
 * ConnLogのイベント・タグ・メモ管理システム
 * connpassイベントをSupabaseデータベースに保存し、ユーザー固有のタグとメモを管理
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * connpass APIレスポンスをSupabaseテーブル形式に変換
 * 異なるAPI仕様に対応するため柔軟なフィールドマッピングを実装
 */
export const convertConnpassToDatabase = (connpassEvent: any, userId: string) => {
    const eventId = connpassEvent?.id || connpassEvent?.event_id
    if (!eventId) {
        throw new Error('イベントIDが存在しません')
    }

    return {
        event_id: String(eventId),
        title: connpassEvent?.title || 'タイトルなし',
        started_at: connpassEvent?.started_at || new Date().toISOString(),
        ended_at: connpassEvent?.ended_at || null,
        place: connpassEvent?.place || null,
        event_url: connpassEvent?.event_url || '',
        description: connpassEvent?.description || null,
        catch: connpassEvent?.catch || null,
        organizer: connpassEvent?.owner_display_name || connpassEvent?.organizer || connpassEvent?.group_title || '主催者未定',
        owner_id: userId,
        created_by: userId
    }
}

/**
 * イベント・タグ・メモの一括保存処理
 * UPSERT方式でデータの重複を防ぎ、タグとメモは削除→挿入で整合性を保証
 * @param connpassEvent - connpass APIから取得したイベントデータ
 * @param tagsAndNote - ユーザーが入力したタグとメモ
 */
export const saveEventWithTagsAndNote = async (
    connpassEvent: any,
    tagsAndNote: { tags: string[], note: string }
) => {
    if (!connpassEvent) {
        throw new Error('イベントデータが存在しません')
    }
    const eventId = connpassEvent.id || connpassEvent.event_id
    if (!eventId) {
        throw new Error('イベントIDが存在しません')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

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
            .eq('owner_id', userId)
            .single()

        let savedEvent

        if (existingEvent) {
            // 既存データを更新
            const { data, error: updateError } = await supabase
                .from('events')
                .update(eventData)
                .eq('event_id', eventIdString)
                .eq('owner_id', userId)
                .select()
                .single()

            if (updateError) {
                console.error('イベント更新エラー:', updateError)
                throw new Error(`イベントの更新に失敗しました:${updateError.message}`)
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
            .eq('created_by_id', userId)

        if (deleteTagsError) {
            console.error('タグ削除エラー:', deleteTagsError)
        }

        // 新しいタグを保存
        if (tagsAndNote.tags && tagsAndNote.tags.length > 0) {
            const tagsData = tagsAndNote.tags
                .filter(tag => tag && tag.trim())
                .map(tag => ({
                    event_id: eventIdString,
                    tag_name: tag.trim(),
                    owner_id: userId,
                    created_by_id: userId
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

        // メモを保存
        if (tagsAndNote.note && tagsAndNote.note.trim()) {
            // 既存メモを削除
            const { error: deleteNoteError } = await supabase
                .from('notes')
                .delete()
                .eq('event_id', eventIdString)
                .eq('user_id', userId)

            // 新しいメモを挿入
            const { error: insertNoteError } = await supabase
                .from('notes')
                .insert({
                    event_id: eventIdString,
                    note: tagsAndNote.note.trim(),
                    user_id: userId
                })

            if (insertNoteError) {
                console.error('メモ保存エラー:', insertNoteError)
                throw new Error(`メモの保存に失敗しました: ${insertNoteError.message}`)
            }
        }

        return {
            event: savedEvent,
            tags: tagsAndNote.tags || [],
            note: tagsAndNote.note || ''
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
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return new Set()
        }

        const { data, error } = await supabase
            .from('events')
            .select('event_id')
            .eq('owner_id', user.id)

        if (error) {
            console.error('登録済みイベント取得エラー:', error)
            return new Set()
        }

        if (!data) {
            return new Set()
        }

        const eventIds = data
            .map(event => {
                const id = event?.event_id
                if (id) {
                    return parseInt(String(id))
                }
                return null
            })
            .filter(id => id !== null && !isNaN(id)) as number[]
        return new Set(eventIds)
    } catch (error) {
        console.error('登録済みイベント取得でエラー:', error)
        return new Set()
    }
}