'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import { colors, cn } from '@/lib/design-system';

interface NavItem {
    id: string;
    label: string;
    icon: string;
    href: string;
    isActive?: boolean;
}

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();

    // ナビゲーションアイテム定義
    const navItems: NavItem[] = [
        {
            id: 'dashboard',
            label: 'ダッシュボード',
            icon: '',
            href: '/dashboard',
        },
        {
            id: 'search',
            label: 'イベント検索',
            icon: '',
            href: '/search',
        },
        {
            id: 'events',
            label: 'イベント履歴',
            icon: '',
            href: '/events',
        },
        {
            id: 'analysis',
            label: 'スキル分析',
            icon: '',
            href: '/analysis',
        },
        {
            id: 'profile',
            label: 'アカウント設定',
            icon: '',
            href: '/profile',
        },
    ];

    return (
        <div>
        <h1>Sidebar開発中</h1>
        </div>
    );
}