import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TreeDeciduous, MapPin, Calendar, Activity, ArrowLeft } from 'lucide-react';
import PostCard from '../components/PostCard';
const TreeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tree, setTree] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const [treeRes, postsRes] = await Promise.all([
                    api.get(`/trees/${id}`),
                    api.get(`/posts?treeId=${id}`)
                ]);
                setTree(treeRes.data);
                setPosts(postsRes.data);
            } catch (err) {
                console.error("Error fetching details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 10000); // 10 seconds
        return () => clearInterval(intervalId);
    }, [id]);
    if (loading) return (
        <div className="max-w-4xl mx-auto p-12 space-y-6">
            <div className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
            <div className="h-96 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
        </div>
    );
    if (!tree) return (
        <div className="max-w-4xl mx-auto py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                <TreeDeciduous className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Tree Not Found</h2>
            <button onClick={() => navigate('/trees')} className="mt-8 text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:underline">Return to Forest</button>
        </div>
    );
    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-24 px-4 animate-fade-in">
            <button
                onClick={() => navigate('/trees')}
                className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-all group"
            >
                <ArrowLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" /> Portal to Forest
            </button>
            {}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TreeDeciduous className="w-64 h-64 -mr-20 -mt-20" />
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl animate-float">
                        <TreeDeciduous className="w-16 h-16 md:w-20 md:h-20" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase">
                                {tree.species}
                            </h1>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 w-fit mx-auto md:mx-0">
                                <Activity className="w-3.5 h-3.5 animate-pulse" />
                                Elite Growth
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-lg">
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                <Calendar className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Heritage Date</p>
                                    <p className="text-xs font-black text-slate-700 uppercase">
                                        {tree.planted_date ? new Date(tree.planted_date).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                    <p className="text-xs font-black text-slate-700 uppercase truncate max-w-[120px]">
                                        {tree.location || 'Earth Hub'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 h-40 bg-slate-900 rounded-3xl relative overflow-hidden group/map border-4 border-white shadow-2xl">
                            <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                                <div className="text-center">
                                    <MapPin className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">GPS Synchronized</p>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>
            {}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Growth Archive</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{posts.length} Log Entries</span>
                </div>
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No growth logs recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default TreeDetails;
