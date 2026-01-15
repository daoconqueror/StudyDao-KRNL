import React from 'react';
import { Upload, FileText, Image, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubmitActivity = () => {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Submit Study Activity</h1>
                <p className="text-slate-400">Upload your proof of work for AI verification.</p>
            </div>

            <div className="glass-panel rounded-2xl p-8 mb-8">
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-4">Session Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                            <div className="text-slate-400 text-xs mb-1">Duration</div>
                            <div className="text-xl font-bold text-white">01:45:20</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                            <div className="text-slate-400 text-xs mb-1">Notes</div>
                            <div className="text-xl font-bold text-white">450 words</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                            <div className="text-slate-400 text-xs mb-1">Focus Score</div>
                            <div className="text-xl font-bold text-emerald-400">92%</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                            <div className="text-slate-400 text-xs mb-1">Est. Reward</div>
                            <div className="text-xl font-bold text-amber-400">5 STK</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">Upload Evidence</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-slate-800/30">
                            <Upload className="mx-auto text-slate-500 mb-4" size={32} />
                            <p className="text-slate-300 font-medium mb-1">Click to upload or drag and drop</p>
                            <p className="text-slate-500 text-sm">PDF, PNG, JPG, or MD files (max 10MB)</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">Additional Links</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="text" className="input-field pl-10" placeholder="GitHub Commit URL, Notion Page, etc." />
                            </div>
                            <button className="btn-secondary px-4">Add</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">Reflection (Optional)</label>
                        <textarea className="input-field h-24 resize-none" placeholder="What was the most challenging part of this session?"></textarea>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Link to="/verification" className="btn-primary w-full md:w-auto px-12 py-4 text-lg shadow-xl shadow-emerald-500/20">
                    Submit for AI Verification
                </Link>
            </div>
        </div>
    );
};

export default SubmitActivity;
