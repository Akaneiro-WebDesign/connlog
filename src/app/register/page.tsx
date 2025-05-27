'use client';

import { useState } from 'react';

export default function RegisterEventPage (){
    const [ input, setInput ] = useState('');
    const [ event, setEvent ] = useState<any | null>(null);
    const [ error, setError ] = useState('');

    const handleSearch = async () => {
        setError('');
        setEvent(null);

        try {
        const idOrUrl = input.trim();

        const eventIdMatch = idOrUrl.match(/event\/(\d+)/);
        const eventId = eventIdMatch ? eventIdMatch[1] : idOrUrl;

        const res = await fetch(`https://connpass.com/api/v1/event/?event_id=${eventId}`);
        const data = await res.json();

        if (data.events && data.events.length > 0){
            setEvent(data.events[0]);
        } else {
            setError('イベントが見つかりませんでした');
        }
    } catch (err){
        setError('エラーが発生しました');
    }
    };

    return (
        <div className="max-w-xl mx-auto mt-12">
            <h1 className="text-2xl font-bold mb-4">イベント登録</h1>
            <div className="mb-4">
                <label className="block mb-1">イベントIDまたはURL</label>
                <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="https://connpass.com/event/123456/ または 123456"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                />
            </div>
            <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                イベント検索
            </button>

            {event && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    <p>日時: {event.started_at}</p>
                    <p>会場: {event.place || 'オンラインまたは未定'}</p>
                    <a
                    href={event.event_url}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                        connpassページへ
                    </a>
                </div>
            )}

            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
}