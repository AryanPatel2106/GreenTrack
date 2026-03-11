import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Sprout, CheckCircle2, ArrowRight, Sun, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { LEVEL_CONFIG } from '../utils/gamification';
const Dashboard = () => {
    const { currentUser } = useAuth();
    const [greeting, setGreeting] = useState('Welcome');
    const [stats, setStats] = useState({
        points: 0,
        level: 1,
        xp: 0,
        treesPlanted: 0,
        verifiedPosts: 0
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);
    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        const fetchDashboardData = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const [profileRes, treesRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/trees')
                ]);
                const profile = profileRes.data;
                setStats({
                    points: profile.points || 0,
                    level: profile.level || 1,
                    xp: profile.xp || 0,
                    treesPlanted: profile.trees_planted || 0,
                    verifiedPosts: profile.verified_posts || 0
                });
            } catch (err) {
                console.error("Dashboard error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [currentUser]);
    const requiredXP = stats.level * LEVEL_CONFIG.BASE_XP;
    const progressPercentage = Math.min((stats.xp / requiredXP) * 100, 100);
    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in max-w-6xl mx-auto pb-10">
            {}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10 w-full md:w-2/3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-emerald-600 mb-3 font-black text-[10px] uppercase tracking-[0.2em]">
                        <Sun className="w-4 h-4" />
                        <span>{greeting}, {currentUser?.displayName?.split(' ')[0]}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">
                        Grow your <span className="text-emerald-600">Green Legacy</span> today.
                    </h1>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto md:mx-0 font-medium leading-relaxed text-sm">
                        You're doing great! Your efforts have already contributed to a healthier planet. Keep it up!
                    </p>
                    {}
                    <div className="max-w-md mx-auto md:mx-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                            <span>Level {stats.level} Guardian</span>
                            <span>{stats.xp} / {requiredXP} XP</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-sm"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="mt-10 md:mt-0 relative w-full md:w-1/3 flex justify-center items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 animate-pulse"></div>
                        <div className="relative bg-white p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-emerald-50 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Leaf className="w-16 h-16 md:w-20 md:h-20 text-emerald-500" />
                        </div>
                    </div>
                </div>
            </div>
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Rewards</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Points</p>
                        <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats.points.toLocaleString()}</h3>
                    </div>
                    <Link to="/leaderboard" className="mt-8 flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest hover:gap-3 transition-all">
                        Leaderboard <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-colors group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Sprout className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Plants</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trees Planted</p>
                        <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats.treesPlanted}</h3>
                    </div>
                    <Link to="/trees" className="mt-8 flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest hover:gap-3 transition-all">
                        My Garden <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-colors group sm:col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Proof</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Posts</p>
                        <h3 className="text-4xl font-black text-slate-900">{loading ? '...' : stats.verifiedPosts}</h3>
                    </div>
                    <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {stats.verifiedPosts > 10 ? 'Elite Guardian' : 'Keep protecting!'}
                    </p>
                </div>
            </div>
            {}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    {}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4 relative z-10 leading-tight">
                    Every tree you plant is a gift <br className="hidden md:block" /> to the next generation.
                </h2>
                <p className="text-slate-400 mb-8 max-w-md mx-auto font-medium text-sm md:text-base relative z-10">
                    Join thousands of other Guardians in making the world a greener place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 font-bold">
                    <Link to="/feed" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95">
                        Inspire Others
                    </Link>
                    <Link to="/trees/new" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95">
                        Plant a Tree
                    </Link>
                </div>
            </div>
        </div>
    );
};
export default Dashboard;
