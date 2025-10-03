import React from 'react';

interface BarChartProps {
    title: string;
    data: { label: string; value: number }[];
    color: string; // e.g., 'bg-primary'
}

const BarChart: React.FC<BarChartProps> = ({ title, data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Use 1 as min to avoid division by zero

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-96 flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            {data.length > 0 ? (
                 <div className="flex-grow flex items-end justify-around space-x-2 pt-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end items-center text-center">
                            <div className="text-xs font-semibold text-gray-600" title={item.value.toLocaleString()}>{item.value.toLocaleString()}</div>
                            <div
                                className={`w-3/4 ${color} rounded-t-md hover:opacity-80 transition-opacity`}
                                style={{ height: `${(item.value / maxValue) * 90}%` }} // use 90% to leave space for value
                                title={`${item.label}: ${item.value.toLocaleString()}`}
                            ></div>
                            <div className="mt-1 w-full text-xs font-medium text-gray-500 truncate">{item.label}</div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="flex-grow flex items-center justify-center text-gray-500">No data available</div>
            )}
        </div>
    );
};

export default BarChart;
