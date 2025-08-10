'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
    const { user, isLoading } = useUser();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLoading || !mounted) return;
        if(!user) {
            router.replace('/login');
            return;
        }
    }, [user, isLoading, mounted, router]);

    if(!mounted) return null;
    if(isLoading) return<div>ログイン状態を確認中…</div>;
    if(!user) return null;

    return(
        <div className="flex min-h screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-4">ようこそ、{user.email}さん</h1>
            </div>
        </div>
    );
    }