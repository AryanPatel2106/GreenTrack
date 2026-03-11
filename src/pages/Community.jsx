import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { Users, MapPin, Globe, TreeDeciduous } from 'lucide-react';
const Community = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [communityInfo, setCommunityInfo] = useState({ id: 'global', name: 'Global Community' });
    useEffect(() => {
        if (!currentUser) return;
        const fetchData = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const profileRes = await api.get('/users/profile');
                const profile = profileRes.data;
                if (profile.community_id) {
                    setCommunityInfo({
                        id: profile.community_id,
                        name: profile.community_name || 'My Community',
                        communityPoints: profile.community_points || 0 // This would ideally come from a community endpoint
                    });
                    const postsRes = await api.get(`/posts?communityId=${profile.community_id}`);
                    setPosts(postsRes.data);
                }
            } catch (err) {
                console.error("Error fetching community data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, 10000); // 10 seconds
        return () => clearInterval(intervalId);
    }, [currentUser]);
    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 animate-fade-in">
            {}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 mb-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white shadow-xl shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform animate-sway">
                        <TreeDeciduous className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight uppercase">
                        {communityInfo.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <Users className="w-3.5 h-3.5" />
                            {posts.length} Active Guardians
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                            <MapPin className="w-3.5 h-3.5" />
                            Local Hub
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium text-sm md:text-base max-w-lg leading-relaxed">
                        Welcome to your local green sanctuary. Connect, share, and grow while restoring the Earth's balance together.
                    </p>
                </div>
            </div>
            {}
            <div className="flex justify-between items-center mb-10 sticky top-20 z-40 py-4 bg-slate-50/95 backdrop-blur-md">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Community Updates</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2 nature-btn">
                    <span className="text-lg">+</span> Share Update
                </button>
            </div>
            {}
            <div className="max-w-2xl mx-auto space-y-6">
                {loading ? (
                    [1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100 shadow-sm"></div>
                    ))
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <div className="text-center py-20 px-6 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">Quiet in the neighborhood?</h3>
                        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto mb-8">
                            Be the pioneer! Share the first update and inspire your fellow {communityInfo.name} Guardians.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 nature-btn"
                        >
                            Ignite the Feed
                        </button>
                    </div>
                )}
            </div>
            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};
export default Community;
