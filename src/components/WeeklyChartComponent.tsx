'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyData {
    week: string;
    count: number;
}

interface WeeklyChartComponentProps {
    data: WeeklyData[];
    title?: string;
    barColor?: string;
    className?: string;
}

const WeeklyChartComponent: React.FC<WeeklyChartComponentProps> = ({
    data,
    title = "週ごとの参加数",
    barColor = "#ee7800",
    className = ""
}) => {
    if (!data || data.length === 0) {
        return (
            <div className={`bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm ${className}`}>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">{title}</h3>
                <div className="text-center py-8 text-gray-500">
                    週別データがありません
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm ${className}`}>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10 lg:mb-20">{title}</h3>
                <div className="h-48 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="week"
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                className="md:!text-xs"
                            />
                            <YAxis
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                                allowDecimals={false}
                                domain={[0, 'dataMax']}
                                className="md:!text-xs"
                            />
                            <Tooltip
                                formatter={(value) => [`${value}件`, '参加数']}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill={barColor}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
        </div>
    );
};

export default WeeklyChartComponent;