import React from 'react';

const StatsCard = ({ title, value, icon, trend, trendUp }) => {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-medium">{title}</h3>
                <div className="p-2 bg-slate-800/50 rounded-lg text-emerald-400 border border-white/5">
                    {icon}
                </div>
            </div>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-white">{value}</span>
                {trend && (
                    <span className={`text-sm mb-1 font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatsCard;
