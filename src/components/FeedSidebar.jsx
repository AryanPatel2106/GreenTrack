import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Award, ChevronRight } from 'lucide-react';
const FeedSidebar = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const response = await api.get('/users/profile');
                setUserData(response.data);
            } catch (err) {
                console.error("Sidebar profile error:", err);
            }
        };
        fetchProfile();
    }, [currentUser]);
    return (
        <div className="space-y-6 hidden lg:block">
            {}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                <div className="px-5 pb-5">
                    <div className="relative -mt-10 mb-3">
                        {currentUser?.photoURL ? (
                            <img
                                src={currentUser.photoURL}
                                alt="Profile"
                                className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-emerald-600">
                                {currentUser?.displayName?.charAt(0)}
                            </div>
                        )}
                        {!!userData?.is_community_leader && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
                                <span className="text-xs">👑</span>
                            </div>
                        )}
                    </div>
                    <Link to="/profile" className="block group">
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                            {currentUser?.displayName}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <Shield className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Level {userData?.level || 1} Guardian</span>
                        </p>
                    </Link>
                    <div className="mt-5 pt-5 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400">Total Points</span>
                        <span className="text-emerald-600">{userData?.points || 0}</span>
                    </div>
                </div>
            </div>
            {}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Your Community</span>
                </h4>
                <div className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Local Chapter</p>
                        <p className="text-sm font-bold text-slate-700">{userData?.community_name || "Global Earth Guardians"}</p>
                    </div>
                    <Link to="/community" className="w-full flex items-center justify-between p-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors group">
                        View Community Feed
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
            {}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Achievements</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all cursor-help" title="Early Planter">🌱</div>
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl grayscale opacity-30">🔥</div>
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl grayscale opacity-30">🌳</div>
                </div>
            </div>
        </div>
    );
};
export default FeedSidebar;
