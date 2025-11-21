
import React from 'react';

export const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; title?: string }> = ({ data, title }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-4">
            {title && <h3 className="text-gray-600 font-bold mb-4">{title}</h3>}
            <div className="relative w-32 h-32">
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="w-full h-full">
                    {data.map((slice, i) => {
                        if (slice.value === 0) return null;
                        const start = getCoordinatesForPercent(cumulativePercent);
                        const slicePercent = slice.value / total;
                        cumulativePercent += slicePercent;
                        const end = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                        const pathData = `M 0 0 L ${start[0]} ${start[1]} A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]} L 0 0`;
                        return <path key={i} d={pathData} fill={slice.color} />;
                    })}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">Total<br/>{total}</span>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600">{item.label} ({Math.round((item.value/total)*100)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LineChart: React.FC<{ data: { label: string; value: number }[]; title: string; color: string }> = ({ data, title, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxVal) * 80; // Leave 20% padding at top
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col h-64 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-bold mb-4">{title}</h3>
            <div className="flex-grow relative">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                    ))}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (d.value / maxVal) * 80;
                        return (
                            <g key={i} className="group">
                                <circle cx={x} cy={y} r="1.5" fill={color} className="transition-all group-hover:r-2" />
                                <rect x={x - 10} y={y - 15} width="20" height="10" fill="black" rx="2" opacity="0" className="group-hover:opacity-75 transition-opacity" />
                                <text x={x} y={y - 8} textAnchor="middle" fontSize="4" fill="white" opacity="0" className="group-hover:opacity-100 pointer-events-none">
                                    {d.value}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
                {data.filter((_, i) => i % Math.ceil(data.length/6) === 0).map((d, i) => ( // Show subset of labels
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </div>
    );
};

export const SimpleBarChart: React.FC<{ data: { label: string; value: number }[]; title: string; color: string }> = ({ data, title, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex flex-col h-64 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-bold mb-2">{title}</h3>
            <div className="flex items-end space-x-2 h-full pt-4">
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center group">
                        <div 
                            className={`w-full ${color} rounded-t opacity-80 group-hover:opacity-100 transition-all relative`} 
                            style={{ height: `${(d.value / maxVal) * 100}%` }}
                        >
                            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100">{d.value}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
