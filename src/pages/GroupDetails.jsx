import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Clock, Target, ShieldCheck, ArrowLeft, Play, Loader, CheckCircle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import {
    getAllGroups,
    getGroupInfo,
    getMemberInfo,
    getMemberCount,
    getTokenBalance,
    approveTokens,
    joinStudyGroup
} from '../services/contractService';
import { useToast } from '../context/ToastContext';

const GroupDetails = () => {
    const { id } = useParams();
    const { account, provider, signer, isConnected } = useWeb3();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [groupAddress, setGroupAddress] = useState(null);
    const [groupInfo, setGroupInfo] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);
    const [memberCount, setMemberCount] = useState(0);
    const [balance, setBalance] = useState('0');
    const [isJoining, setIsJoining] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    useEffect(() => {
        if (isConnected && provider) {
            loadGroupDetailsData();
        }
    }, [isConnected, provider]);

    const loadGroupDetailsData = async () => {
        try {
            setLoading(true);
            console.log('📖 Loading group details...');

            // First find the group address
            const allGroups = await getAllGroups(provider);
            const targetGroup = allGroups.find(g => g.id.toString() === id);

            if (!targetGroup) {
                console.error('Group not found');
                toastError('Group not found');
                setLoading(false);
                return;
            }

            setGroupAddress(targetGroup.address);

            const [group, member, count, tokenBalance] = await Promise.all([
                getGroupInfo(provider, targetGroup.address),
                getMemberInfo(account, provider, targetGroup.address),
                getMemberCount(provider, targetGroup.address),
                getTokenBalance(account, provider)
            ]);

            setGroupInfo(group);
            setMemberInfo(member);
            setMemberCount(count);
            setBalance(tokenBalance);

            console.log('✅ Group details loaded:', { group, member, count });
        } catch (err) {
            console.error('❌ Error loading group details:', err);
            toastError('Failed to load group details');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!signer) {
            toastError('Please connect your wallet');
            return;
        }

        if (memberInfo?.isMember) {
            toastError('You are already a member of this group!');
            return;
        }

        const stakeAmount = parseFloat(groupInfo?.stakeAmount || 0);
        const userBalance = parseFloat(balance);

        if (userBalance < stakeAmount) {
            toastError(`Insufficient balance. You need ${stakeAmount} STUDY tokens to join.`);
            return;
        }

        setIsJoining(true);

        try {
            console.log('🎯 Joining study group...');

            // Step 1: Approve tokens
            console.log(`✅ Approving ${stakeAmount} STUDY tokens...`);
            await approveTokens(stakeAmount, signer, groupAddress);

            // Step 2: Join group
            console.log('✅ Joining group...');
            const txHash = await joinStudyGroup(signer, groupAddress);

            console.log('🎉 Successfully joined! TX:', txHash);
            success('Successfully joined the study group!');
            setJoinSuccess(true);

            // Reload data
            setTimeout(() => {
                loadGroupDetailsData();
                setJoinSuccess(false);
            }, 3000);

        } catch (err) {
            console.error('❌ Error joining group:', err);
            toastError('Failed to join group: ' + (err.reason || err.message));
        } finally {
            setIsJoining(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to view group details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center">
                    <Loader className="animate-spin text-emerald-400" size={48} />
                </div>
            </div>
        );
    }

    const daysUntilDeadline = groupInfo ? Math.ceil((new Date(groupInfo.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/groups" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Groups
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                {groupInfo?.subject || 'Blockchain'}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                                {groupInfo?.stakeAmount || '10'} STUDY Stake
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">
                            {groupInfo?.title || 'Study Group'}
                        </h1>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            {groupInfo?.description || 'Study group description...'}
                        </p>
                    </div>

                    <div className="glass-panel rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Study Requirements</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-300">
                                <Target className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                <span>Submit study sessions regularly with quality notes</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <ShieldCheck className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                <span>Pass AI verification for authenticity and quality</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-300">
                                <Clock className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
                                <span>Complete before {new Date(groupInfo?.deadline).toLocaleDateString()} deadline</span>
                            </li>
                        </ul>
                    </div>

                    {/* Member Status */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            Members ({memberCount} / {groupInfo?.maxMembers || 0})
                        </h2>
                        <div className="glass-panel rounded-2xl p-6">
                            {memberInfo?.isMember ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div>
                                            <div className="text-white font-medium">You are a member!</div>
                                            <div className="text-emerald-400 text-sm">
                                                Joined {new Date(memberInfo.joinedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white font-bold">{parseFloat(memberInfo.stakedAmount).toFixed(2)} STUDY</div>
                                            <div className="text-slate-400 text-xs">Staked</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                                            <div className="text-slate-400 text-sm mb-1">Study Hours</div>
                                            <div className="text-white font-bold text-2xl">{memberInfo.studyHours}</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                                            <div className="text-slate-400 text-sm mb-1">Sessions</div>
                                            <div className="text-white font-bold text-2xl">{memberInfo.completedSessions}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="mx-auto mb-4 text-slate-500" size={48} />
                                    <p className="text-slate-400 mb-4">{memberCount} member{memberCount !== 1 ? 's' : ''} in this group</p>
                                    <p className="text-sm text-slate-500">Join the group to see member details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-2xl p-6 sticky top-24">
                        <div className="mb-6">
                            <div className="text-slate-400 text-sm mb-1">Deadline</div>
                            <div className="text-xl font-bold text-white">
                                {new Date(groupInfo?.deadline).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Ended'}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Group Progress</span>
                                <span className="text-emerald-400">
                                    {memberCount} / {groupInfo?.maxMembers || 0} members
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(memberCount / (groupInfo?.maxMembers || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {memberInfo?.isMember ? (
                            <div className="space-y-3">
                                <Link to="/session" className="w-full btn-primary flex items-center justify-center gap-2">
                                    <Play size={20} /> Start Study Session
                                </Link>
                                <Link to="/rewards" className="w-full btn-secondary flex items-center justify-center gap-2">
                                    View Rewards
                                </Link>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleJoinGroup}
                                    disabled={isJoining || joinSuccess}
                                    className="w-full btn-primary text-lg font-bold py-4 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader className="animate-spin" size={24} />
                                            Joining...
                                        </>
                                    ) : joinSuccess ? (
                                        <>
                                            <CheckCircle size={24} />
                                            Joined!
                                        </>
                                    ) : (
                                        `Stake ${groupInfo?.stakeAmount || 0} STUDY to Join`
                                    )}
                                </button>
                                <p className="text-xs text-slate-500 text-center mt-4">
                                    Your balance: {parseFloat(balance).toFixed(2)} STUDY
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
