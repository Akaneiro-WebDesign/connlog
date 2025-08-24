'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TagData {
    name: string;
    value: number;
    color: string;
}

interface TagChartComponentProps {
    data: TagData[];
    title?: string;
    showLegend?: boolean;
    className?: string;
}

const TagChartComponent: React.FC<TagChartComponentProps> = ({
    data,
    title = "タグ別割合",
    showLegend = true,
    className = ""
}) => {
    if (!data || data.length === 0) {
        return (
            <div className={`bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm ${className}`}>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">{title}</h3>
                <div className="text-center py-8 text-gray-500">
                    タグデータがありません
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg p-4 md:p-6 lg:p-12 shadow-sm ${className}`}>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-10">{title}</h3>
            <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            className="md:!inner-radius-[60] md:!outer-radius-[100]"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`${value}%`, '']}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {showLegend && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <div
                                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-xs md:text-sm text-gray-700 truncate">
                                {item.name}({item.value}%)
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagChartComponent;
