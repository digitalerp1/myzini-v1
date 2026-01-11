
import React from 'react';

export const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; title?: string }> = ({ data, title }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    if (total === 0) return (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md p-4">
            {title && <h3 className="text-gray-600 font-bold mb-4">{title}</h3>}
            <p className="text-gray-400 italic">No data to display</p>
        </div>
    );

    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[16rem] bg-white rounded-xl shadow-md p-4">
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
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-gray-400 block leading-tight uppercase">Total</span>
                        <span className="text-sm font-bold text-gray-700">{total}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-500 truncate" title={item.label}>{item.label}: {item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LineChart: React.FC<{ data: { label: string; value: number }[]; title: string; color: string }> = ({ data, title, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const points = data.length > 1 ? data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxVal) * 85; 
        return `${x},${y}`;
    }).join(' ') : "0,100 100,100";

    return (
        <div className="flex flex-col h-64 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-bold mb-4">{title}</h3>
            <div className="flex-grow relative">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {[0, 25, 50, 75, 100].map(y => (
                        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                    ))}
                    <polyline fill="none" stroke={color} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (d.value / maxVal) * 85;
                        return (
                            <g key={i} className="group">
                                <circle cx={x} cy={y} r="1.5" fill={color} />
                                <text x={x} y={y - 5} textAnchor="middle" fontSize="4" fill={color} className="font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                {data.map((d, i) => (
                    <span key={i} className="w-0 overflow-visible text-center translate-x-[-50%]">{d.label}</span>
                ))}
            </div>
        </div>
    );
};

export const SimpleBarChart: React.FC<{ data: { label: string; value: number }[]; title: string; color: string }> = ({ data, title, color }) => {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex flex-col h-full min-h-[16rem] bg-white rounded-xl shadow-md p-6">
            <h3 className="text-gray-700 font-bold mb-4">{title}</h3>
            {data.length > 0 ? (
                <div className="flex items-end space-x-2 h-full pt-4">
                    {data.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                            <div 
                                className={`w-full ${color} rounded-t opacity-85 group-hover:opacity-100 transition-all relative`} 
                                style={{ height: `${(d.value / maxVal) * 100}%` }}
                            >
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {d.value.toLocaleString()}
                                </div>
                            </div>
                            <span className="text-[9px] text-gray-500 mt-2 truncate w-full text-center font-medium" title={d.label}>{d.label}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 italic">No data recorded</div>
            )}
        </div>
    );
};
