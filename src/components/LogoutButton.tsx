'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/browser';
import { useState } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const [error, setError] = useState('');

    const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
    setError('ログアウトに失敗しました');
    } else {
    router.replace('/login');
    }
    };

    return (
        <>
        <button
        onClick={handleLogout}
        className="bg-gray-800 text-white py-2 px-4 rounded bg-gray-700 transition"
        >
            ログアウト
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </>
    );
}