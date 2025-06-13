'use client';
import { useState } from 'react';

type Props = {
    tags: string[];
    setTags:React.Dispatch<React.SetStateAction<string[]>>;
};

export default function SkillTagInput({ tags, setTags }:Props) {
    const [tagInput, setTagInput ] = useState('');

    const handleAddTag = () => {
        const newTag = tagInput.trim();
        if (newTag && !tags.includes(newTag)){
            setTags([...tags, newTag]);
            setTagInput('');
    }
};

return (
    <div className="max-w-md p-4 border rounded bg-white shadow">
        <h2 className="text-lg font-semibold mb-2">スキルタグを追加</h2>

    <div className="flex gap-2 mb-4">
    <input
    type="text"
    className="flex-1 border border-gray-300 rounded px-3 py-2"
    placeholder="例：React, Next.js"
    value={tagInput}
    onChange={(e) => setTagInput(e.target.value)}
    />
    <button
    onClick={handleAddTag}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
    追加
    </button>
    </div>
    {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
        {tags.map((tag,index) => (
            <span
            key={index}
            className="bg-gray-200 px-3 py-1 rounded-full text-sm"
            >
                {tag}
            </span>
        ))}
        </div>
    )}
    </div>
);
}