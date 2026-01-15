import React, { useState, useEffect } from 'react';
import { Award, Gift, ArrowRight, History, Loader, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getTokenBalance, getMemberInfo, claimRewards, getAllGroups, getMemberCount, getGroupInfo } from '../services/contractService';

const Rewards = () => {
    const { account, provider, signer, isConnected } = useWeb3();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState('0');
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [claimingGroup, setClaimingGroup] = useState(null);

    useEffect(() => {
        if (isConnected && account && provider) {
            loadRewardsData();
        }
    }, [isConnected, account, provider]);

    const loadRewardsData = async () => {
        try {
            setLoading(true);
            console.log('💰 Loading rewards data...');

            // Get token balance
            const tokenBalance = await getTokenBalance(account, provider);
            setBalance(tokenBalance);

            // Get all groups from factory
            const allGroups = await getAllGroups(provider);

            // Filter groups where user is a member
            const groupsWithMemberInfo = await Promise.all(
                allGroups.map(async (group) => {
                    try {
                        const [memberInfo, memberCount, groupInfo] = await Promise.all([
                            getMemberInfo(account, provider, group.address),
                            getMemberCount(provider, group.address),
                            getGroupInfo(provider, group.address)
                        ]);

                        if (memberInfo.isMember) {
                            return {
                                ...group,
                                memberInfo,
                                memberCount,
                                deadline: groupInfo.deadline // Add deadline from groupInfo
                            };
                        }
                        return null;
                    } catch {
                        return null;
                    }
                })
            );

            const myGroups = groupsWithMemberInfo.filter(g => g !== null);
            setJoinedGroups(myGroups);

            console.log('✅ Joined groups loaded:', myGroups);
        } catch (error) {
            console.error('❌ Error loading rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimRewards = async (groupAddress, groupTitle) => {
        if (!signer) {
            alert('Please connect your wallet');
            return;
        }

        setClaimingGroup(groupAddress);

        try {
            console.log(`💸 Claiming rewards from ${groupTitle}...`);
            const txHash = await claimRewards(signer, groupAddress);
            console.log('✅ Rewards claimed! TX:', txHash);

            alert(`Successfully claimed rewards from "${groupTitle}"!`);

            // Reload data
            await loadRewardsData();

        } catch (error) {
            console.error('❌ Error claiming rewards:', error);
            alert('Failed to claim rewards: ' + error.message);
        } finally {
            setClaimingGroup(null);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to view your rewards</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Rewards</h1>
                <p className="text-slate-400">Claim your earned tokens from completed study groups.</p>
            </div>

            {/* Token Balance Card */}
            <div className="glass-panel rounded-2xl p-8 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-slate-400 font-medium mb-2">Your Token Balance</h3>
                    <div className="text-5xl font-bold text-white mb-2">
                        {parseFloat(balance).toFixed(2)} <span className="text-2xl text-emerald-400">STUDY</span>
                    </div>
                    <p className="text-sm text-slate-500">Earn more by completing study sessions!</p>
                </div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Joined Groups Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Your Study Groups</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                            <div className="h-32 bg-slate-700/50 rounded"></div>
                        </div>
                    ))}
                </div>
            ) : joinedGroups.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <Gift className="mx-auto mb-4 text-slate-600" size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">No Groups Joined Yet</h3>
                    <p className="text-slate-400 mb-6">Join a study group to start earning rewards!</p>
                    <a href="/groups" className="btn-primary inline-block">
                        Browse Groups
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedGroups.map((group) => {
                        const isDeadlinePassed = new Date(group.deadline) < new Date();
                        const hasCompleted = group.memberInfo.completedSessions > 0;
                        const hasWithdrawn = group.memberInfo.hasWithdrawn;
                        const canClaim = isDeadlinePassed && hasCompleted && !hasWithdrawn;

                        return (
                            <div key={group.address} className="glass-panel rounded-2xl p-6 hover:scale-[1.02] transition-all">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-white mb-1">{group.title}</h3>
                                    <p className="text-sm text-slate-400">
                                        {group.memberCount} members
                                    </p>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Sessions Completed:</span>
                                        <span className="text-white font-medium">{group.memberInfo.completedSessions}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Study Hours:</span>
                                        <span className="text-white font-medium">{group.memberInfo.studyHours} hrs</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Staked:</span>
                                        <span className="text-amber-400 font-medium">
                                            {parseFloat(group.memberInfo.stakedAmount).toFixed(0)} STUDY
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Status:</span>
                                        <span className={`font-medium ${isDeadlinePassed ? 'text-blue-400' : 'text-emerald-400'}`}>
                                            {isDeadlinePassed ? 'Completed' : 'Active'}
                                        </span>
                                    </div>
                                </div>

                                {canClaim ? (
                                    <button
                                        onClick={() => handleClaimRewards(group.address, group.title)}
                                        disabled={claimingGroup === group.address}
                                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {claimingGroup === group.address ? (
                                            <>
                                                <Loader className="animate-spin" size={16} />
                                                Claiming...
                                            </>
                                        ) : (
                                            <>
                                                <Award size={16} />
                                                Claim Rewards
                                            </>
                                        )}
                                    </button>
                                ) : hasWithdrawn ? (
                                    <div className="text-center py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                                        <CheckCircle size={16} className="inline mr-1" />
                                        Rewards Claimed!
                                    </div>
                                ) : !isDeadlinePassed ? (
                                    <div className="text-center py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
                                        Deadline: {new Date(group.deadline).toLocaleDateString()}
                                    </div>
                                ) : (
                                    <div className="text-center py-3 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 text-sm">
                                        No sessions completed
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Rewards;
