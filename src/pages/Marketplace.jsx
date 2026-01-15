import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Video, FileText, Star, ShoppingBag, Loader } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { getTokenBalance } from '../services/contractService';

const Marketplace = () => {
    const { account, provider, isConnected } = useWeb3();
    const [balance, setBalance] = useState('0');
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(null);

    useEffect(() => {
        if (isConnected && account && provider) {
            loadBalance();
        }
    }, [isConnected, account, provider]);

    const loadBalance = async () => {
        try {
            setLoading(true);
            const tokenBalance = await getTokenBalance(account, provider);
            setBalance(tokenBalance);
        } catch (error) {
            console.error('Error loading balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item) => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        const userBalance = parseFloat(balance);
        if (userBalance < item.price) {
            alert(`Insufficient balance. You need ${item.price} STUDY but only have ${userBalance.toFixed(2)} STUDY`);
            return;
        }

        setPurchasing(item.id);

        // Simulate purchase (in real app, this would call a smart contract)
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert(`🎉 Successfully purchased "${item.title}"! This would normally deduct ${item.price} STUDY from your balance.`);
        setPurchasing(null);
    };

    const items = [
        {
            id: 1,
            title: 'Advanced Solidity Masterclass',
            author: 'CryptoTutor',
            type: 'Course',
            price: 50,
            rating: 4.8,
            reviews: 120,
            image: 'bg-gradient-to-br from-indigo-500 to-purple-600'
        },
        {
            id: 2,
            title: 'React Patterns Cheatsheet',
            author: 'FrontendWizard',
            type: 'PDF',
            price: 10,
            rating: 4.9,
            reviews: 85,
            image: 'bg-gradient-to-br from-blue-400 to-cyan-300'
        },
        {
            id: 3,
            title: '1-on-1 Mentorship Session',
            author: 'SeniorDev',
            type: 'Service',
            price: 100,
            rating: 5.0,
            reviews: 42,
            image: 'bg-gradient-to-br from-emerald-400 to-teal-500'
        },
        {
            id: 4,
            title: 'Machine Learning Notes',
            author: 'AI_Scholar',
            type: 'Notes',
            price: 25,
            rating: 4.5,
            reviews: 200,
            image: 'bg-gradient-to-br from-orange-400 to-red-500'
        },
        {
            id: 5,
            title: 'Blockchain Development Bootcamp',
            author: 'Web3Academy',
            type: 'Course',
            price: 75,
            rating: 4.9,
            reviews: 156,
            image: 'bg-gradient-to-br from-violet-500 to-fuchsia-500'
        },
        {
            id: 6,
            title: 'Smart Contract Security Audit Guide',
            author: 'SecurityExpert',
            type: 'PDF',
            price: 40,
            rating: 4.7,
            reviews: 98,
            image: 'bg-gradient-to-br from-red-500 to-pink-500'
        }
    ];

    if (!isConnected) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                    <p className="text-slate-400">Please connect your wallet to browse the marketplace</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
                    <p className="text-slate-400">Spend your hard-earned tokens on premium resources.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10">
                    <span className="text-slate-400 text-sm">Your Balance:</span>
                    {loading ? (
                        <span className="text-slate-400">Loading...</span>
                    ) : (
                        <span className="text-emerald-400 font-bold">{parseFloat(balance).toFixed(2)} STUDY</span>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="glass-panel p-4 rounded-xl mb-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search for courses, notes, or tutors..."
                        className="input-field pl-10 bg-slate-900/50"
                    />
                </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => {
                    const canAfford = parseFloat(balance) >= item.price;
                    return (
                        <div key={item.id} className="glass-card p-4 flex flex-col group">
                            <div className={`h-40 rounded-xl mb-4 ${item.image} flex items-center justify-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                {item.type === 'Course' && <Video className="text-white opacity-80" size={48} />}
                                {item.type === 'PDF' && <FileText className="text-white opacity-80" size={48} />}
                                {item.type === 'Service' && <ShoppingBag className="text-white opacity-80" size={48} />}
                                {item.type === 'Notes' && <BookOpen className="text-white opacity-80" size={48} />}

                                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-xs text-white font-medium">
                                    {item.type}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-slate-400 mb-3">by {item.author}</p>

                            <div className="flex items-center gap-1 mb-4">
                                <Star size={14} className="text-amber-400 fill-amber-400" />
                                <span className="text-sm text-white font-medium">{item.rating}</span>
                                <span className="text-xs text-slate-500">({item.reviews})</span>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-lg font-bold text-emerald-400">{item.price} STUDY</span>
                                <button
                                    onClick={() => handlePurchase(item)}
                                    disabled={!canAfford || purchasing === item.id}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${canAfford && purchasing !== item.id
                                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                        }`}
                                >
                                    {purchasing === item.id ? (
                                        <>
                                            <Loader className="animate-spin" size={16} />
                                            Buying...
                                        </>
                                    ) : (
                                        'Buy Now'
                                    )}
                                </button>
                            </div>
                            {!canAfford && (
                                <p className="text-xs text-red-400 mt-2 text-center">Insufficient balance</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Marketplace;
