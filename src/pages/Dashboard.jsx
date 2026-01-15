import React, { useState, useEffect } from 'react';
import { Wallet, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import {
    getAllGroups,
    getTokenBalance,
    getGroupInfo,
    getMemberInfo,
    getMemberCount,
    getSessionCount
} from '../services/contractService';
import StatsCard from '../components/StatsCard';
import GroupCard from '../components/GroupCard';

const Dashboard = () => {
    const { account, provider, isConnected } = useWeb3();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { title: 'Token Balance', value: '0 STUDY', icon: <Wallet size={20} />, trend: '--', trendUp: true },
        { title: 'Total Earned', value: '0 STUDY', icon: <Award size={20} />, trend: '--', trendUp: true },
        { title: 'Study Hours', value: '0 hrs', icon: <Clock size={20} />, trend: '--', trendUp: true },
        { title: 'Completed Sessions', value: '0', icon: <TrendingUp size={20} />, trend: '--', trendUp: false },
    ]);
    const [activeGroups, setActiveGroups] = useState([]);
    const [aggregatedMemberInfo, setAggregatedMemberInfo] = useState(null);

    useEffect(() => {
        if (isConnected && account && provider) {
            loadDashboardData();
        }
    }, [isConnected, account, provider]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            console.log('📊 Loading dashboard data...');

            // 1. Fetch token balance and all groups
            const [balance, allGroups] = await Promise.all([
                getTokenBalance(account, provider),
                getAllGroups(provider)
            ]);

            // 2. Fetch membership status for each group to find active ones
            const groupMembershipPromises = allGroups.map(async (group) => {
                const member = await getMemberInfo(account, provider, group.address);
                if (member.isMember) {
                    // If member, fetch full group details for the card
                    const fullGroupInfo = await getGroupInfo(provider, group.address);
                    const memberCount = await getMemberCount(provider, group.address);
                    return {
                        ...group,
                        ...fullGroupInfo,
                        id: group.id,
                        title: fullGroupInfo.title, // Ensure title comes from full info
                        description: fullGroupInfo.description,
                        stakeAmount: parseFloat(fullGroupInfo.stakeAmount),
                        members: memberCount,
                        maxMembers: fullGroupInfo.maxMembers,
                        deadline: new Date(fullGroupInfo.deadline).toLocaleDateString(),
                        isActive: fullGroupInfo.isActive,
                        memberStats: member // Store member stats for this group
                    };
                }
                return null;
            });

            const groupsWithMembership = await Promise.all(groupMembershipPromises);
            const joinedGroups = groupsWithMembership.filter(g => g !== null);

            console.log('✅ Joined groups:', joinedGroups);

            // 3. Aggregate Stats
            const aggregates = joinedGroups.reduce((acc, group) => {
                return {
                    stakedAmount: acc.stakedAmount + parseFloat(group.memberStats.stakedAmount),
                    studyHours: acc.studyHours + Number(group.memberStats.studyHours),
                    completedSessions: acc.completedSessions + Number(group.memberStats.completedSessions)
                };
            }, { stakedAmount: 0, studyHours: 0, completedSessions: 0 });

            // Update stats
            setStats([
                {
                    title: 'Token Balance',
                    value: `${parseFloat(balance).toFixed(2)} STUDY`,
                    icon: <Wallet size={20} />,
                    trend: '--',
                    trendUp: true
                },
                {
                    title: 'Total Staked',
                    value: `${aggregates.stakedAmount.toFixed(2)} STUDY`,
                    icon: <Award size={20} />,
                    trend: '--',
                    trendUp: true
                },
                {
                    title: 'Total Hours',
                    value: `${aggregates.studyHours} hrs`,
                    icon: <Clock size={20} />,
                    trend: '--',
                    trendUp: true
                },
                {
                    title: 'Total Sessions',
                    value: `${aggregates.completedSessions}`,
                    icon: <TrendingUp size={20} />,
                    trend: '--',
                    trendUp: false
                },
            ]);

            setActiveGroups(joinedGroups);
            setAggregatedMemberInfo(aggregates);

        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <Wallet className="mx-auto mb-4 text-emerald-400" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to view your dashboard</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back, Scholar. Here's your progress.</p>
                {activeGroups.length === 0 && !loading && (
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <p className="text-sm font-medium">💡 You haven't joined any study groups yet! Join one to start earning rewards.</p>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                            <div className="h-20 bg-slate-700/50 rounded"></div>
                        </div>
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <StatsCard key={index} {...stat} />
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Groups */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Active Study Group</h2>
                    </div>
                    {loading ? (
                        <div className="glass-panel rounded-2xl p-8 animate-pulse">
                            <div className="h-40 bg-slate-700/50 rounded"></div>
                        </div>
                    ) : activeGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeGroups.map(group => (
                                <GroupCard key={group.id} group={group} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel rounded-2xl p-12 text-center">
                            <AlertCircle className="mx-auto mb-2 text-slate-500" size={32} />
                            <p className="text-slate-400">No active groups</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions Sidebar */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="glass-panel rounded-2xl p-6">
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.href = '/session'}
                                className="w-full btn-primary py-3 text-sm"
                            >
                                Start Study Session
                            </button>
                            <button
                                onClick={() => window.location.href = '/groups'}
                                className="w-full btn-secondary py-3 text-sm"
                            >
                                View Study Groups
                            </button>
                            {activeGroups.length > 0 && aggregatedMemberInfo?.completedSessions > 0 && (
                                <button
                                    onClick={() => window.location.href = '/rewards'}
                                    className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 py-3 rounded-xl text-sm font-medium transition-all"
                                >
                                    Claim Rewards
                                </button>
                            )}
                        </div>

                        {/* Aggregate Stats */}
                        {activeGroups.length > 0 && aggregatedMemberInfo && (
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h3 className="text-sm font-medium text-slate-300 mb-4">Total Progress</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Active Groups:</span>
                                        <span className="text-white">{activeGroups.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Hours:</span>
                                        <span className="text-white">{aggregatedMemberInfo.studyHours} hrs</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Total Sessions:</span>
                                        <span className="text-white">{aggregatedMemberInfo.completedSessions}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
