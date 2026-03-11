import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, TreeDeciduous, MapPin, Calendar, Sprout } from 'lucide-react';
const RegisterTree = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        species: '',
        treeTag: '',
        plantedDate: '',
        location: '',
    });
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { default: api } = await import('../utils/api');
            await api.post('/trees', {
                ...formData
            });
            navigate('/trees');
        } catch (error) {
            console.error("Error registering tree:", error);
            alert("Failed to register tree: " + error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="max-w-xl mx-auto pb-20 px-4 animate-fade-in">
            <button
                onClick={() => navigate('/trees')}
                className="mb-8 flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-all group"
            >
                <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to My Forest
            </button>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-12 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner">
                            <Sprout className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Register a Tree</h1>
                        <p className="text-slate-400 font-medium mt-2 text-sm">Contribute to the lungs of the Earth.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Species</label>
                        <div className="relative">
                            <TreeDeciduous className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none"
                                placeholder="e.g. Majestic Mango, Sacred Neem"
                                value={formData.species}
                                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tree ID (Unique to you)</label>
                        <div className="relative">
                            <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none"
                                placeholder="e.g. MY-FIRST-TREE, GARDEN-01"
                                value={formData.treeTag}
                                onChange={(e) => setFormData({ ...formData, treeTag: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Planting Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <input
                                type="date"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none"
                                value={formData.plantedDate}
                                onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Garden Coordinates</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <input
                                type="text"
                                required
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none"
                                placeholder="e.g. Sunny Backyard, Sector 5 Park"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Committing...' : 'Commit to Earth'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default RegisterTree;
