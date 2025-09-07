'use client'

import React, { useState, useEffect } from 'react'
import { extractEventId } from '@/lib/extractEventId'
import { fetchConnpassEvent } from '@/lib/fetchConnpassEvent'
import { fetchUserEvents } from '@/lib/fetchUserEvents'
import { sanitizeEventDescription } from '@/lib/sanitizeEventDescription' // 共通関数をimport
import { SearchTagMemoModal } from './SearchTagMemoModal'
import { saveEventWithTagsAndNote, getUserRegisteredEventIds } from '@/lib/saveEventWithTagsAndNote'
import {
  Search,
  CalendarDays,
  MapPinned,
  User,
  UserRound,
  Tag,
  CheckCircle,
  FileCheck,
  Loader,
  ExternalLink,
  FilePlus,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

export const EventSearchForm = () => {
  // 基本の状態管理
  const [searchMode, setSearchMode] = useState<'event' | 'nickname'>('nickname')
  const [searchInput, setSearchInput] = useState('')
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // ページネーション用の状態管理
  const [currentPage, setCurrentPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const ITEMS_PER_PAGE = 20

  // モーダル関連の状態
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  // 登録済みイベント管理
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<number>>(new Set())

  // 初期化：登録済みイベントIDを取得
  useEffect(() => {
    loadRegisteredEventIds()
  }, [])

  const loadRegisteredEventIds = async () => {
    try {
      const ids = await getUserRegisteredEventIds()
      setRegisteredEventIds(ids)
    } catch (error) {
      // エラーは静かに処理（プロダクション環境）
    }
  }

  // 検索実行関数
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchInput.trim()) {
      alert('検索条件を入力してください')
      return
    }

    setIsLoading(true)
    setCurrentPage(1) // ページをリセット

    try {
      let searchResults: any[] = []

      if (searchMode === 'event') {
        const eventId = extractEventId(searchInput.trim())
        if (eventId) {
          const event = await fetchConnpassEvent(eventId)
          if (event) {
            searchResults = [event]
            setTotalResults(1)
            setHasMore(false)
          }
        } else {
          alert('有効なイベントIDまたはURLを入力してください')
          setIsLoading(false)
          return
        }
// handleSearch関数内の該当部分を以下のように修正してデバッグ

} else {
  try {
    // ページング対応でAPIを呼び出し
    const result = await fetchUserEvents(searchInput.trim(), 0, ITEMS_PER_PAGE)
    searchResults = result.events || []
    
    // ===== デバッグ用ログ追加 =====
    console.log('=== totalResults Debug ===')
    console.log('API Response structure:', result)
    console.log('result.pagination:', result.pagination)
    console.log('result.pagination?.total:', result.pagination?.total)
    console.log('searchResults.length:', searchResults.length)
    console.log('ITEMS_PER_PAGE:', ITEMS_PER_PAGE)
    console.log('currentPage:', currentPage)
    
    // ページング情報を設定
    const apiTotal = result.pagination?.total
    const fallbackTotal = searchResults.length
    setTotalResults(apiTotal || fallbackTotal)
    setHasMore(result.pagination?.hasMore || false)

    console.log('Set totalResults to:', apiTotal || fallbackTotal)
    console.log('API total vs fallback:', { apiTotal, fallbackTotal })
    console.log('==============================')

    // 既存のデバッグ用（必要に応じてコメントアウト）
    if (searchResults.length > 0) {
      console.log('=== connpass API Debug ===')
      console.log('Raw API data:', searchResults[0])
      console.log('Started at:', searchResults[0]?.started_at)
      console.log('Ended at:', searchResults[0]?.ended_at)
      console.log('Total results:', result.pagination?.total)
      console.log('Has more:', result.pagination?.hasMore)
    }

  } catch (userError) {
    searchResults = []
    setTotalResults(0)
    setHasMore(false)
  }
}

      setEvents(searchResults)

      if (searchResults.length === 0) {
        if (searchMode === 'nickname') {
          alert(`ユーザー "${searchInput.trim()}" のイベントが見つかりませんでした。\n- ユーザーが存在しない\n- 公開イベントがない\n可能性があります。`)
        } else {
          alert('イベントが見つかりませんでした')
        }
      }
    } catch (error) {
      alert('検索に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  // ページ変更処理
  const handlePageChange = async (newPage: number) => {
    if (searchMode !== 'nickname') return
    
    setIsLoading(true)
    setCurrentPage(newPage)

    try {
      const start = (newPage - 1) * ITEMS_PER_PAGE
      const result = await fetchUserEvents(searchInput.trim(), start, ITEMS_PER_PAGE)
      
      setEvents(result.events || [])
      setHasMore(result.pagination?.hasMore || false)
    } catch (error) {
      alert('ページの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // モーダル制御関数
  const handleTagMemoClick = (event: any) => {
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
      await saveEventWithTagsAndNote(selectedEvent, data)

      // UI状態を更新
      const eventId = selectedEvent.id
      if (eventId) {
        setRegisteredEventIds(prev => new Set([...prev, eventId]))
      }

      alert(`保存完了！\n\nイベント: ${selectedEvent.title}\nタグ: ${data.tags.join(', ') || 'なし'}\nメモ: ${data.note || 'なし'}`)

      handleModalClose()
    } catch (error) {
      alert(`保存に失敗しました\n\nエラー: ${error instanceof Error ? error.message : '不明なエラー'}\n\nブラウザのConsoleで詳細を確認してください。`)
    }
  }

  // イベントが登録済みかチェック
  const isEventRegistered = (eventId: number) => {
    return registeredEventIds.has(eventId)
  }

  // 日時データの処理（connpass APIの形式に対応）- 改善版
  const formatDateTime = (startDateTime: string, endDateTime?: string) => {
    if (!startDateTime) return { date: '日付不明', time: '' }

    try {
      const startDate = new Date(startDateTime)

      // 日付の妥当性チェック
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date')
      }

      const year = startDate.getFullYear()
      const month = startDate.getMonth() + 1
      const day = startDate.getDate()

      const weekdays = ['日', '月', '火', '水', '木', '金', '土']
      const weekday = weekdays[startDate.getDay()]

      const dateStr = `${year}年${month}月${day}日 (${weekday})`

      // 開始時間
      const startHour = String(startDate.getHours()).padStart(2, '0')
      const startMinute = String(startDate.getMinutes()).padStart(2, '0')
      let timeStr = `${startHour}:${startMinute}`

      // 終了時間があれば追加
      if (endDateTime) {
        try {
          const endDate = new Date(endDateTime)
          if (!isNaN(endDate.getTime())) {
            const endHour = String(endDate.getHours()).padStart(2, '0')
            const endMinute = String(endDate.getMinutes()).padStart(2, '0')
            timeStr = `${timeStr}〜${endHour}:${endMinute}`
          }
        } catch {
          // 終了時間のパースに失敗した場合は開始時間のみ
        }
      }

      return { date: dateStr, time: timeStr }

    } catch (error) {
      // フォールバック: シンプルな表示
      const dateOnly = startDateTime.split('T')[0]
      if (dateOnly) {
        const [year, month, day] = dateOnly.split('-')
        return {
          date: `${year}年${month}月${day}日`,
          time: ''
        }
      }
      return { date: '日付不明', time: '' }
    }
  }

  // タグの処理（connpassのhash_tagまたは手動タグ）
  const getTags = (event: any) => {
    if (event.tags && Array.isArray(event.tags)) {
      return event.tags
    }
    if (event.hash_tag) {
      return event.hash_tag.split(',').map((tag: string) => tag.trim()).filter(Boolean)
    }
    return []
  }

  return (
    <div className="space-y-6">
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
        </form>
      </div>

      {/* 検索結果表示（EventListComponent統一スタイル） */}
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
              const isRegistered = isEventRegistered(event.id || event.event_id)
              // ended_atも渡すように修正
              const { date, time } = formatDateTime(event.started_at, event.ended_at)
              const tags = getTags(event)
              // 共通関数を使用：カード表示なので100文字制限
              const cleanDescription = sanitizeEventDescription(event.catch || event.description || event.event_description, 100)

              return (
                <div key={event.id || event.event_id || index} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 lg:p-10 mb-4 md:mb-6 lg:mb-9 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      {/* 日時・主催者情報 */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-13 mb-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm md:text-base text-gray-500">{date}</span>
                          <span className="text-sm md:text-base text-gray-500">{time}</span>
                        </div>
                        <div className="flex items-center">
                          <UserRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="px-2 py-0.5 text-gray-700 text-sm md:text-base rounded truncate">
                            {event.owner_display_name || event.organizer || '主催者未定'}
                          </span>
                        </div>
                      </div>

                      {/* タイトル（EventListComponentスタイル） */}
                      <a
                        href={event.event_url || event.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 mb-3 md:mb-4 mt-2 md:mt-4 text-lg md:text-xl hover:text-red-600 cursor-pointer block line-clamp-2"
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
                      <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-5">
                        {cleanDescription}
                      </p>
                    </div>

                    {/* アクションボタン（EventListComponentスタイル） */}
                    <button
                      onClick={() => handleTagMemoClick(event)}
                      className={`w-full md:w-auto p-2 rounded hover:transition-colors cursor-pointer inline-flex items-center justify-center ${isRegistered
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      title={isRegistered ? "タグ・メモを編集" : "タグ登録 & メモ"}
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