import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Save, ArrowRight, Maximize2, CheckCircle, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useAuth } from '../context/AuthContext';
import { executeStudySessionWorkflow } from '../services/krnlWorkflowService';
import { getGroupInfo } from '../services/contractService';

const StudySession = () => {
    const { account, provider, signer, isConnected } = useWeb3();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { groupAddress } = useParams(); // Get group address from URL

    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [focusMode, setFocusMode] = useState(false);
    const [notes, setNotes] = useState('');
    const [groupInfo, setGroupInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (isConnected && provider) {
            loadGroupInfo();
        }
    }, [isConnected, provider]);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const loadGroupInfo = async () => {
        if (!groupAddress) {
            console.error('No group address provided');
            return;
        }
        try {
            const info = await getGroupInfo(provider, groupAddress);
            setGroupInfo(info);
        } catch (error) {
            console.error('Error loading group info:', error);
        }
    };

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmitSession = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        if (seconds < 300) { // Less than 5 minutes
            alert('Session must be at least 5 minutes long');
            return;
        }

        if (!notes.trim()) {
            alert('Please add some study notes before submitting');
            return;
        }

        setIsSubmitting(true);

        try {
            console.log('🚀 Submitting study session...');

            const result = await executeStudySessionWorkflow({
                userId: account,
                groupId: 1, // Using test group
                notes: notes,
                duration: Math.floor(seconds / 60), // Convert to minutes
                signer: signer, // Pass signer for blockchain submission
                account: account,
                groupAddress: groupAddress // Pass group address from URL
            });

            console.log('✅ Session submitted:', result);

            setSubmitSuccess(true);

            // Navigate to verification results after 2 seconds
            setTimeout(() => {
                navigate('/verification', { state: { result } });
            }, 2000);

        } catch (error) {
            console.error('❌ Error submitting session:', error);
            alert('Failed to submit session: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to start a study session</p>
                </div>
            </div>
        );
    }

    if (submitSuccess) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <CheckCircle className="mx-auto mb-4 text-emerald-400" size={64} />
                    <h2 className="text-2xl font-bold text-white mb-2">Session Submitted!</h2>
                    <p className="text-slate-400 mb-4">Your study session has been submitted for AI verification</p>
                    <p className="text-sm text-slate-500">Redirecting to verification results...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-[calc(100vh-64px)] flex flex-col ${focusMode ? 'fixed inset-0 z-50 bg-slate-950 p-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">{groupInfo?.title || 'Study Session'}</h1>
                    <p className="text-emerald-400 text-sm">{isActive ? 'Session in progress' : 'Ready to study'}</p>
                </div>
                <button
                    onClick={() => setFocusMode(!focusMode)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow">
                {/* Timer & Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel rounded-2xl p-8 text-center">
                        <div className="text-6xl font-mono font-bold text-white mb-8 tracking-wider">
                            {formatTime(seconds)}
                        </div>

                        <div className="flex justify-center gap-4 mb-8">
                            {!isActive ? (
                                <button
                                    onClick={() => setIsActive(true)}
                                    className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transition-all"
                                >
                                    <Play size={28} className="ml-1" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsActive(false)}
                                    className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    <Pause size={28} />
                                </button>
                            )}
                            <button
                                onClick={() => { setIsActive(false); setSeconds(0); setNotes(''); }}
                                className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-all"
                            >
                                <Square size={24} />
                            </button>
                        </div>

                        <div className="text-sm text-slate-500">
                            {seconds >= 300 ? (
                                <span className="text-emerald-400">✓ Minimum time reached</span>
                            ) : (
                                <span>Minimum: 5 minutes</span>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4">Session Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Subject:</span>
                                <span className="text-white">{groupInfo?.subject || 'Blockchain'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Duration:</span>
                                <span className="text-white">{formatTime(seconds)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Words:</span>
                                <span className="text-white">{notes.trim().split(/\s+/).length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Area */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="glass-panel rounded-2xl p-1 flex-grow flex flex-col">
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                            <span className="text-slate-400 font-medium">Study Notes</span>
                            <span className="text-emerald-400 flex items-center gap-2 text-sm">
                                <Save size={16} /> Type to save
                            </span>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="flex-grow w-full bg-transparent p-6 text-slate-200 resize-none focus:outline-none font-mono leading-relaxed"
                            placeholder="# Start typing your study notes here...

Example:
- What I learned about smart contracts
- Key concepts in Solidity
- Implementation details
- Questions for review

The AI will analyze your notes for quality and relevance."
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary px-6 py-3"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitSession}
                            disabled={isSubmitting || seconds < 300 || !notes.trim()}
                            className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    End Session & Submit <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudySession;
