/**
 * ConnLog デザインシステム
 * カンプデザインに基づいたカラーパレットとUIコンポーネント
 */

export const colors = {
    // プライマリカラー - カンプのメインカラー
    primary: {
        50: '#FEF2F2',
        100: '#FEE2E2',
        200: '#FECACA',
        300: '#FCA5A5',
        400: '#F87171',
        500: '#EF4444', // メインの赤
        600: '#DC2626',
        700: '#B91C1C',
        800: '#991B1B',
        900: '#7F1D1D',
        },

// グレースケール　 -  カンプの背景・テキスト用
    gray: {
        25: '#FCFCFD',
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        },

    // チャートカラー - データ可視化用
    chart: {
        colors: [
            '#DC2626', // 赤
            '#F97316', // オレンジ  
            '#EAB308', // 黄
            '#22C55E', // 緑
            '#3B82F6', // 青
            '#9E9E9E', // グレー
            '#8B5CF6', // 紫
            '#EC4899', // ピンク
        ]
    },

    // セマンティックカラー
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
} as const;

// ユーティリティ関数
export const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
};