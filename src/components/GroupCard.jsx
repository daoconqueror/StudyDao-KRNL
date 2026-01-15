import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';

const GroupCard = ({ group, onJoin, isMember }) => {
    return (
        <div className="glass-panel rounded-2xl p-6 hover:scale-[1.02] transition-all duration-200 block"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                            {group.subject}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{group.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{group.description}</p>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Users size={16} />
                    <span>{group.members} / {group.maxMembers}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={16} />
                    <span>{group.deadline}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-amber-400 font-bold">
                    {group.stakeAmount} STUDY
                </div>
                <div className="flex gap-2">
                    {isMember ? (
                        <>
                            < Link
                                to={`/session/${group.address}`}
                                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                            >
                                📚 Study
                            </Link>
                            <Link
                                to={`/groups/${group.id}`}
                                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                            >
                                Details
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to={`/groups/${group.id}`}
                                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                            >
                                Join
                            </Link>
                            <Link
                                to={`/groups/${group.id}`}
                                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                            >
                                Details
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupCard;
