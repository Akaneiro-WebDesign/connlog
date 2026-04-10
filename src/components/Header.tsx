'use client';

import { cn } from '@/lib/design-system';
import UserMenuDropdown from '@/components/UserMenuDropdown';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function Header({ title, subtitle, actions, className }: HeaderProps) {
    const hasTitleArea = Boolean(title || subtitle);

    return (
        <header
            className={cn(
                'bg-white border-b border-gray-200',
                className
            )}
            >
            <div className="px-4 md:px-6 py-3 md:py-4">
                <div className="flex items-center justify-between">
                    {/* ページタイトルエリア */}
                    {hasTitleArea ? (
                    <div className="flex-1 min-w-0">
                        {title ? (
                        <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                            {title}
                        </h1>
                        ) : null}
                        {subtitle ? (
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5 truncate">
                                {subtitle}
                            </p>
                        ) : null}
                        </div>
                    ) : null}
                    {/* アクションエリア */}
                    <div
                    className={cn(
                        'flex items-center space-x-2 md:space-x-3 flex-shrink-0',
                        hasTitleArea ? 'ml-4' : 'ml-auto'
                        )}
                        >
                        {actions ? <div className="hidden md:block">{actions}</div> : null}
                        {/* ユーザーメニュードロップダウン */}
                        <UserMenuDropdown />
                    </div>
                </div>
                {/* モバイル用アクション */}
                {actions ? (
                    <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                        {actions}
                    </div>
                ) : null}
            </div>
        </header>
    );
}
