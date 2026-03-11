import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, TreeDeciduous, MapPin, Calendar, ArrowRight, Activity } from 'lucide-react';
const Trees = () => {
    const { currentUser } = useAuth();
    const [trees, setTrees] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchTrees = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const response = await api.get('/trees');
                setTrees(response.data);
            } catch (error) {
                console.error("Error fetching trees:", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchTrees();
    }, [currentUser]);
    const HealthRing = ({ score }) => {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;
        const color = score > 80 ? 'text-emerald-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';
        return (
            <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                    <circle cx="24" cy="24" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={color}
                    />
                </svg>
                <span className="absolute text-[10px] font-bold text-gray-700">{score}%</span>
            </div>
        );
    };
    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-fade-in px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
                <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-[0.2em] mb-3 uppercase border border-emerald-100">
                        <TreeDeciduous className="w-3 h-3" />
                        Green Portfolio
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight uppercase">My Forest</h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Nurturing {trees.length} lives across the planet.</p>
                </div>
                <Link to="/trees/new" className="hidden md:flex items-center px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 group">
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Register a Tree
                </Link>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] h-64 animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : trees.length === 0 ? (
                <div className="text-center py-24 px-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 bg-emerald-100 blur-2xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-white w-24 h-24 rounded-3xl flex items-center justify-center border border-emerald-50 shadow-xl">
                            <TreeDeciduous className="w-10 h-10 text-emerald-500" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4">Your forest awaits its first seed</h3>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-sm mx-auto mb-10">
                        Every great forest starts with a single sapling. Register your tree today and track its impact on the world.
                    </p>
                    <Link to="/trees/new" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95">
                        Begin Your Legacy
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trees.map(tree => (
                        <div key={tree.id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden flex flex-col justify-between h-full">
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all duration-500 group-hover:rotate-6">
                                        <TreeDeciduous className="w-7 h-7" />
                                    </div>
                                    <HealthRing score={tree.health_score || 100} />
                                </div>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1 group-hover:text-emerald-600 transition-colors">#{tree.tree_tag}</p>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 truncate uppercase tracking-tight group-hover:text-emerald-700 transition-colors">
                                    {tree.species}
                                </h3>
                                <div className="space-y-4 pt-4 border-t border-slate-50 mt-4">
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Calendar className="w-3.5 h-3.5 mr-2.5 text-emerald-500/60" />
                                        {tree.planted_date ? new Date(tree.planted_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <MapPin className="w-3.5 h-3.5 mr-2.5 text-emerald-500/60" />
                                        <span className="truncate">{tree.location || 'Earth Hub'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Growing</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                            </div>
                            <Link to={`/trees/${tree.id}`} className="absolute inset-0 z-20" aria-label={`View details for ${tree.species}`}></Link>
                        </div>
                    ))}
                    {}
                    <Link to="/trees/new" className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center z-50 hover:bg-slate-800 active:scale-95 transition-all border-4 border-white/10 ring-8 ring-slate-900/5">
                        <Plus className="w-8 h-8" />
                    </Link>
                </div>
            )}
        </div>
    );
};
export default Trees;
