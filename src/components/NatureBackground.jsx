import React from 'react';
const NatureBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-20">
            { }
            <div className="absolute -top-10 -left-10 w-64 h-64 text-emerald-800 animate-sway origin-top-left opacity-30">
                <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                    <path d="M0,0 Q50,10 100,80 T180,150" stroke="currentColor" strokeWidth="4" fill="none" />
                    <circle cx="100" cy="80" r="10" />
                    <circle cx="140" cy="110" r="8" />
                    <circle cx="180" cy="150" r="12" />
                </svg>
            </div>
            { }
            <div className="absolute -bottom-20 -right-20 w-80 h-80 text-emerald-900 animate-sway-slow origin-bottom-right opacity-20">
                <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                    <path d="M200,200 Q150,180 100,100 T20,20" stroke="currentColor" strokeWidth="3" fill="none" />
                    <ellipse cx="60" cy="60" rx="15" ry="30" transform="rotate(-45, 60, 60)" />
                    <ellipse cx="120" cy="130" rx="12" ry="25" transform="rotate(-30, 120, 130)" />
                    <ellipse cx="30" cy="30" rx="8" ry="15" transform="rotate(-60, 30, 30)" />
                </svg>
            </div>
            { }
            <div className="absolute top-1/4 right-[10%] w-8 h-8 text-emerald-500 animate-float-leaf opacity-40">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M17,8C8,10 5,16 5,16C5,16 11,15 15,9C17,6 18,2 18,2C18,2 16,6 17,8Z" />
                </svg>
            </div>
            <div className="absolute top-1/2 left-[5%] w-6 h-6 text-teal-600 animate-float-leaf-slow opacity-30">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M17,8C8,10 5,16 5,16C5,16 11,15 15,9C17,6 18,2 18,2C18,2 16,6 17,8Z" />
                </svg>
            </div>
            <div className="absolute bottom-1/4 left-[15%] w-10 h-10 text-emerald-400 animate-float-leaf opacity-20">
                <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
                    <path d="M17,8C8,10 5,16 5,16C5,16 11,15 15,9C17,6 18,2 18,2C18,2 16,6 17,8Z" />
                </svg>
            </div>
        </div>
    );
};
export default NatureBackground;
