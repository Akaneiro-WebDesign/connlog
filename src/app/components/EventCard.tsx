'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import weekday from 'dayjs/plugin/weekday';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import SkillTagInput from '../../components/SkillTagInput';

dayjs.locale('ja');
dayjs.extend(weekday);
dayjs.extend(localizedFormat);

type Props = {
    event: {
     event_id: number;
     title: string;
     started_at: string;
     place: string | null;
     event_url: string;
    };
};

export default function EventCard({ event }: Props) {
    const [showModal,setShowModal] = useState(false);
    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal =() => setShowModal(false);
    // 親でタグの状態を定義
    const [tags, setTags] = useState<string[]>([]);

    return (
        <div className="border rounded p-4 shadow-sm bg-white relative">
        <h2 className="text-lg font-bold">{event.title}</h2>
        <p className="text-sm text-gray-600 mt-1">📅 {dayjs(event.started_at).format('YYYY年M月D日(ddd)HH:mm〜')}</p>
        <p className="text-sm text-gray-600">📍{event.place || '未定'}</p>

        <a
        href={event.event_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline block mt-2"
        >
            connpassページへ
        </a>

        <button
        onClick={handleOpenModal}
        className="mt-4 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
            タグ登録
        </button>
        {/* モーダル */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow max-w-md w-full">
                    <h3 className="text-lg font-bold mb-4">スキルタグ登録</h3>
                    <div className="mb-2 text-sm text-gray-700">
                    <p>
                        <strong>イベント名：</strong>
                        {event.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-4"><strong>日時：</strong>
                        {dayjs(event.started_at).format('YYYY年M月D日(ddd)HH:mm〜')}
                    </p>
                    </div>
                    {/*  SkillTagInput に状態を渡す */}
                    <SkillTagInput tags={tags} setTags={setTags} />

                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        保存
                    </button>
                    <button
                    onClick={handleCloseModal}
                    className="mt-4 block text-sm text-blue-600 underline"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        )}
        </div>
    );
}