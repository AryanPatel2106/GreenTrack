import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import FeedSidebar from '../components/FeedSidebar';
import FeedWidgets from '../components/FeedWidgets';
import { Plus, Leaf, Image as ImageIcon, MapPin, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
const Feed = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts');
                setPosts(response.data);
            } catch (error) {
                console.error("Feed error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
        const intervalId = setInterval(fetchPosts, 10000); // 10 seconds
        return () => clearInterval(intervalId);
    }, []);
    return (
        <div className="max-w-7xl mx-auto">
            {}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {}
                <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-theme(spacing.24)-2rem)] overflow-y-auto custom-scrollbar pb-10">
                    <FeedSidebar />
                </aside>
                {}
                <main className="lg:col-span-6 space-y-6">
                    {}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 animate-slide-up">
                        <div className="flex gap-3 mb-4">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Me" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                            ) : (
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                                    {currentUser?.displayName?.charAt(0)}
                                </div>
                            )}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex-1 bg-slate-50 hover:bg-slate-100 transition-colors text-left px-4 rounded-xl text-slate-500 font-medium border border-slate-100 nature-btn"
                            >
                                What's happening in your garden, {currentUser?.displayName?.split(' ')[0]}?
                            </button>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wider nature-btn">
                                <ImageIcon className="w-4 h-4 text-emerald-500" />
                                Photo
                            </button>
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                Location
                            </button>
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 px-3 py-1.5 rounded-lg transition-all font-bold text-xs uppercase tracking-wider">
                                <Smile className="w-4 h-4 text-emerald-500" />
                                Feeling
                            </button>
                        </div>
                    </div>
                    {}
                    <div className="space-y-6">
                        {loading && posts.length === 0 ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100 shadow-sm" />
                            ))
                        ) : posts.length > 0 ? (
                            posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm animate-fade-in">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                                    <Leaf className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Be the first to inspire!</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
                                    The global feed is waiting for your tree updates. Share your progress with the world!
                                </p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                >
                                    Create First Post
                                </button>
                            </div>
                        )}
                    </div>
                </main>
                {}
                <aside className="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-theme(spacing.24)-2rem)] overflow-y-auto custom-scrollbar pb-10">
                    <FeedWidgets />
                </aside>
            </div>
            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {}
            <button
                onClick={() => setIsModalOpen(true)}
                className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 rounded-2xl shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-40 border-4 border-white"
            >
                <Plus className="w-8 h-8 font-black" />
            </button>
        </div>
    );
};
export default Feed;
