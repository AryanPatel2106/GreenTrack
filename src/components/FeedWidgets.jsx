import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Sprout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
const FeedWidgets = () => {
    const [stats, setStats] = useState({ totalTrees: 0, topSpecies: [] });
    const [topTeams, setTopTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const [statsRes, teamsRes] = await Promise.all([
                    api.get('/stats'),
                    api.get('/leaderboard/communities')
                ]);
                setStats(statsRes.data);
                setTopTeams(teamsRes.data.slice(0, 3));
            } catch (err) {
                console.error("Widget data error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (
            <div className="space-y-6 hidden lg:block">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl h-40 animate-pulse border border-slate-200"></div>
                ))}
            </div>
        );
    }
    return (
        <div className="space-y-6 hidden lg:block">
            {}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Global Trends</span>
                </h4>
                <div className="space-y-4">
                    {stats.topSpecies.map((item, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                            <span className="text-xs font-black text-slate-500 group-hover:text-emerald-600 transition-all uppercase tracking-tight">{item.species}</span>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">{item.count} Active</span>
                        </div>
                    ))}
                    {stats.topSpecies.length === 0 && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observing habitat...</p>}
                </div>
            </div>
            {}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50"></div>
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Sprout className="w-40 h-40 rotate-12" />
                </div>
                <div className="relative z-10">
                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Total Forestage</p>
                    <h3 className="text-4xl font-black mb-1 tabular-nums">{stats.totalTrees.toLocaleString()}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Lives Rooted Globally</p>
                    <div className="mt-8 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000"
                            style={{ width: `${Math.min((stats.totalTrees / 10000) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            {}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-slate-900 flex items-center gap-3">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-widest">Star Teams</span>
                    </h4>
                    <Link to="/leaderboard" className="text-[10px] font-black text-emerald-600 uppercase hover:underline tracking-widest">See All</Link>
                </div>
                <div className="space-y-5">
                    {topTeams.map((team, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs group-hover:bg-emerald-50 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-all">
                                {i + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black text-slate-700 uppercase leading-tight group-hover:text-emerald-700 transition-colors">{team.name}</p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{team.community_points} Impact</p>
                            </div>
                        </div>
                    ))}
                    {topTeams.length === 0 && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Forming legions...</p>}
                </div>
            </div>
            {}
            <div className="px-6 text-[9px] text-slate-300 flex flex-wrap gap-x-6 gap-y-3 font-black uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-emerald-500 transition-colors">Safety</a>
                <p className="w-full mt-4 text-[8px] text-slate-200 normal-case font-medium">Powered by Global Earth Protocol © 2026</p>
            </div>
        </div>
    );
};
export default FeedWidgets;
