import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, User, ArrowRight, Loader, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
const Friends = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('following'); // 'following' or 'followers'
    const [lists, setLists] = useState({ following: [], followers: [] });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!currentUser) return;
        fetchSocialLists();
    }, [currentUser]);
    const fetchSocialLists = async () => {
        setLoading(true);
        try {
            const { default: api } = await import('../utils/api');
            const [followingRes, followersRes] = await Promise.all([
                api.get(`/users/following/${currentUser.uid}`),
                api.get(`/users/followers/${currentUser.uid}`)
            ]);
            setLists({
                following: followingRes.data,
                followers: followersRes.data
            });
        } catch (error) {
            console.error("Fetch social lists error:", error);
        } finally {
            setLoading(false);
        }
    };
    const UserCard = ({ user }) => (
        <Link
            to={`/profile/user/${user.id}`}
            className="bg-white border border-slate-100 p-3 md:p-4 rounded-2xl md:rounded-[2rem] flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 nature-btn"
        >
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img
                        src={user.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                        alt=""
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black overflow-hidden">
                        {user.points > 1000 ? <Heart size={10} fill="currentColor" /> : '🌱'}
                    </div>
                </div>
                <div>
                    <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{user.name}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="text-emerald-500">{user.points || 0}</span> Points • {user.role || 'Guardian'}
                    </p>
                </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ArrowRight size={18} />
            </div>
        </Link>
    );
    return (
        <div className="max-w-3xl mx-auto pb-24 px-4 animate-fade-in">
            {}
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">My Social Circle</h1>
                <p className="text-slate-500 font-medium">Connect with fellow Guardians and track your collective impact.</p>
            </div>
            {}
            <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1 md:p-1.5 bg-slate-100/50 rounded-2xl md:rounded-[2rem] mb-10 w-full sm:w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setActiveTab('following')}
                    className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all nature-btn ${activeTab === 'following' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Following ({lists.following.length})
                </button>
                <button
                    onClick={() => setActiveTab('followers')}
                    className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all nature-btn ${activeTab === 'followers' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'
                        }`}
                >
                    Followers ({lists.followers.length})
                </button>
            </div>
            {}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-slate-50 p-6 rounded-[2rem] animate-pulse h-24 shadow-sm"></div>
                    ))
                ) : lists[activeTab].length > 0 ? (
                    lists[activeTab].map(user => (
                        <UserCard key={user.id} user={user} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                            {activeTab === 'following' ? "You follow no one yet!" : "No followers yet!"}
                        </h3>
                        <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                            {activeTab === 'following'
                                ? "Explore the feed or community rankings to find inspiring Guardians to follow."
                                : "Keep planting and sharing to grow your local influence!"}
                        </p>
                        <Link
                            to="/feed"
                            className="inline-block bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 nature-btn"
                        >
                            Explore Feed
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Friends;
