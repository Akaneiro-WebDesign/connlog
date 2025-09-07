'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import { EventSearchForm } from '@/components/EventSearchForm';
import {
    SearchCheck
} from 'lucide-react';

export default function SearchPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoading || !mounted) return;
        if (!user) {
            router.replace('/login');
            return;
        }
    }, [user, isLoading, mounted, router]);

    if (!mounted) return null;
    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-600">ログイン状態を確認中...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center">
                    <div className="flex items-center justify-end w-full">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{ backgroundColor: '#FF8C42' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                        <SearchCheck className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">イベント登録</h1>
                    </div>

                    <EventSearchForm />
                </main>
            </div>
        </div>
    );
}