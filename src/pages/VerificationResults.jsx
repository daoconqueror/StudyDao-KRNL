import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Share2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const VerificationResults = () => {
    const location = useLocation();
    const result = location.state?.result;

    // Determine status based on AI score
    let status = 'approved';
    if (!result) {
        status = 'pending';
    } else if (result.aiScore < 0.4) {
        status = 'rejected';
    }

    // Calculate score out of 100
    const scoreOutOf100 = result?.aiScore ? Math.round(result.aiScore * 100) : 0;

    // Determine content depth
    const getContentDepth = (score) => {
        if (score >= 0.8) return 'High';
        if (score >= 0.6) return 'Medium';
        if (score >= 0.4) return 'Low';
        return 'Very Low';
    };

    // Calculate reward (simplified - 5 STK base + bonus for quality)
    const baseReward = 5.0;
    const qualityBonus = result?.aiScore ? (result.aiScore - 0.6) * 10 : 0;
    const totalReward = Math.max(baseReward + qualityBonus, 0).toFixed(1);

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="glass-panel rounded-3xl p-10 text-center relative overflow-hidden">

                {/* Status Icon */}
                <div className="mb-6 flex justify-center">
                    {status === 'approved' && (
                        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="text-emerald-400 w-12 h-12" />
                        </div>
                    )}
                    {status === 'rejected' && (
                        <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center">
                            <XCircle className="text-rose-400 w-12 h-12" />
                        </div>
                    )}
                    {status === 'pending' && (
                        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                            <AlertTriangle className="text-amber-400 w-12 h-12" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    {status === 'approved' && 'Verification Successful!'}
                    {status === 'rejected' && 'Verification Failed'}
                    {status === 'pending' && 'Analyzing Session...'}
                </h1>

                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    {status === 'approved' && 'Great job! Our AI has verified your study session and it has been recorded on the blockchain.'}
                    {status === 'rejected' && 'Our AI could not verify your activity. Please ensure your notes are detailed and relevant.'}
                    {status === 'pending' && 'Please wait while KRNL processes your study logs and cross-references your goals.'}
                </p>

                {status === 'approved' && result && (
                    <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-white/5 text-left">
                        <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">AI Analysis Report</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Relevance Score</span>
                                <span className={`font-bold ${scoreOutOf100 >= 80 ? 'text-emerald-400' : scoreOutOf100 >= 60 ? 'text-amber-400' : 'text-orange-400'}`}>
                                    {scoreOutOf100}/100
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Content Depth</span>
                                <span className={`font-bold ${result.aiScore >= 0.8 ? 'text-emerald-400' : result.aiScore >= 0.6 ? 'text-amber-400' : 'text-orange-400'}`}>
                                    {getContentDepth(result.aiScore)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Time Validation</span>
                                <span className="text-emerald-400 font-bold">Verified</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Study Duration</span>
                                <span className="text-white font-bold">{result.duration} minutes</span>
                            </div>
                            {result.details && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Word Count</span>
                                        <span className="text-white font-bold">{result.details.wordCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Keywords Found</span>
                                        <span className="text-white font-bold">{result.details.relevantKeywords}</span>
                                    </div>
                                </>
                            )}
                            <div className="pt-3 mt-3 border-t border-white/5">
                                <p className="text-xs text-slate-400 mb-2">AI Feedback:</p>
                                <p className="text-sm text-slate-300 italic">"{result.aiAnalysis}"</p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-white/5 flex justify-between items-center">
                                <span className="text-white font-medium">Estimated Reward</span>
                                <span className="text-amber-400 font-bold text-lg">{totalReward} STUDY</span>
                            </div>
                            {result.txHash && (
                                <div className="pt-3 mt-3 border-t border-white/5">
                                    <p className="text-xs text-slate-400 mb-1">Blockchain Transaction:</p>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-mono break-all"
                                    >
                                        {result.txHash}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard" className="btn-secondary">
                        Back to Dashboard
                    </Link>
                    {status === 'approved' && (
                        <Link to="/session" className="btn-primary flex items-center justify-center gap-2">
                            <ArrowRight size={18} /> Start Another Session
                        </Link>
                    )}
                </div>

                {/* Background Glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-3xl -z-10 opacity-20 ${status === 'approved' ? 'bg-emerald-500' : status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></div>
            </div>
        </div>
    );
};

export default VerificationResults;
