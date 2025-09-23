'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import { EventSearchForm } from '@/components/EventSearchForm';
import {
    SearchCheck
} from 'lucide-react';

/**
 * connpassイベント検索・登録ページ
 * 認証必須のページとしてログイン状態をチェックし、未認証時は自動遷移
 */
export default function SearchPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Next.js hydration mismatch回避のため、クライアント側マウント状態を管理
    useEffect(() => {
        setMounted(true);
    }, []);

    // 認証状態確認後のリダイレクト処理（マウント完了後に実行）
    useEffect(() => {
        if (isLoading || !mounted) return;
        if(!user) {
            router.replace('/login');
            return;
        }
    }, [user, isLoading, mounted, router]);

    // SSR/CSRの差異を防ぐため、マウント前は何も表示しない
    if (!mounted) return null;

    if (isLoading) return <div className="flex items-center justify-center min-h-screen text-gray-600">ログイン状態を確認中...</div>;
    
    if (!user) return null;

    return (
        <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center">
        <div className="flex items-center justify-end w-full">
        {/* 簡易アバター表示（将来的にはプロフィール画像アップロード機能予定） */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm" style={{backgroundColor:'#FF8C42'}}>
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
