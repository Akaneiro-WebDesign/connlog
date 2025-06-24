'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/browser';

export default function DashboardPage() {

    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            const session = data.session;

            if (!session || !session.user) {
                router.replace('/login');
            } else {
                setUserEmail(session.user.email);
            }
            setLoading(false);
        };
        checkSession();
    },[router]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            setError('ログアウトに失敗しました');
        } else {
            router.replace('/login');
        }
    };

    if (loading) {
        return <p>ログイン状態を確認中...</p>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-12">
            <h1 className="text-2xl font-bold mb-4">ようこそ、{userEmail}さん</h1>
            <p className="mb-4">このページはログインしているユーザーだけが見られます。</p>

            <button
            onClick={handleLogout}
            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition"
            >
                ログアウト
            </button>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
    );
}