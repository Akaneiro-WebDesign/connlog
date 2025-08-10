'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import { colors, cn } from '@/lib/design-system';
import {
LayoutDashboard,
CalendarPlus,
CalendarClock,
ChartPie,
UserCog,
LucideIcon
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
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
            label: 'イベント登録',
            icon: CalendarPlus,
            href: '/search',
        },
        {
            id: 'events',
            label: 'イベント履歴',
            icon: CalendarClock,
            href: '/events',
        },
        {
            id: 'analysis',
            label: 'スキル分析',
            icon: ChartPie,
            href: '/analysis',
        },
        {
            id: 'profile',
            label: 'アカウント設定',
            icon: UserCog,
            href: '/profile',
        },
    ];

    // ナビゲーション処理
    const handleNavigation = (href: string) => {
        router.push(href);
    };

    return (
    <div className={cn(
        'w-52 border-r border-gray-200 flex flex-col h-screen',
        className
    )}
    style={{ backgroundColor: colors.sidebar.background}}
    >       {/* ヘッダー */}
        <div className="bg-red-600 text-white px-6 py-4 text-center">
            <h1 className="text-xl font-bold">ConnLog</h1>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-3 py-3">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className="
                            w-full flex items-center px-3 py-2.5 text-left rounded-md text-sm transition-all text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            {/* アイコン */}
                            <IconComponent className="mr-3 w-4 h-4"/>

                            {/* ラベル */}
                            <span>
                                {item.label}
                            </span>
                       </button>
                    );
                })}
            </div>
        </nav>

        {/* フッター */}
        <div className="mt-auto px-4 py-2 border-t border-gray-300">
            <div className="text-xs text-gray-400 text-center">
                <p>© 2025 ConnLog</p>
            </div>
        </div>
    </div>
    );
}