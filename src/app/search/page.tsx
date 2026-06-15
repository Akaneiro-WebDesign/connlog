'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';
import { EventSearchForm } from '@/components/EventSearchForm';
import {
    SearchCheck
} from 'lucide-react';
import { Header } from '@/components/Header';

const SearchPageSkeleton = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 animate-pulse">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200" />
            <div className="h-8 md:h-9 w-40 md:w-52 rounded bg-gray-200" />
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-200" />
                <div className="h-4 w-32 rounded bg-gray-200" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-11 flex-1 rounded-lg bg-gray-200" />
              <div className="h-11 w-24 md:w-36 rounded-lg bg-gray-200" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

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
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, isLoading, mounted, router]);

  if (!mounted || isLoading) return <SearchPageSkeleton />;

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 px-4 md:px-8 lg:px-28 py-6 md:py-8 lg:py-10">
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
