import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Award, Trees, Heart, UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import PostCard from '../components/PostCard';
const UserProfile = () => {
    const { uid } = useParams();
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [socialStats, setSocialStats] = useState({ followers: 0, following: 0 });
    const [followStatus, setFollowStatus] = useState('none'); // none, pending, accepted
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, statusRes, postsRes] = await Promise.all([
                api.get(`/users/${uid}`),
                api.get(`/follows/status/${uid}`),
                api.get(`/posts?userId=${uid}`)
            ]);
            setUserData(userRes.data);
            setSocialStats({
                followers: Number(userRes.data.follower_count || 0),
                following: Number(userRes.data.following_count || 0)
            });
            setFollowStatus(statusRes.data.status);
            setUserPosts(postsRes.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (uid) {
            fetchData();
        }
    }, [uid]);
    const handleFollow = async () => {
        try {
            if (followStatus === 'none') {
                await api.post('/follows', { targetId: uid });
                setFollowStatus('pending');
            }
        } catch (error) {
            console.error("Error following user:", error);
        }
    };
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }
    if (!userData) {
        return (
            <div className="p-8 text-center text-slate-500">
                User not found.
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-6">
            <div className="max-w-4xl mx-auto px-4">
                {}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-500"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative group">
                                {userData.photo_url ? (
                                    <img
                                        src={userData.photo_url}
                                        className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl transition-transform hover:scale-105"
                                        alt={userData.name}
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-3xl bg-slate-200 flex items-center justify-center border-4 border-white shadow-xl">
                                        <User className="w-16 h-16 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mb-2">
                                {currentUser?.uid !== uid && (
                                    <button
                                        onClick={handleFollow}
                                        disabled={followStatus !== 'none'}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all nature-btn ${followStatus === 'accepted'
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            : followStatus === 'pending'
                                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {followStatus === 'accepted' ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Following</>
                                        ) : followStatus === 'pending' ? (
                                            <><Clock className="w-4 h-4" /> Requested</>
                                        ) : (
                                            <><UserPlus className="w-4 h-4" /> Follow</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    {userData.name}
                                    {!!userData.is_community_leader && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-emerald-200">
                                            Leader
                                        </span>
                                    )}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium mt-1">
                                    Guardian of {userData.community_name}
                                </p>
                            </div>
                            {userData.bio && (
                                <p className="text-slate-600 text-sm leading-relaxed italic bg-white/50 p-4 rounded-2xl border border-slate-100">
                                    "{userData.bio}"
                                </p>
                            )}
                            <div className="flex items-center gap-8 py-4 border-y border-slate-50">
                                <div className="text-center">
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{userData.points}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Points</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{socialStats.followers}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-slate-900 tracking-tight">{socialStats.following}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Following</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <Trees className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900 leading-none">{userData.trees_planted}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planted</p>
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Award className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-slate-900 leading-none">LVL {userData.level}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {}
                <div className="space-y-6">
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest px-1">
                        Impact Journey
                    </h2>
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
                            <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
                                No posts yet. This guardian is preparing for their next action!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default UserProfile;
