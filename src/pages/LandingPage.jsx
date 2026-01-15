import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Brain, Coins, Users } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                                Get Paid to Study.
                            </span>
                            <br />
                            <span className="text-white">Verified by AI.</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join decentralized study groups, stake tokens to commit, and earn rewards when our AI verifies your learning progress.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/groups" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                                Explore Study Groups <ArrowRight size={20} />
                            </Link>
                            <button className="btn-secondary text-lg px-8 py-4">
                                How it Works
                            </button>
                        </div>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
            </section>

            {/* Features Grid */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            The Future of <span className="text-emerald-400">Accountability</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            We combine Web3 incentives with AI verification to ensure genuine learning outcomes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Coins className="text-amber-400" size={32} />}
                            title="Token Staking"
                            description="Stake tokens to join a group. Complete your goals to unlock them plus rewards."
                        />
                        <FeatureCard
                            icon={<Brain className="text-emerald-400" size={32} />}
                            title="AI Verification"
                            description="Our KRNL-powered AI analyzes your notes and activity to verify real learning."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-teal-400" size={32} />}
                            title="Smart Contracts"
                            description="Trustless reward distribution. No central authority controls your funds."
                        />
                        <FeatureCard
                            icon={<Users className="text-blue-400" size={32} />}
                            title="Community"
                            description="Learn together in decentralized groups. Share resources and grow."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Ready to commit to your education?
                            </h2>
                            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                                Stop procrastinating. Put your tokens where your mind is and start earning for every study session.
                            </p>
                            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 text-lg">
                                Launch App <ArrowRight size={20} />
                            </Link>
                        </div>

                        {/* Decorative blobs */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="glass-card p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
        <div className="p-3 rounded-xl bg-slate-800/50 mb-6 border border-white/5">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
