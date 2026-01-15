import React from 'react';
import { Github, Twitter, Disc } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-lg mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-300">
                            StudyDAO
                        </span>
                        <p className="text-slate-400 text-sm text-center md:text-left">
                            Decentralized AI-Assisted Study Rewards & Accountability Platform
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">
                            <Disc size={20} />
                        </a>
                    </div>

                    <div className="text-slate-500 text-sm">
                        © 2025 StudyDAO. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
