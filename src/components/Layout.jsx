import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { LogOut, TreeDeciduous, User, Bell, LayoutDashboard, Globe, Users, Sprout, Trophy, Menu, X, ChevronDown, Check } from 'lucide-react';
import NatureBackground from './NatureBackground';
const Layout = ({ children }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    React.useEffect(() => {
        if (currentUser) {
            fetchPendingRequests();
        }
    }, [currentUser]);
    const fetchPendingRequests = async () => {
        try {
            const { default: api } = await import('../utils/api');
            const response = await api.get('/follows/requests');
            setPendingRequests(response.data);
        } catch (error) {
            console.error("Fetch requests error:", error);
        }
    };
    const handleFollowAction = async (requestId, status) => {
        try {
            const { default: api } = await import('../utils/api');
            await api.patch(`/follows/${requestId}/status`, { status });
            setPendingRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (error) {
            console.error("Follow action error:", error);
            alert("Failed to update request status.");
        }
    };
    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };
    const isActive = (path) => location.pathname === path;
    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/feed', label: 'Feed', icon: Globe },
        { path: '/community', label: 'Community', icon: Users },
        { path: '/friends', label: 'Friends', icon: User },
        { path: '/trees', label: 'My Trees', icon: Sprout },
        { path: '/leaderboard', label: 'Rankings', icon: Trophy },
    ];
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 relative">
            <NatureBackground />
            {}
            <nav className="glass-effect sticky top-0 z-50 border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link to="/dashboard" className="flex items-center group">
                                <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-lg text-white shadow-lg group-hover:scale-105 transition-transform duration-200">
                                    <TreeDeciduous className="w-6 h-6" />
                                </div>
                                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-teal-600 tracking-tight hidden sm:block">
                                    GreenTrack
                                </span>
                            </Link>
                        </div>
                        {}
                        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 nature-btn ${isActive(link.path)
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100'
                                        : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                                        }`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                    className={`p-2 rounded-xl transition-all duration-200 relative ${isNotificationsOpen ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'}`}
                                >
                                    <Bell className="w-5 h-5" />
                                    {pendingRequests.length > 0 && (
                                        <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                            {pendingRequests.length}
                                        </span>
                                    )}
                                </button>
                                {isNotificationsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)}></div>
                                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 overflow-hidden animate-fade-in origin-top-right">
                                            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Notifications</h3>
                                                {pendingRequests.length > 0 && (
                                                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                                        {pendingRequests.length} New
                                                    </span>
                                                )}
                                            </div>
                                            <div className="max-h-[400px] overflow-y-auto">
                                                {pendingRequests.length > 0 ? (
                                                    <div className="divide-y divide-slate-50">
                                                        {pendingRequests.map(request => (
                                                            <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                                                                <div className="flex gap-3">
                                                                    <img
                                                                        src={request.follower_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.follower_name}`}
                                                                        className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100"
                                                                        alt=""
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm text-slate-900 leading-tight mb-1">
                                                                            <span className="font-bold">{request.follower_name}</span> wants to follow you
                                                                        </p>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => handleFollowAction(request.id, 'accepted')}
                                                                                className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-1"
                                                                            >
                                                                                <Check className="w-3 h-3" /> Accept
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleFollowAction(request.id, 'rejected')}
                                                                                className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-1"
                                                                            >
                                                                                <X className="w-3 h-3" /> Decline
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <Bell className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                        <p className="text-sm text-slate-400 font-medium">No new notifications</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 border-t border-slate-50 text-center">
                                                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                                                    View All Activities
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            {}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors group outline-none"
                                >
                                    {currentUser?.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white shadow-sm object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border border-white shadow-sm">
                                            {currentUser?.displayName?.charAt(0) || 'U'}
                                        </div>
                                    )}
                                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {}
                                {isProfileMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-40 py-2 animate-fade-in origin-top-right">
                                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                                <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.displayName}</p>
                                                <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <User className="w-4 h-4 mr-2" />
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsProfileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Log Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            {}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-safe">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex flex-col items-center justify-center space-y-1 nature-btn ${isActive(link.path) ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600 transition-colors'
                            }`}
                    >
                        <link.icon className={`w-6 h-6 ${isActive(link.path) ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{link.label}</span>
                    </Link>
                ))}
            </div>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-20 md:mb-0 animate-fade-in">
                {children}
            </main>
        </div>
    );
};
export default Layout;
