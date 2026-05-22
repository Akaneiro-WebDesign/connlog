'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const supabase = createSupabaseBrowserClient();
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
                throw signOutError;
            }
            router.push('/');
            router.refresh();
        } catch (logoutError) {
            console.error('ログアウトエラー:', logoutError);
            setError('ログアウトに失敗しました。時間をおいて再度お試しください。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="rounded bg-gray-800 px-4 py-2 text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {isLoading ? 'ログアウト中...' : 'ログアウト'}
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </>
    );
}