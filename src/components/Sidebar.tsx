'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
ArrowLeftToLine,
CalendarClock,
ChartPie,
LayoutDashboard,
Menu,
SearchCheck,
UserCog,
} from 'lucide-react';
import { cn } from '@/lib/design-system';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            icon: SearchCheck,
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
            href: '/skills',
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

    // モバイルメニューを閉じる
    setIsMobileMenuOpen(false);
};

    // モバイルメニューの開閉
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

    // ページ変更時にモバイルメニューを閉じる
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // モバイルメニューが開いている時のボディスクロール防止
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
        {/* モバイル用ハンバーガーボタン */}
        <button
        onClick={toggleMobileMenu}
        className="fixed left-4 top-4 z-[80] flex items-center justify-center rounded-md p-1 transition-colors lg:hidden"
        aria-label="メニューを開く"
        >

        {isMobileMenuOpen ? (
            <ArrowLeftToLine className="h-6 w-6 text-white" />
        ) : (
            <Menu className="h-6 w-6 text-gray-600" />
        )}
        </button>

        {/* モバイル用オーバーレイ　 */}
        {isMobileMenuOpen && (
            <div
            className="fixed inset-0 z-[60] lg:hidden"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        {/* サイドバー本体 */}
    <div className={cn(
        // デスクトップ用の基本スタイル
        'flex min-h-screen flex-col border-r border-gray-200 bg-gray-100',
        //モバイル用のスタイル
        'lg:relative lg:w-64 lg:translate-x-0 xl:w-77',
        // モバイルでの表示制御
        'fixed inset-y-0 left-0 z-[70] w-64 transform transition-transform duration-300 ease-in-out',
        isMobileMenuOpen
            ?'translate-x-0'
            : '-translate-x-full lg:translate-x-0',
            className,
        )}
        >   
        {/* ヘッダー */}
        <div className="flex h-16 flex-shrink-0 items-center justify-center bg-red-600 px-4 text-white lg:px-6">
            <h1 className="text-xl font-bold lg:text-2xl xl:text-3xl">ConnLog</h1>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-2 py-3 pt-8 lg:px-3 lg:pt-13">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                            'flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:text-gray-900 lg:px-6 lg:py-3 lg:font-black xl:px-10',
                        )}
                        >
                            {/* アイコン */}
                            <IconComponent className="mr-2 h-5 w-5 flex-shrink-0 lg:mr-3 lg:h-6 lg:w-6" />

                            {/* ラベル */}
                            <span className="truncate text-sm lg:text-lg xl:text-xl">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>

        {/* フッター */}
        <div className="mt-auto flex-shrink-0 border-t border-gray-300 px-3 py-2 lg:px-4">
            <div className="text-center text-xs text-gray-400">
                <p>© 2025-2026 ConnLog</p>
            </div>
        </div>
    </div>
    </>
    );
}