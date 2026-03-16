"use client";

import { useState } from "react";
import { sanitizeEventDescription } from "@/lib/sanitizeEventDescription"; // 共通関数をimport
import {
  ExternalLink,
  CalendarDays,
  UserRound,
  MapPinned,
  Tag,
  PenTool,
  X,
  ChevronsLeft,
  Edit3,
  Trash2,
  AlertTriangle,
  ChevronsRight,
} from "lucide-react";

// Event型定義
interface Event {
  id: number | null;
  noteId: string;
  externalEventId?: number | null;
  title: string;
  date: string;
  time: string;
  type: string;
  organizer: string;
  venue: string;
  place?: string;
  address?: string;
  tags: string[];
  description: string;
  event_description: string;
  url?: string;
  event_url?: string;
}

// EventListComponentのProps型定義
interface EventListComponentProps {
  events: Event[];
  showViewAllButton?: boolean;
  maxDisplayCount?: number;
  showHeader?: boolean;
  showContainer?: boolean;
  showPagination?: boolean; // ページネーション制御prop追加
  onViewAll?: () => void;
  onEdit?: (eventId: number) => void;
  onDelete?: (event: Event) => void;
  isDeleting?: boolean;
}

const EventListComponent: React.FC<EventListComponentProps> = ({
  events,
  showViewAllButton = true,
  maxDisplayCount = 5,
  showHeader = true,
  showContainer = true,
  showPagination = false, // デフォルト: false（ダッシュボード向け）
  onViewAll,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 表示用にイベントをスライス（ページネーション有無で分岐）
  const displayEvents = showPagination
    ? events.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : events.slice(0, maxDisplayCount);

  // イベントハンドラー関数
  const handleEditEvent = (eventId: number) => {
    setIsModalOpen(false);
    setTimeout(() => {
      onEdit?.(eventId);
    }, 200);
  };

  const handleDeleteEvent = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return;

    onDelete?.(selectedEvent);
    setIsModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setSelectedEvent(null);
  };

  const cancelDeleteEvent = () => {
    setIsDeleteConfirmOpen(false);
  };

  // 空状態の処理
  if (events.length === 0) {
    const emptyContent = (
      <div className="text-center py-8 text-gray-500">
        まだイベントが登録されていません。
      </div>
    );

    if (showContainer) {
      return (
        <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
          {showHeader && (
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">
              イベント履歴
            </h3>
          )}
          {emptyContent}
        </div>
      );
    } else {
      return (
        <>
          {showHeader && (
            <div className="mb-6 md:mb-10">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                イベント履歴
              </h3>
            </div>
          )}
          {emptyContent}
        </>
      );
    }
  }

  const mainContent = (
    <div className="space-y-3 md:space-y-4">
      {displayEvents.map((event) => (
        <div
          key={event.noteId}
          className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 lg:p-10 mb-4 md:mb-6 lg:mb-9 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-13 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm md:text-base text-gray-500">
                    {event.date}
                  </span>
                  <span className="text-sm md:text-base text-gray-500">
                    {event.time}
                  </span>
                </div>
                <div className="flex items-center">
                  <UserRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="px-2 py-0.5 text-gray-700 text-sm md:text-base rounded truncate">
                    {event.organizer || "主催者未定"}
                  </span>
                </div>
              </div>

              <a
                href={event.event_url || event.url || "https://example.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gray-900 mb-3 md:mb-4 mt-2 md:mt-4 text-lg md:text-xl hover:text-red-600 cursor-pointer block line-clamp-2"
              >
                {event.title}
              </a>

              <div className="flex items-center gap-2 mb-3 md:mb-5">
                <MapPinned className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm md:text-base text-gray-500 truncate">
                  {event.place || event.venue}
                </span>
              </div>

              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-5">
                {sanitizeEventDescription(event.event_description, 100)}
              </p>

              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1" />
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {event.tags.slice(0, 3).map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 md:px-4 lg:px-6 py-1 bg-gray-100 text-gray-700 text-xs md:text-sm lg:text-base rounded-full"
                    >
                      <span className="truncate">{tag}</span>
                    </div>
                  ))}
                  {event.tags.length > 3 && (
                    <div className="flex items-center px-3 md:px-4 py-1 bg-gray-200 text-gray-600 text-xs md:text-sm rounded-full">
                      +{event.tags.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:ml-4 md:self-start">
              <button
                onClick={() => {
                  setSelectedEvent(event);
                  setIsModalOpen(true);
                }}
                className="w-full md:w-auto p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer inline-flex items-center justify-center"
                title="詳細を表示"
              >
                <ExternalLink className="w-4 md:w-5 h-4 md:h-5" />
                <span className="md:hidden ml-2 text-sm">詳細</span>
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* View All Button - ダッシュボード用 */}
      {showViewAllButton && events.length > 0 && (
        <div className="flex justify-center pt-4 md:pt-6">
          <button
            onClick={() => onViewAll?.()}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            <ChevronsLeft className="w-4 h-4" />
            {events.length > maxDisplayCount
              ? "すべてのイベントを見る"
              : "イベント一覧へ"}
          </button>
        </div>
      )}

      {/* ページネーション UI - EventSearchFormと統一デザイン */}
      {showPagination && Math.ceil(events.length / ITEMS_PER_PAGE) > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft />
          </button>

          <div className="flex items-center space-x-2">
            {/* ページ番号表示 - EventSearchFormと同じロジック */}
            {Array.from(
              {
                length: Math.min(5, Math.ceil(events.length / ITEMS_PER_PAGE)),
              },
              (_, i) => {
                const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
                let pageNumber;

                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      pageNumber === currentPage
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              },
            )}
          </div>

          <button
            onClick={() =>
              setCurrentPage(
                Math.min(
                  Math.ceil(events.length / ITEMS_PER_PAGE),
                  currentPage + 1,
                ),
              )
            }
            disabled={currentPage === Math.ceil(events.length / ITEMS_PER_PAGE)}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {showContainer ? (
        <div className="bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm">
          {showHeader && (
            <div className="flex justify-between items-center mb-6 md:mb-10">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                イベント履歴
              </h3>
            </div>
          )}
          {mainContent}
        </div>
      ) : (
        <>
          {showHeader && (
            <div className="mb-6 md:mb-10">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                イベント履歴
              </h3>
            </div>
          )}
          {mainContent}
        </>
      )}

      {/* モーダル表示 */}
      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto relative mx-2 md:mx-0">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 md:top-6 right-3 md:right-6 text-gray-400 hover:text-gray-600 p-2 z-10"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="p-4 md:p-8 lg:p-30">
              <div className="flex justify-between items-start mb-4 pr-8">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 lg:gap-13 mb-4 md:mb-6">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm md:text-base text-gray-500">
                        {selectedEvent.date}
                      </span>
                      <span className="text-sm md:text-base text-gray-500">
                        {selectedEvent.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserRound className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm md:text-base">
                        {selectedEvent.organizer || "主催者未定"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedEvent.event_url || selectedEvent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 mt-2 md:mt-4 hover:text-red-600 cursor-pointer block"
                  >
                    {selectedEvent.title}
                  </a>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPinned className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-500">
                      {selectedEvent.place || selectedEvent.venue}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-600 mb-6 md:mb-8 whitespace-pre-wrap">
                {sanitizeEventDescription(
                  selectedEvent.event_description ||
                    selectedEvent.description ||
                    "",
                  150,
                )}
              </p>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-gray-900">
                    タグ
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((tag: string, index: number) => (
                    <div
                      key={index}
                      className="px-3 md:px-4 lg:px-6 py-1 bg-gray-100 text-gray-700 text-sm md:text-base rounded-full"
                    >
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 mt-6 md:mt-8">
                  <PenTool className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <h3 className="text-sm md:text-base font-bold text-gray-900">
                    メモ
                  </h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                  <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-3 mt-8 md:mt-15">
                <button
                  onClick={() =>
                    selectedEvent.id != null &&
                    handleEditEvent(selectedEvent.id)
                  }
                  disabled={selectedEvent.id == null}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  編集
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {isDeleteConfirmOpen && selectedEvent && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[60] p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
        >
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                イベントを削除しますか？
              </h3>
              <p className="text-sm text-gray-600 text-center mb-2">
                「{selectedEvent.title}」を削除します。
              </p>
              <p className="text-sm text-red-600 text-center mb-6">
                この操作は取り消すことができません。
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteEvent}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      削除中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      削除
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventListComponent;
