'use client';

import { useUser } from '@/components/UserProvider';
import { colors, cn } from '@/lib/design-system';
import UserMenuDropdown from '@/components/UserMenuDropdown';

interface HeaderProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
    const { user } = useUser();

    return (
        <header className={cn(
            'bg-white border-b border-gray-200',
            className
        )}>
            <div className="px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    {/* ページタイトルエリア */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {/* アクションエリア */}
                    <div className="flex items-center space-x-2 md:space-x-3 ml-4 flex-shrink-0">
                        {actions && (
                            <div className="hidden md:block">
                                {actions}
                            </div>
                        )}
                        {/* ユーザーメニュードロップダウン */}
                        <UserMenuDropdown />
                    </div>
                </div>
                {/* モバイル用アクション */}
                {actions && (
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
