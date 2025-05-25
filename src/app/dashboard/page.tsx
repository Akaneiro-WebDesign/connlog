'use client';

import { useDevUser } from '@/hooks/useDevUser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/browser' 

export default function DashboardPage() {
    const user = useDevUser();
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    },[user, router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setError('ログアウトに失敗しました');
        } else {
            router.push('/login');
        }
    };

    if (!user) {
        return <p>読み込み中...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <h1 className="text-2xl font-bold mb-4">ようこそ、{user.email}さん</h1>
            <p className="mb-4">このページはログインしているユーザーだけが見られます。</p>

            <button
            onClick={handleLogout}
            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
            >
                ログアウト
            </button>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p> }
        </div>
    );
}