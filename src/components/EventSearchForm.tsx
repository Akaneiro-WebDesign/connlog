'use client';

import { useState } from 'react';
import { extractEventId } from '@/lib/extractEventId';
import { fetchConnpassEvent } from '@/lib/fetchConnpassEvent';

export default function EventSearchForm(){
    const [input, setInput] = useState('');
    const [event, setEvent] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        const eventId = extractEventId(input);
        console.log('[DEBUG] 入力値:', input);
        console.log('[DEBUG] 抽出された eventId:', eventId);

        if (!eventId){
            setError('イベントIDまたはURLが正しくありません。');
            setEvent(null);
            return;
        }

        try {
            const eventData = await fetchConnpassEvent(eventId);
            console.log('[DEBUG] 取得されたイベントデータ:', eventData);
            setEvent(eventData);
            setError(null);
        } catch (err: any) {
            console.error('[ERROR] イベント取得に失敗:', err);
            setError(err.message || 'イベント取得に失敗しました。');
            setEvent(null);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-white border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">connpassイベント検索</h2>

            <div className="flex gap-2 mb-4">
            <input
            type="text"
            className="flex-1 px-3 py-2 border rounded"
            placeholder="イベントIDまたはURLを入力"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleSearch}
            >
                検索
            </button>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            {event && (
                <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p>📅{new Date(event.started_at).toLocaleString('ja-JP')}</p>
                    <p>📍{event.place || '場所未定'}</p>
                    <a
                    href={event.event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                    >
                        connpassで見る
                    </a>
                </div>
            )}
        </div>
    );
}