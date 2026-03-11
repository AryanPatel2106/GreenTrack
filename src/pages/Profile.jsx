import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Award, Camera, Loader, Check, X } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile } from "firebase/auth";
import confetti from 'canvas-confetti';
import ImageCropper from '../components/ImageCropper';
import { processFile } from '../utils/fileUtils';
const Profile = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        if (!currentUser) return;
        const fetchProfile = async () => {
            try {
                const { default: api } = await import('../utils/api');
                const response = await api.get('/users/profile');
                console.log("[FRONTEND] Profile data received:", response.data);
                setUserData(response.data);
            } catch (err) {
                console.error("Profile error:", err);
            }
        };
        fetchProfile();
    }, [currentUser]);
    const displayUser = userData || currentUser;
    useEffect(() => {
        if (userData?.is_community_leader) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                disableForReducedMotion: true
            });
        }
    }, [userData?.is_community_leader]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [processingFile, setProcessingFile] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    useEffect(() => {
        if (userData) {
            setEditName(userData.name || '');
            setEditBio(userData.bio || '');
        }
    }, [userData]);
    const handleSaveProfile = async () => {
        try {
            const { default: api } = await import('../utils/api');
            await api.put('/users/profile', { name: editName, bio: editBio });
            try {
                if (editName !== currentUser.displayName) {
                    await updateProfile(auth.currentUser, { displayName: editName });
                }
            } catch (firebaseErr) {
                console.error("Firebase sync failed:", firebaseErr);
            }
            setUserData(prev => ({ ...prev, name: editName, bio: editBio }));
            setIsEditing(false);
        } catch (error) {
            console.error("Save profile error [v3]:", error);
            const msg = error.response?.data || error.message;
            alert(`Failed to save profile changes [v3]: ${msg}`);
        }
    };
    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setProcessingFile(true);
            try {
                const originalFile = e.target.files[0];
                const processedFile = await processFile(originalFile);
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    setSelectedFile(reader.result);
                    setShowCropper(true);
                    setProcessingFile(false);
                });
                reader.readAsDataURL(processedFile);
            } catch (error) {
                console.error("File processing error:", error);
                alert(error.message);
                setProcessingFile(false);
            }
        }
    };
    const handleCropComplete = async (croppedBlob) => {
        setUploading(true);
        setShowCropper(false);
        try {
            const formData = new FormData();
            formData.append('file', croppedBlob, 'profile.jpg');
            const { default: api } = await import('../utils/api');
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const photoUrl = uploadRes.data.url;
            await api.put('/users/profile/photo', { photoUrl });
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: photoUrl });
            }
            setUserData(prev => ({ ...prev, photo_url: photoUrl }));
            window.location.reload();
        } catch (err) {
            console.error("Profile upload failed:", err);
            alert("Failed to update profile picture.");
        } finally {
            setUploading(false);
        }
    };
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in px-4 md:px-0">
            {showCropper && (
                <ImageCropper
                    image={selectedFile}
                    aspect={1}
                    onComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                />
            )}
            { }
            { }
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User className="w-64 h-64 -mr-20 -mt-20" />
                </div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="relative group/avatar cursor-pointer">
                        <div onClick={() => document.getElementById('profile-upload').click()}>
                            {(userData?.photo_url || currentUser?.photoURL) ? (
                                <img
                                    src={userData?.photo_url || currentUser.photoURL}
                                    alt="Profile"
                                    className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] object-cover shadow-2xl transition-transform group-hover/avatar:scale-105 ${userData?.is_community_leader ? 'ring-8 ring-amber-400/20' : 'ring-8 ring-emerald-500/10'}`}
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl transition-transform group-hover/avatar:scale-105">
                                    <User className="w-16 h-16 text-white" />
                                </div>
                            )}
                            { }
                            <div className="absolute inset-0 bg-black/30 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera className="w-8 h-8 text-white drop-shadow-md" />
                            </div>
                        </div>
                        { }
                        <input
                            type="file"
                            id="profile-upload"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {(uploading || processingFile) && (
                            <div className="absolute inset-0 bg-emerald-500/90 rounded-[2.5rem] flex items-center justify-center">
                                <Loader className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    { }
                    <div className="flex-1 text-center md:text-left">
                        {!isEditing ? (
                            <>
                                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                                    {displayUser?.name || displayUser?.displayName || 'Guardian'}
                                    {userData?.is_community_leader && (
                                        <span className="text-amber-500 text-2xl animate-pulse" title="Community Leader">👑</span>
                                    )}
                                </h1>
                                <p className="text-slate-500 text-sm font-medium mb-6">{displayUser?.email}</p>
                                {userData?.bio && (
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-md mx-auto md:mx-0">{userData.bio}</p>
                                )}
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 nature-btn"
                                >
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none"
                                    placeholder="Your Name"
                                />
                                <textarea
                                    value={editBio}
                                    onChange={(e) => setEditBio(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none resize-none"
                                    rows="3"
                                    placeholder="Tell us about yourself..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 nature-btn"
                                    >
                                        <Check className="w-4 h-4" /> Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 nature-btn"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            { }
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center">
                        <Award className="mr-3 text-emerald-500 w-6 h-6" /> Achievements
                    </h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {userData?.badges?.length || 0} Unlocked
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {userData?.badges && userData.badges.length > 0 ? (
                        userData.badges.map((badge, idx) => (
                            <div key={idx} className="group relative">
                                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                <div className="relative text-center p-6 bg-slate-50 border border-slate-100 rounded-3xl transition-transform hover:-translate-y-2">
                                    <span className="text-4xl block mb-3 grayscale group-hover:grayscale-0 transition-all">{badge.icon || '🏅'}</span>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{badge.name}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="text-center p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                                <span className="text-4xl block mb-3 animate-pulse">🌱</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">New Guardian</p>
                            </div>
                            <div className="text-center p-6 bg-slate-50 border border-slate-100 border-dashed rounded-3xl flex flex-col items-center justify-center opacity-40">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-slate-400 text-sm">🔒</span>
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Locked</p>
                            </div>
                            <div className="text-center p-6 bg-slate-50 border border-slate-100 border-dashed rounded-3xl flex flex-col items-center justify-center opacity-40">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-slate-400 text-sm">🔒</span>
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Locked</p>
                            </div>
                            <div className="text-center p-6 bg-slate-50 border border-slate-100 border-dashed rounded-3xl flex flex-col items-center justify-center opacity-40">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-slate-400 text-sm">🔒</span>
                                </div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Locked</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Profile;
