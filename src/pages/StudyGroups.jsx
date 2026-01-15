import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Loader, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import GroupCard from '../components/GroupCard';

const StudyGroups = () => {
    const { account, provider, signer, isConnected } = useWeb3();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [balance, setBalance] = useState('0');

    useEffect(() => {
        if (isConnected && account && provider) {
            loadGroupsData();
        }
    }, [isConnected, account, provider]);

    const loadGroupsData = async () => {
        try {
            setLoading(true);
            console.log('📚 Loading groups data...');

            // Get all groups from factory
            const allGroupsData = await getAllGroups(provider);
            console.log('Found groups from factory:', allGroupsData);

            // Fetch details for each group
            const groupsWithDetails = await Promise.all(
                allGroupsData.map(async (groupMeta) => {
                    try {
                        const [info, member, count] = await Promise.all([
                            getGroupInfo(provider, groupMeta.address),
                            getMemberInfo(account, provider, groupMeta.address),
                            getMemberCount(provider, groupMeta.address)
                        ]);

                        return {
                            id: groupMeta.id,
                            title: info.title,
                            description: info.description,
                            stakeAmount: parseFloat(info.stakeAmount),
                            members: count,
                            maxMembers: info.maxMembers,
                            deadline: new Date(info.deadline).toLocaleDateString(),
                            isActive: info.isActive,
                            address: groupMeta.address,
                            isMember: member.isMember
                        };
                    } catch (err) {
                        console.error(`Error loading group ${groupMeta.address}:`, err);
                        return null;
                    }
                })
            );

            // Filter out failed groups
            const validGroups = groupsWithDetails.filter(g => g !== null);

            // Get user's wallet data
            const tokenBalance = await getTokenBalance(account, provider);

            setBalance(tokenBalance);
            setGroups(validGroups);

            console.log('✅ Groups loaded:', validGroups);
        } catch (error) {
            console.error('❌ Error loading groups:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to view study groups</p>
                </div>
            </div>
        );
    }



    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Study Groups</h1>
                    <p className="text-slate-400">Join a group, stake tokens, and start learning together.</p>
                </div>
                <Link to="/create-group" className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Create Group
                </Link>
            </div>



            {/* Groups List */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="text-emerald-400" size={24} />
                        Available Groups
                    </h2>
                    <div className="text-sm text-slate-400">
                        {groups.reduce((sum, g) => sum + (g.members || 0), 0)} members participating
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="glass-panel rounded-2xl p-6 animate-pulse">
                                <div className="h-48 bg-slate-700/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <GroupCard key={group.id} group={group} isMember={group.isMember} />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel rounded-2xl p-12 text-center">
                        <p className="text-slate-400">No active groups available</p>
                    </div>
                )}
            </div>

            {/* How It Works */}
            <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">How Study Groups Work</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Stake Tokens</h3>
                                <p className="text-sm text-slate-400">Lock your STUDY tokens to join the group</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Study & Submit</h3>
                                <p className="text-sm text-slate-400">Complete study sessions and submit your notes</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                                <h3 className="text-white font-medium mb-1">AI Verification</h3>
                                <p className="text-sm text-slate-400">Your work is verified by AI for authenticity</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">4</div>
                            <div>
                                <h3 className="text-white font-medium mb-1">Earn Rewards</h3>
                                <p className="text-sm text-slate-400">Get 120% back - your stake + 20% bonus!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyGroups;
