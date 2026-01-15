import React, { useEffect, useState } from 'react';
import { User, MapPin, Calendar, Award, BookOpen, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { supabase } from '../lib/supabase';
import { getTokenBalance, getAllGroups, getMemberInfo, getGroupInfo } from '../services/contractService';

const Profile = () => {
    const { user } = useAuth();
    const { account, provider, isConnected } = useWeb3();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        balance: '0',
        groupsJoined: 0,
        totalHours: 0,
        completedSessions: 0,
        recentSessions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
        if (isConnected && account && provider) {
            fetchBlockchainData();
        }
    }, [user, isConnected, account, provider]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) setProfile(data);
    };

    const fetchBlockchainData = async () => {
        try {
            setLoading(true);

            // Get token balance
            const balance = await getTokenBalance(account, provider);

            // Get all groups
            const allGroups = await getAllGroups(provider);

            // Get groups where user is a member
            const memberGroups = [];
            let totalHours = 0;
            let totalSessions = 0;

            for (const group of allGroups) {
                try {
                    const [memberInfo, groupInfo] = await Promise.all([
                        getMemberInfo(account, provider, group.address),
                        getGroupInfo(provider, group.address)
                    ]);

                    if (memberInfo.isMember) {
                        memberGroups.push({
                            ...group,
                            title: groupInfo.title,
                            hours: memberInfo.studyHours,
                            sessions: memberInfo.completedSessions
                        });
                        totalHours += memberInfo.studyHours;
                        totalSessions += memberInfo.completedSessions;
                    }
                } catch (err) {
                    console.error('Error fetching group data:', err);
                }
            }

            setStats({
                balance,
                groupsJoined: memberGroups.length,
                totalHours,
                completedSessions: totalSessions,
                recentSessions: memberGroups.filter(g => g.sessions > 0).slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching blockchain data:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Scholar';
    const displayEmail = user?.email || '';
    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent';

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to view your profile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="glass-panel rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-400" />
                        )}
                    </div>
                </div>

                <div className="text-center md:text-left flex-grow">
                    <h1 className="text-3xl font-bold text-white mb-2">{displayName}</h1>
                    <p className="text-slate-400 mb-1">{displayEmail}</p>
                    <p className="text-xs text-slate-500 font-mono mb-4">{account}</p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <MapPin size={16} /> Web3 Scholar
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar size={16} /> Joined {joinDate}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="text-center px-6 py-3 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="text-2xl font-bold text-white">
                            {loading ? '...' : stats.groupsJoined}
                        </div>
                        <div className="text-xs text-slate-400">Groups</div>
                    </div>
                    <div className="text-center px-6 py-3 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="text-2xl font-bold text-white">
                            {loading ? '...' : `${stats.totalHours}h`}
                        </div>
                        <div className="text-xs text-slate-400">Studied</div>
                    </div>
                    <div className="text-center px-6 py-3 rounded-xl bg-slate-800/50 border border-white/5">
                        <div className="text-2xl font-bold text-emerald-400">
                            {loading ? '...' : parseFloat(stats.balance).toFixed(0)}
                        </div>
                        <div className="text-xs text-slate-400">STUDY</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-white mb-6">Achievements</h2>
                    <div className="glass-panel rounded-2xl p-6 grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col items-center text-center ${stats.groupsJoined > 0 ? '' : 'opacity-50'}`}>
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
                                <Award className="text-amber-400" size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">Early Adopter</div>
                            <div className="text-xs text-slate-500">
                                {stats.groupsJoined > 0 ? 'Unlocked!' : 'Join a group'}
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col items-center text-center ${stats.completedSessions >= 1 ? '' : 'opacity-50'}`}>
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                                <BookOpen className="text-emerald-400" size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">First Session</div>
                            <div className="text-xs text-slate-500">
                                {stats.completedSessions >= 1 ? 'Unlocked!' : 'Submit session'}
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col items-center text-center ${stats.totalHours >= 10 ? '' : 'opacity-50'}`}>
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                                <Clock className="text-blue-400" size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">10-Hour Club</div>
                            <div className="text-xs text-slate-500">
                                {stats.totalHours >= 10 ? 'Unlocked!' : `${stats.totalHours}/10 hrs`}
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col items-center text-center ${stats.completedSessions >= 10 ? '' : 'opacity-50'}`}>
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                <TrendingUp className="text-purple-400" size={24} />
                            </div>
                            <div className="text-sm font-bold text-white">Consistent</div>
                            <div className="text-xs text-slate-500">
                                {stats.completedSessions >= 10 ? 'Unlocked!' : `${stats.completedSessions}/10 sessions`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-6">Your Study Groups</h2>
                    <div className="glass-panel rounded-2xl p-6 space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">
                                <p>Loading activity...</p>
                            </div>
                        ) : stats.recentSessions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p>No recent activity. Join a group to get started!</p>
                            </div>
                        ) : (
                            stats.recentSessions.map((session, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <CheckCircle className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{session.title}</div>
                                            <div className="text-sm text-slate-400">
                                                {session.sessions} session{session.sessions !== 1 ? 's' : ''} completed
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-emerald-400 font-bold">{session.hours}h</div>
                                        <div className="text-xs text-slate-500">studied</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
