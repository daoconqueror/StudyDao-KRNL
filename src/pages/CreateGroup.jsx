import React, { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ethers } from 'ethers';

const CreateGroup = () => {
    const { signer, isConnected, account } = useWeb3();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCreating, setIsCreating] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        stakeAmount: '10',
        maxMembers: '10',
        deadline: '',
        subject: 'Blockchain'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (!formData.title || !formData.description || !formData.deadline) {
            alert('Please fill in all required fields');
            return;
        }

        setIsCreating(true);

        try {
            const factoryAddress = import.meta.env.VITE_STUDY_GROUP_FACTORY_ADDRESS;

            if (!factoryAddress) {
                alert('StudyGroupFactory contract not deployed yet. For now, use the existing "Test KRNL Group" to test all features.');
                navigate('/groups');
                return;
            }

            // Calculate days until deadline
            const deadlineDate = new Date(formData.deadline);
            const now = new Date();
            const durationDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

            if (durationDays <= 0) {
                alert('Deadline must be in the future');
                setIsCreating(false);
                return;
            }

            // Convert stake amount to wei (assuming 18 decimals)
            const stakeAmountWei = ethers.parseEther(formData.stakeAmount);

            // Connect to factory contract
            const factoryABI = [
                "function createGroup(string title, string description, string subject, uint256 stakeAmount, uint256 maxMembers, uint256 durationDays) external returns (address)"
            ];

            const factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);

            console.log('📝 Creating group with parameters:', {
                title: formData.title,
                description: formData.description,
                subject: formData.subject,
                stakeAmount: stakeAmountWei.toString(),
                maxMembers: formData.maxMembers,
                durationDays
            });

            // Create the group
            const tx = await factoryContract.createGroup(
                formData.title,
                formData.description,
                formData.subject,
                stakeAmountWei,
                parseInt(formData.maxMembers),
                durationDays
            );

            console.log('⛓️ Transaction sent:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Group created! Block:', receipt.blockNumber);

            // Extract group address from GroupCreated event
            const groupCreatedEvent = receipt.logs.find(log => {
                try {
                    const parsed = factoryContract.interface.parseLog(log);
                    return parsed && parsed.name === 'GroupCreated';
                } catch {
                    return false;
                }
            });

            let groupAddress = null;
            if (groupCreatedEvent) {
                const parsed = factoryContract.interface.parseLog(groupCreatedEvent);
                groupAddress = parsed.args.groupAddress;
                console.log('📍 New group address:', groupAddress);
            }

            // Store group in Supabase for easy retrieval
            if (groupAddress && user) {
                try {
                    const { error: supabaseError } = await supabase
                        .from('study_groups')
                        .insert({
                            group_address: groupAddress.toLowerCase(),
                            chain_id: 11155111, // Sepolia
                            title: formData.title,
                            description: formData.description,
                            subject: formData.subject,
                            stake_amount: stakeAmountWei.toString(),
                            max_members: parseInt(formData.maxMembers),
                            duration_days: durationDays,
                            creator_address: account.toLowerCase(),
                            factory_address: import.meta.env.VITE_STUDY_GROUP_FACTORY_ADDRESS.toLowerCase(),
                            blockchain_tx_hash: tx.hash
                        });

                    if (supabaseError) {
                        console.warn('⚠️ Failed to store group in Supabase:', supabaseError);
                    } else {
                        console.log('💾 Group stored in Supabase');
                    }
                } catch (err) {
                    console.warn('⚠️ Supabase storage error:', err);
                }
            }

            alert(`Group "${formData.title}" created successfully!`);
            navigate('/groups');

        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isConnected) {
        return (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to create a study group</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/groups" className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={20} /> Back to Groups
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Study Group</h1>
                <p className="text-slate-400">Deploy a new smart contract for your study group</p>
            </div>

            <div className="glass-panel rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Group Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="e.g., Advanced Smart Contract Development"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">Description & Goals *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input-field h-32 resize-none"
                            placeholder="Describe what members need to achieve to earn rewards..."
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Stake Amount (STUDY) *</label>
                            <input
                                type="number"
                                name="stakeAmount"
                                value={formData.stakeAmount}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="10"
                                min="0.1"
                                step="0.1"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Members will stake this amount to join</p>
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Max Members *</label>
                            <input
                                type="number"
                                name="maxMembers"
                                value={formData.maxMembers}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="10"
                                min="2"
                                max="100"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Deadline *</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="input-field"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">Rewards claimable after this date</p>
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Subject *</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option>Blockchain</option>
                                <option>Frontend Development</option>
                                <option>Backend Development</option>
                                <option>AI / Machine Learning</option>
                                <option>Mathematics</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                        <Link to="/groups" className="btn-secondary">Cancel</Link>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="btn-primary disabled:opacity-50 flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Creating...
                                </>
                            ) : (
                                'Create Group & Deploy'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 glass-panel rounded-xl p-4">
                <p className="text-sm text-slate-400">
                    <strong className="text-white">Note:</strong> Creating a new group deploys a smart contract (gas fees apply).
                    The factory will automatically mint 100 STUDY tokens as a welcome bonus if you're a first-time creator!
                </p>
            </div>
        </div>
    );
};

export default CreateGroup;
