'use client'

import React, { useState, useEffect } from 'react'
import { extractEventId } from '@/lib/extractEventId'
import { fetchConnpassEvent } from '@/lib/fetchConnpassEvent'
import { fetchUserEvents } from '@/lib/fetchUserEvents'
import { sanitizeEventDescription } from '@/lib/sanitizeEventDescription'
import { SearchTagMemoModal } from './SearchTagMemoModal'
import { saveEventWithTagsAndNote, getUserRegisteredEventIds } from '@/lib/saveEventWithTagsAndNote'
import { formatDateTime } from '@/lib/formatDateTime'
import {
    Search,
    CalendarDays,
    MapPinned,
    UserRound,
    FileCheck,
    Loader,
    FilePlus,
    ChevronsLeft,
    ChevronsRight,
    X,
    Check
} from 'lucide-react'

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

type SaveFeedback = {
    title: string
    description: string
    variant?: 'success' | 'error'
}

type SearchFeedback = {
    title: string
    description?: string
    variant: 'error' | 'info'
}

/**
 * ConnLogメイン検索フォーム
 * connpassイベント検索・表示・登録機能の統合コンポーネント
 * 
 * 主要機能：
 * - ユーザー名検索（ページング対応）
 * - イベントID/URL検索
 * - 登録済みイベント判定
 * - タグ・メモ登録モーダル連携
 */
export const EventSearchForm = () => {
    // 基本の状態管理
    const [searchMode, setSearchMode] = useState<'event' | 'nickname'>('nickname')
    const [searchInput, setSearchInput] = useState('')
    const [events, setEvents] = useState<ConnpassEvent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null)
    const [searchFeedback, setSearchFeedback] = useState<SearchFeedback | null>(null)

    // ページネーション用の状態管理
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [, setHasMore] = useState(false)
    const ITEMS_PER_PAGE = 20

    // モーダル関連の状態
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<ConnpassEvent | null>(null)

    // 登録済みイベント管理
    const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set())

    // 初期化：登録済みイベントIDを取得
    useEffect(() => {
        loadRegisteredEventIds()
    }, [])

    useEffect(() => {
        if (!saveFeedback) return

        const timer = window.setTimeout(() => {
            setSaveFeedback(null)
        }, 6000)

        return () => window.clearTimeout(timer)
    }, [saveFeedback])

    const loadRegisteredEventIds = async () => {
        try {
            const ids = await getUserRegisteredEventIds()
            setRegisteredEventIds(ids)
        } catch {

        }
    }

    // 検索実行関数
    // 検索実行関数
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedInput = searchInput.trim()

        if (!trimmedInput) {
            setSearchFeedback({
                title: '検索条件を入力してください',
                variant: 'error',
            })
            return
        }

        setIsLoading(true)
        setCurrentPage(1)
        setSaveFeedback(null)
        setSearchFeedback(null)

        try {
            let searchResults: ConnpassEvent[] = []

            if (searchMode === 'event') {
                const eventId = extractEventId(trimmedInput)

                if (eventId) {
                    const event = await fetchConnpassEvent(eventId)

                    if (event) {
                        searchResults = [event]
                        setTotalResults(1)
                        setHasMore(false)
                    }
                } else {
                    setSearchFeedback({
                        title: '有効なイベントIDまたはURLを入力してください',
                        description: 'connpassのイベントURL、またはイベントIDを入力してください。',
                        variant: 'error',
                    })
                    setIsLoading(false)
                    return
                }
            } else {
                try {
                    // ページング対応でAPIを呼び出し
                    const result = await fetchUserEvents(trimmedInput, 0, ITEMS_PER_PAGE)
                    searchResults = result.events || []

                    // ページング情報を設定
                    const apiTotal = result.pagination?.total
                    const fallbackTotal = searchResults.length
                    setTotalResults(apiTotal || fallbackTotal)
                    setHasMore(result.pagination?.hasMore || false)
                } catch {
                    throw new Error('ユーザーイベントの検索に失敗しました')
                }
            }

            setEvents(searchResults)

            if (searchResults.length === 0) {
                if (searchMode === 'nickname') {
                    setSearchFeedback({
                        title: `ユーザー "${trimmedInput}" のイベントが見つかりませんでした`,
                        description: 'ユーザーが存在しない、または公開イベントがない可能性があります。',
                        variant: 'info',
                    })
                } else {
                    setSearchFeedback({
                        title: 'イベントが見つかりませんでした',
                        description: 'イベントIDまたはURLを確認してください。',
                        variant: 'info',
                    })
                }
            }
        } catch {
            setEvents([])
            setTotalResults(0)
            setHasMore(false)
            setSearchFeedback({
                title: '検索に失敗しました',
                description: '時間をおいてもう一度お試しください。',
                variant: 'error',
            })
        } finally {
            setIsLoading(false)
        }
    }
    
    // ページ変更処理
    const handlePageChange = async (newPage: number) => {
        if (searchMode !== 'nickname') return

        setIsLoading(true)
        setCurrentPage(newPage)
        setSearchFeedback(null)

        try {
            const start = (newPage - 1) * ITEMS_PER_PAGE
            const result = await fetchUserEvents(searchInput.trim(), start, ITEMS_PER_PAGE)

            setEvents(result.events || [])
            setHasMore(result.pagination?.hasMore || false)
        } catch {
            setSearchFeedback({
                title: 'ページの読み込みに失敗しました',
                description: '時間をおいてもう一度お試しください。',
                variant: 'error',
            })
        } finally {
            setIsLoading(false)
        }
    }

    // モーダル制御関数
    const handleTagMemoClick = (event: ConnpassEvent) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedEvent(null)
    }

    // Supabase保存処理
    const handleModalSave = async (data: { tags: string[], note: string }) => {
        if (!selectedEvent) {
            return
        }

        try {
            const result = await saveEventWithTagsAndNote(selectedEvent, data)

            // UI状態を更新
            const eventId = selectedEvent.id ?? selectedEvent.event_id
            if (eventId) {
                setRegisteredEventIds(prev => new Set([...prev, Number(eventId)]))
            }
            
            const successMessage = result.isUpdate
                ? 'タグ・メモを更新しました'
                : 'イベントを登録しました'
            setSaveFeedback({
                title: successMessage,
                description: selectedEvent.title || 'タイトル不明',
                variant: 'success',
            })

            handleModalClose()
        } catch (error) {
            console.error('保存に失敗しました:', error)
            setSaveFeedback({
                title: '保存に失敗しました',
                description: '時間をおいてもう一度お試しください。',
                variant: 'error',
            })
        }
    }

    // イベントが登録済みかチェック
    const isEventRegistered = (eventId: number) => {
        return registeredEventIds.has(eventId)
    }
    

    return (
        <div className="space-y-6">
            {saveFeedback && (
            <div
                role="status"
                aria-live="polite"
                className="fixed left-4 right-4 bottom-4 z-50 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-lg md:bottom-auto md:left-auto md:right-6 md:top-6 md:w-[420px]"
            >
                <div className="flex items-start gap-3">
                    <div
                        aria-hidden="true"
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            saveFeedback.variant === 'error'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                        }`}
                    >
                        {saveFeedback.variant === 'error' ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Check className="h-4 w-4" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium leading-5 text-gray-900">
                            {saveFeedback.title}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-gray-500">
                            {saveFeedback.description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSaveFeedback(null)}
                        aria-label="通知を閉じる"
                        className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        )}
            {/* 検索フォーム */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    {/* 検索モード選択 */}
                    <div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchMode"
                                    value="nickname"
                                    checked={searchMode === 'nickname'}
                                    onChange={(e) => setSearchMode(e.target.value as 'nickname')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-900">ユーザー名検索</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="searchMode"
                                    value="event"
                                    checked={searchMode === 'event'}
                                    onChange={(e) => setSearchMode(e.target.value as 'event')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-900">イベントID/URL検索</span>
                            </label>
                        </div>
                    </div>

                    {/* 検索入力フィールド */}
                    <div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder={
                                    searchMode === 'event'
                                        ? 'https://connpass.com/event/123456/ または 123456'
                                        : 'ユーザー名を入力'
                                }
                                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 md:px-6 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-300 border-1 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        検索中
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-4 h-4" />
                                        検索
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {searchFeedback && (
                        <div
                            role={searchFeedback.variant === 'error' ? 'alert' : 'status'}
                            aria-live={searchFeedback.variant === 'error' ? 'assertive' : 'polite'}
                            className={`rounded-lg border px-4 py-3 text-sm ${
                                searchFeedback.variant === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-800'
                                    : 'border-blue-200 bg-blue-50 text-blue-800'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-medium">{searchFeedback.title}</p>
                                    {searchFeedback.description && (
                                        <p className="mt-1 text-xs leading-5 opacity-90">
                                            {searchFeedback.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSearchFeedback(null)}
                                    aria-label="メッセージを閉じる"
                                    className="-mr-1 -mt-1 shrink-0 rounded-full p-1 opacity-70 hover:bg-white/60 hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* 検索結果表示 */}
            {events.length > 0 && (
                <div className="mt-15">
                    <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            検索結果
                            {searchMode === 'nickname' && totalResults > 0 && (
                                <span> (全{totalResults}件中 {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalResults)}-{Math.min(currentPage * ITEMS_PER_PAGE, totalResults)}件目)</span>
                            )}
                            {searchMode === 'event' && (
                                <span> ({events.length}件)</span>
                            )}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {events.map((event, index) => {
                            const eventId = event.id ?? event.event_id
                            const isRegistered = eventId ? isEventRegistered(eventId) : false
                            const { date, time } = formatDateTime(event.started_at ?? '', event.ended_at)
                            const rawDescription = event.catch || event.description || event.event_description || ''
                            const cleanDescription = sanitizeEventDescription(rawDescription, 100)

                            return (
                                <div key={eventId || index} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 lg:p-10 mb-4 md:mb-6 lg:mb-9 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="min-w-0 flex-1">

                                            {/* 日時情報 */}
                                            <div className="mb-3 space-y-2">
                                                <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
                                                    <CalendarDays className="w-4 h-4 flex-shrink-0 text-gray-500" />
                                                    <span className="text-sm text-gray-500 md:text-base">{date}</span>
                                                    <span className="text-sm text-gray-500 md:text-base">{time}</span>
                                                </div>
                                            </div>

                                            {/* 主催者情報 */}
                                            <div className="flex min-w-0">
                                                <div className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-sm bg-orange-400 px-2.5 py-1 text-xs font-medium text-white md:text-sm">
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

                                            {/* タイトル */}
                                            <a
                                                href={event.event_url || event.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mb-3 block cursor-pointer line-clamp-2 text-lg font-semibold text-gray-900 hover:text-gray-500 hover:underline hover:decoration-gray-500 hover:underline-offset-4 md:mb-4 md:text-2xl"
                                            >
                                                {event.title || 'タイトル不明'}
                                            </a>

                                            {/* 場所情報 */}
                                            <div className="flex items-center gap-2 mb-3 md:mb-5">
                                                <MapPinned className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-sm md:text-base text-gray-500 truncate">
                                                    {event.place || event.venue || event.address || '会場未定'}
                                                </span>
                                            </div>

                                            {/* 説明文 */}
                                            <p className="text-xs md:text-sm text-gray-600">
                                                {cleanDescription}
                                            </p>
                                        </div>

                                        {/* アクションボタン（EventListComponentスタイル） */}
                                        <button
                                            onClick={() => handleTagMemoClick(event)}
                                            className={`w-full shrink-0 md:w-auto p-2 rounded hover:transition-colors cursor-pointer inline-flex items-center justify-center ${isRegistered
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                            title={isRegistered ? "タグ・メモを編集" : "タグ編集 & メモ"}
                                        >
                                            {isRegistered ? (
                                                <FileCheck className="w-4 md:w-5 h-4 md:h-5" />
                                            ) : (
                                                <FilePlus className="w-4 md:w-5 h-4 md:h-5" />
                                            )}
                                            <span className="md:hidden ml-2 text-sm">
                                                {isRegistered ? '登録済み' : '登録'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* ページネーション UI */}
                    {searchMode === 'nickname' && totalResults > ITEMS_PER_PAGE && (
                        <div className="flex justify-center items-center mt-8 space-x-4">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft />
                            </button>

                            <div className="flex items-center space-x-2">
                                {/* ページ番号表示 */}
                                {Array.from({ length: Math.min(5, Math.ceil(totalResults / ITEMS_PER_PAGE)) }, (_, i) => {
                                    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)
                                    let pageNumber

                                    if (totalPages <= 5) {
                                        pageNumber = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNumber = i + 1
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + i
                                    } else {
                                        pageNumber = currentPage - 2 + i
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            disabled={isLoading}
                                            className={`w-10 h-10 rounded-lg transition-colors disabled:opacity-50 ${
                                                pageNumber === currentPage
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    )
                                })}
                            </div>
                            <button
                                onClick={() => handlePageChange(Math.min(Math.ceil(totalResults / ITEMS_PER_PAGE), currentPage + 1))}
                                disabled={currentPage === Math.ceil(totalResults / ITEMS_PER_PAGE) || isLoading}
                                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* タグ・メモ登録モーダル */}
            <SearchTagMemoModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                event={selectedEvent}
                onSave={handleModalSave}
            />
        </div>
    )
}