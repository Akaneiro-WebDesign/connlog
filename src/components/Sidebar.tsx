'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import { colors, cn } from '@/lib/design-system';
import {
LayoutDashboard,
Search,
Calendar,
BarChart3,
Settings,
LucideIcon
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
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
            icon: LayoutDashboard,
            href: '/dashboard',
        },
        {
            id: 'search',
            label: 'イベント検索',
            icon: Search,
            href: '/search',
        },
        {
            id: 'events',
            label: 'イベント履歴',
            icon: Calendar,
            href: '/events',
        },
        {
            id: 'analysis',
            label: 'スキル分析',
            icon: BarChart3,
            href: '/analysis',
        },
        {
            id: 'profile',
            label: 'アカウント設定',
            icon: Settings,
            href: '/profile',
        },
    ];

    // ナビゲーション処理
    const handleNavigation = (href: string) => {
        router.push(href);
    };

    return (
        <div>
        <h1>Sidebar開発中</h1>
        </div>
    );
}