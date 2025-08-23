'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import { colors, cn } from '@/lib/design-system';
import { useState, useEffect } from 'react';
import {
LayoutDashboard,
CalendarPlus,
CalendarClock,
ChartPie,
UserCog,
LucideIcon,
ArrowLeftToLine,
Menu
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

    // モバイルメニューを閉じる
    setIsMobileMenuOpen(false);
};

    // モバイルメニューの開閉
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
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
        className="lg:hidden fixed top-4 left-4 z-50 p-1 rounded-md transition-colors flex items-center justify-center"
        aria-label="メニューを開く"
        >

        {isMobileMenuOpen ? (
            <ArrowLeftToLine className="w-6 h-6 text-white" />
        ) : (
            <Menu className="w-6 h-6 text-gray-600" />
        )}
        </button>

        {/* モバイル用オーバーレイ　 */}
        {isMobileMenuOpen && (
            <div
            className="lg:hidden fixed inset-0 z-40 "
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setIsMobileMenuOpen(false)}
            />
        )}
        {/* サイドバー本体 */}
    <div className={cn(
        // デスクトップ用の基本スタイル
        'bg-gray-100 border-r border-gray-200 flex flex-col min-h-screen',
        //モバイル用のスタイル
        'lg:relative lg:translate-x-0 lg:w-64 xl:w-77',
        // モバイルでの表示制御
        'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
    )}>   
        {/* ヘッダー */}
        <div className="bg-red-600 text-white px-4 lg:px-6 h-16 flex items-center justify-center flex-shrink-0">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold">ConnLog</h1>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 px-2 lg:px-3 pt-8 lg:pt-13 py-3">
            <div className="space-y-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className={cn(
                            "w-full flex items-center px-3 lg:px-6 xl:px-10 py-2 lg:py-3 text-left rounded-md text-sm transition-all text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-semibold lg:font-black",
                        )}
                        >
                            {/* アイコン */}
                            <IconComponent className="mr-2 lg:mr-3 w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0"/>

                            {/* ラベル */}
                            <span className="text-sm lg:text-lg xl:text-xl truncate">
                                {item.label}
                            </span>
                       </button>
                    );
                })}
            </div>
        </nav>

        {/* フッター */}
        <div className="mt-auto px-3 lg:px-4 py-2 border-t border-gray-300 flex-shrink-0">
            <div className="text-xs text-gray-400 text-center">
                <p>© 2025 ConnLog</p>
            </div>
        </div>
    </div>
    </>
    );
}