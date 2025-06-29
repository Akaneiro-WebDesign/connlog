'use client';

import { useState } from 'react';
import { extractEventId } from '@/lib/extractEventId';
import { fetchConnpassEvent } from '@/lib/fetchConnpassEvent';
import { fetchUserEvents } from '@/lib/fetchUserEvents';

export default function EventSearchForm(){
    const [input, setInput] = useState('');
    const [searchType, setSearchType] = useState<'event' | 'nickname' >('event');
    const [events, setEvents] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setError(null);
        setEvents(null);

        try {
        if (searchType === 'event'){
            const eventId = extractEventId(input);
        if (!eventId) {
            setError('イベントIDまたはURLが正しくありません。');
            return;
        }

        const singleEvent = await fetchConnpassEvent(eventId);
        setEvents([singleEvent]);
        } else if (searchType === 'nickname')
        {
            let nickname = input.trim();
            if (!nickname){
            setError('ニックネームを入力してください。');
            return;
            }
            nickname = nickname.replace('https://connpass.com/user/', '')
            .replace('/','');
            const userEvents = await fetchUserEvents(nickname);
            setEvents(userEvents);
        }
    } catch (err: any) {
            setError(err.message || 'イベント取得に失敗しました。');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 bg-white border rounded shadow">
            <h2 className="text-lg font-semibold mb-2">connpassイベント検索</h2>


            <div className="mb-2">
                <label className="mr-4">
                    <input
                    type="radio"
                    name="searchType"
                    value="event"
                    checked={searchType === 'event'}
                    onChange={()=>
                        setSearchType('event')}
                    />{''}
                    イベントID/URL
                </label>
                <label>
                    <input
                    type="radio"
                    name="searchType"
                    value="nickname"
                    checked={searchType === 'nickname'}
                    onChange = {() =>
                    setSearchType('nickname')}
                    />{' '}
                    ニックネーム
                </label>
            </div>

            <div className="flex gap-2 mb-4">
            <input
            type="text"
            className="flex-1 px-3 py-2 border rounded"
            placeholder={searchType === 'event' ? 'イベントIDまたはURLを入力' : 'connpassのニックネームを入力'}

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

            {events && events.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    {events.map((event, index) =>(
                        <div key={event.event_id || index} className="mb-4">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p>📅{new Date(event.started_at).toLocaleString('ja-JP')}</p>
                    <p>📍{event.place || '場所未定'}</p>
                    {event.url ? (
                         <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                    >
                       connpassで見る
                    </a>
                    ) : (
                        <p className="text-gray-500">リンクがありません</p>
                    )}
                </div>
                    ))}
                </div>
            )}
        </div>
    );
}