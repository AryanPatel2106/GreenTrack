import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Crown, Shield } from 'lucide-react';
const Leaderboard = () => {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'communities'
    const [communities, setCommunities] = useState([]);
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const [usersRes, commRes] = await Promise.all([
                    api.get('/leaderboard/users'),
                    api.get('/leaderboard/communities')
                ]);
                setUsers(usersRes.data);
                setCommunities(commRes.data);
            } catch (err) {
                console.error("Leaderboard error:", err);
            }
        };
        fetchLeaderboard();
    }, []);
    const getRankStyle = (index) => {
        switch (index) {
            case 0: return 'bg-gradient-to-b from-yellow-50 to-amber-100 border-amber-300 shadow-amber-100';
            case 1: return 'bg-gradient-to-b from-gray-50 to-slate-100 border-slate-300 shadow-slate-100';
            case 2: return 'bg-gradient-to-b from-orange-50 to-orange-100 border-orange-300 shadow-orange-100';
            default: return 'bg-white border-gray-100';
        }
    };
    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="w-6 h-6 text-amber-500 fill-current animate-bounce" />;
            case 1: return <Medal className="w-6 h-6 text-slate-400 fill-current" />;
            case 2: return <Medal className="w-6 h-6 text-orange-400 fill-current" />;
            default: return <span className="text-gray-500 font-bold w-6 text-center">{index + 1}</span>;
        }
    };
    return (
        <div className="max-w-4xl mx-auto pb-24 animate-fade-in px-4">
            <div className="text-center mb-10 pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase border border-emerald-100">
                    <Trophy className="w-3 h-3" />
                    Global Standings
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight uppercase">Leaderboard</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Competing to restore the planet's lungs.</p>
            </div>
            {}
            <div className="flex justify-center mb-10">
                <div className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 nature-btn ${activeTab === 'users' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
                        Top Planters
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 nature-btn ${activeTab === 'communities' ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}>
                        Top Communities
                    </button>
                </div>
            </div>
            {activeTab === 'users' ? (
                <div className="space-y-4">
                    {}
                    {users.length >= 3 && (
                        <div className="grid grid-cols-3 gap-2 md:gap-6 items-end mb-16 px-2 h-fit md:h-64">
                            {}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                        {users[1].profilePhoto ? (
                                            <img src={users[1].profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-xl font-black text-slate-400">{users[1].name[0]}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 border-2 border-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">2nd</div>
                                </div>
                                <div className="text-center w-full bg-slate-50 rounded-2xl p-3 border border-slate-200 shadow-sm h-16 md:h-20 flex flex-col justify-center">
                                    <p className="font-black text-slate-800 text-[10px] md:text-xs truncate uppercase">{users[1].name}</p>
                                    <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{users[1].points} PTS</p>
                                </div>
                            </div>
                            {}
                            <div className="flex flex-col items-center z-10 scale-105 sm:scale-110 md:scale-125 transition-transform">
                                <div className="relative mb-6">
                                    <Crown className="w-6 h-6 md:w-8 md:h-8 text-amber-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />
                                    <div className="w-18 h-18 md:w-24 md:h-24 rounded-[1.5rem] bg-amber-50 border-4 border-amber-300 shadow-2xl flex items-center justify-center overflow-hidden ring-4 ring-amber-100">
                                        {users[0].profilePhoto ? (
                                            <img src={users[0].profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-2xl font-black text-amber-500">{users[0].name[0]}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white border-2 border-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg">WINNER</div>
                                </div>
                                <div className="text-center w-full bg-white rounded-2xl p-3 md:p-4 border-2 border-amber-200 shadow-xl h-20 md:h-24 flex flex-col justify-center">
                                    <p className="font-black text-slate-900 text-[10px] md:text-sm truncate uppercase">{users[0].name}</p>
                                    <p className="text-amber-600 font-black text-[9px] md:text-[11px] uppercase tracking-widest mt-1">{users[0].points} PTS</p>
                                </div>
                            </div>
                            {}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-orange-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                                        {users[2].profilePhoto ? (
                                            <img src={users[2].profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span className="text-xl font-black text-orange-400">{users[2].name[0]}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-600 border-2 border-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">3rd</div>
                                </div>
                                <div className="text-center w-full bg-orange-50/50 rounded-2xl p-3 border border-orange-100 shadow-sm h-16 md:h-20 flex flex-col justify-center">
                                    <p className="font-black text-orange-800 text-[10px] md:text-xs truncate uppercase">{users[2].name}</p>
                                    <p className="text-orange-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest mt-1">{users[2].points} PTS</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {}
                    <div className="space-y-3">
                        {users.map((user, index) => (
                            (index >= 3 || users.length < 3) && (
                                <div key={user.id} className={`bg-white p-3 md:p-4 rounded-2xl border flex items-center transition-all hover:shadow-md group ${currentUser?.uid === user.id ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/5' : 'border-slate-100'}`}>
                                    <div className="w-6 md:w-8 text-[10px] font-black text-slate-300 uppercase italic group-hover:text-emerald-500 transition-colors">#{index + 1}</div>
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 overflow-hidden border border-white shadow-sm mr-4">
                                        {user.profilePhoto ? (
                                            <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            user.name?.charAt(0)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-tight truncate">{user.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {user.role === 'admin' && <span className="text-[8px] font-black uppercase tracking-widest bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Admin</span>}
                                            {user.role === 'checker' && <span className="text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Checker</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 uppercase tracking-tighter">{user.points.toLocaleString()}</p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {communities.map((comm, index) => (
                        <div key={comm.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center hover:border-emerald-200 transition-all hover:shadow-md group">
                            <div className="w-10 text-xs font-black text-slate-300 italic group-hover:text-emerald-500">#{index + 1}</div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-4 border border-emerald-100 animate-sway">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{comm.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">Active Community Members Tracking</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-600 tracking-tighter">{(comm.community_points || 0).toLocaleString()}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Impact Score</p>
                            </div>
                        </div>
                    ))}
                    {communities.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No communities have claimed the top spots yet.</p>
                        </div>
                    )}
                </div>
            )}
            {}
            <div className="md:hidden fixed bottom-24 left-4 right-4 bg-slate-900/95 backdrop-blur-lg text-white p-4 rounded-2xl shadow-2xl z-40 border border-white/10 animate-slide-up">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                            #1
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Position</p>
                            <p className="text-xs font-black uppercase">Climb the ranks!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em]">Top 5%</p>
                        <div className="flex gap-1 mt-1">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                            <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-30"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Leaderboard;
