import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        // Fade in text
        setTimeout(() => setTextVisible(true), 500);

        // Fade out splash screen
        setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 1000); // Wait for fade out animation
        }, 3500);
    }, [onFinish]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

            {/* Animated Logo Container */}
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center animate-bounce-slow shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <span className="text-white font-bold text-5xl">S</span>
                </div>
                <div className="absolute inset-0 bg-emerald-400/20 rounded-2xl blur-xl animate-pulse"></div>
            </div>

            {/* Text Content */}
            <div className={`text-center transition-all duration-1000 transform ${textVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 mb-4 tracking-tight">
                    STUDY DAO
                </h1>
                <div className="flex items-center justify-center gap-3 text-slate-400 text-lg md:text-xl font-light tracking-widest uppercase">
                    <span>Learn</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Earn</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Grow</span>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float-delayed"></div>
            </div>
        </div>
    );
};

export default SplashScreen;
