import React from 'react';

interface GroupedBarChartProps {
    title: string;
    data: { label: string; value1: number; value2: number }[];
    label1: string;
    label2: string;
    color1: string; // e.g., 'bg-blue-400'
    color2: string; // e.g., 'bg-pink-400'
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ title, data, label1, label2, color1, color2 }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.value1, d.value2]), 1); // Use 1 to avoid division by zero

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-96 flex flex-col">
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-700">{title}</h3>
                <div className="flex items-center space-x-4 text-xs font-medium">
                     <div className="flex items-center"><span className={`w-3 h-3 rounded-sm mr-1.5 ${color1}`}></span>{label1}</div>
                     <div className="flex items-center"><span className={`w-3 h-3 rounded-sm mr-1.5 ${color2}`}></span>{label2}</div>
                </div>
            </div>
            {data.length > 0 ? (
                <div className="flex-grow flex items-end justify-around space-x-2 mt-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end items-center">
                             <div className="w-full h-full flex items-end justify-center gap-px">
                                <div className="w-1/2 h-full flex flex-col justify-end items-center">
                                    <span className="text-xs text-gray-600 font-semibold">{item.value1}</span>
                                    <div
                                        className={`${color1} w-full rounded-t-sm hover:opacity-80 transition-opacity`}
                                        style={{ height: `${(item.value1 / maxValue) * 100}%` }}
                                        title={`${label1}: ${item.value1}`}
                                    ></div>
                                </div>
                                 <div className="w-1/2 h-full flex flex-col justify-end items-center">
                                     <span className="text-xs text-gray-600 font-semibold">{item.value2}</span>
                                    <div
                                        className={`${color2} w-full rounded-t-sm hover:opacity-80 transition-opacity`}
                                        style={{ height: `${(item.value2 / maxValue) * 100}%` }}
                                        title={`${label2}: ${item.value2}`}
                                    ></div>
                                </div>
                            </div>
                            <div className="mt-1 text-xs text-center font-medium text-gray-500 truncate w-full">{item.label}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">No data available</div>
            )}
        </div>
    );
};

export default GroupedBarChart;
