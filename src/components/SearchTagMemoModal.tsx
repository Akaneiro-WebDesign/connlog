'use client'

import React, { useEffect, useState } from 'react'
import { X, Tag, PenTool, CalendarDays, MapPinned, UserRound, Save, RotateCcw } from 'lucide-react'
import { sanitizeEventDescription } from '@/lib/sanitizeEventDescription'
import { formatDateTime } from '@/lib/formatDateTime'

type ConnpassEvent = {
    id?: number
    event_id?: number
    title?: string
    started_at?: string
    ended_at?: string
    date?: string
    url?: string
    event_url?: string
    address?: string
    place?: string
    venue?: string
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

interface SearchTagMemoModalProps {
    isOpen: boolean
    onClose: () => void
    event: ConnpassEvent | null
    onSave: (data: { tags: string[], note: string }) => Promise<void>
}

export const SearchTagMemoModal: React.FC<SearchTagMemoModalProps> = ({
    isOpen,
    onClose,
    event,
    onSave
}) => {
    // フォームの状態管理
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [note, setNote] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isTagComposing, setIsTagComposing] = useState(false)

    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, []);

    //　タグ追加処理
    const addTag = () => {
        const trimmedTag = tagInput.trim()

        if (!trimmedTag) return

        if (!tags.includes(trimmedTag)) {
            setTags(prev => [...prev, trimmedTag])
        }

        setTagInput('')
    }

    // Enterキーでタグ追加
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return

        if (isTagComposing || e.nativeEvent.isComposing) return

        e.preventDefault()
        addTag()
    }

    // タグ削除処理
    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove))
    }

    // 保存処理
    const handleSave = async () => {
        if (!event) return

        setIsLoading(true)

        try {
            await onSave({ tags, note })
            // 保存成功時はフォームをリセット
            resetForm()
        } catch {
            //　エラーハンドリングは親コンポーネントで行う
        } finally {
            setIsLoading(false)
        }
    }

    // フォームリセット
    const resetForm = () => {
        setTags([])
        setTagInput('')
        setNote('')
    }

    // モーダルを閉じる
    const handleClose = () => {
        resetForm()
        onClose()
    }

    // モーダルが閉じている場合は何も表示しない
    if (!isOpen || !event) return null

    const formattedDate = formatDateTime(event.started_at ?? event.date ?? '', event.ended_at)

    // catch優先、空ならdescriptionを使用
    const rawDescription = event.catch || event.description || event.event_description || ''
    // 共通関数を使用：モーダル表示なので150文字制限
    const cleanDescription = sanitizeEventDescription(rawDescription, 150)

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[90] p-2 md:p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
            <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative mx-2 md:mx-0">
                {/* 閉じるボタン */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 md:top-6 right-3 md:right-6 text-gray-400 hover:text-gray-600 p-2 z-10"
                >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                <div className="p-4 md:p-8 lg:p-30">
                    {/* イベント情報ヘッダー */}
                    <div className="mb-6 pr-8">
                        <div className="min-w-0">
                            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                    <span className="text-sm text-gray-500 md:text-base">
                                        {formattedDate.date}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500 md:text-base">
                                    {formattedDate.time}
                                </span>
                            </div>
                            <div className="mb-3 flex min-w-0">
                                <div className="inline-flex max-w-full items-center gap-1.5 rounded-sm bg-orange-400 px-2.5 py-1 text-xs font-medium text-white md:text-sm">
                                    <UserRound className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                                    <span className="min-w-0 truncate">
                                        {
                                            event.group?.title ||
                                            event.organizer ||
                                            event.owner_text ||
                                            event.owner_display_name ||
                                            '主催者未定'
                                        }
                                    </span>
                                </div>
                            </div>

                            <a
                                href={event.event_url || event.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mb-4 block cursor-pointer text-lg font-bold text-gray-900 hover:text-gray-500 hover:underline hover:decoration-gray-500 hover:underline-offset-4 md:mb-6 md:text-2xl"
                            >
                                {event.title || 'タイトル不明'}
                            </a>

                            <div className="flex items-center gap-2">
                                <MapPinned className="h-4 w-4 flex-shrink-0 text-gray-500" />
                                <span className="text-sm text-gray-500 md:text-base">
                                    {event.place || event.venue || event.address || '会場未定'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* イベント紹介文 */}
                    <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 whitespace-pre-wrap">
                        {cleanDescription || 'イベントの説明はありません。'}
                    </p>

                    {/* タグ入力セクション */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <h3 className="text-sm md:text-base font-bold text-gray-900">タグを追加</h3>
                        </div>

                        {/* 既存タグ表示 */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 md:gap-2 mb-4">
                                {tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 px-3 md:px-4 lg:px-6 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm lg:text-base rounded-full"
                                    >
                                        <span className="truncate">{tag}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 text-gray-500 hover:text-gray-700 font-bold"
                                        >
                                            <X className="w-5 h-5 md:w-3 md:h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* タグ入力フィールド */}
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                onCompositionStart={() => setIsTagComposing(true)}
                                onCompositionEnd={() => setIsTagComposing(false)}
                                placeholder="例：React, Next.js, TypeScript"
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                disabled={!tagInput.trim()}
                                className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                            >
                                追加
                            </button>
                        </div>
                    </div>

                    {/* メモ入力セクション */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <PenTool className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <h3 className="text-sm md:text-base font-bold text-gray-900">メモを追加</h3>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="このイベントについてのメモを入力"
                                rows={6}
                                className="w-full border-0 bg-transparent text-sm md:text-base text-gray-700 placeholder-gray-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>

                    {/* 入力状況表示 */}
                    <div className="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-lg">
                        <p className="font-medium text-gray-900 mb-2 text-sm md:text-base">入力状況</p>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>タグ数: <span className="font-medium">{tags.length}個</span></p>
                            <p>メモ文字数:<span className="font-medium">{note.length}文字</span></p>
                            {tags.length > 0 && (
                                <p className="text-blue-600 mt-2">
                                    タグ: {tags.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col md:flex-row justify-center gap-3 mt-8 md:mt-12">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4"/>
                            戻る
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    保存
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}