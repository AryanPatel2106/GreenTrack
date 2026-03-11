import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Camera, MapPin, Loader, Scan } from 'lucide-react';
import ImageCropper from './ImageCropper'; // Assuming same directory or adjust path
import GreenVisionScanner from './GreenVisionScanner';
import { processFile } from '../utils/fileUtils';
import api from '../utils/api';
const CreatePostModal = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [trees, setTrees] = useState([]);
    const [selectedTreeId, setSelectedTreeId] = useState('');
    const [tempImage, setTempImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [processingFile, setProcessingFile] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setProcessingFile(true);
            try {
                const originalFile = e.target.files[0];
                const processedFile = await processFile(originalFile);
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    setTempImage(reader.result);
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
    const handleCropComplete = (croppedBlob) => {
        const file = new File([croppedBlob], "cropped_image.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setShowCropper(false);
    };
    useEffect(() => {
        if (currentUser && isOpen) {
            const fetchData = async () => {
                try {
                    const treesRes = await api.get('/trees');
                    setTrees(treesRes.data);
                    const profileRes = await api.get('/users/profile');
                    if (profileRes.data && profileRes.data.community_id) {
                        setCurrentUserCommunityId(profileRes.data.community_id);
                    }
                } catch (err) {
                    console.error("Error fetching data:", err);
                }
            };
            fetchData();
        }
    }, [currentUser, isOpen]);
    const [currentUserCommunityId, setCurrentUserCommunityId] = useState('global');
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.error("Error getting location", error);
                alert("Location access denied or failed.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };
    const [uploadError, setUploadError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            alert("Location is required!");
            return;
        }
        setLoading(true);
        setUploadError(null);
        try {
            let imageUrl = "https://placehold.co/600x400?text=Tree+Care+Update";
            if (imageFile) {
                try {
                    console.log("Starting local image upload...");
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    const uploadRes = await api.post('/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    imageUrl = uploadRes.data.url;
                    console.log("Upload success, URL:", imageUrl);
                } catch (error) {
                    console.error("Upload failed:", error);
                    setLoading(false);
                    setUploadError(`Upload failed: ${error.response?.data || error.message}`);
                    return;
                }
            }
            await createPostRecord(imageUrl);
        } catch (error) {
            console.error("Error creating post", error);
            alert("Failed to create post: " + error.message);
            setLoading(false);
        }
    };
    const createPostRecord = async (imageUrl) => {
        const communityId = currentUserCommunityId;
        await api.post('/posts', {
            treeId: selectedTreeId,
            caption: caption,
            imageUrl: imageUrl,
            hasImage: !!imageUrl,
            communityId: communityId,
            locationLat: location.lat,
            locationLng: location.lng,
            aiSpecies: scanResults?.species || null,
            isAiVerified: scanResults?.isVerified || false
        });
        resetForm();
    };
    const handleSkipImage = () => {
        setLoading(true);
        createPostRecord(null);
    };
    const resetForm = () => {
        setCaption('');
        setImageFile(null);
        setLocation(null);
        setSelectedTreeId('');
        setScanResults(null);
        setLoading(false);
        setUploadError(null);
        onClose();
    };
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            {showCropper && (
                <ImageCropper
                    image={tempImage}
                    aspect={4 / 3} // Standard post aspect ratio
                    onComplete={handleCropComplete}
                    onCancel={() => setShowCropper(false)}
                />
            )}
            {showScanner && (
                <GreenVisionScanner
                    initialImage={tempImage} // Pass the current photo for instant analysis
                    onScanComplete={(results) => {
                        setScanResults(results);
                        setShowScanner(false);
                        if (results.species) {
                            setCaption(prev => `${prev}\n\n[AI Identified: ${results.species}]`.trim());
                        }
                    }}
                    onCancel={() => setShowScanner(false)}
                />
            )}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>
            <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-10 animate-slide-up overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
                { }
                <div className="bg-slate-900 p-6 md:p-10 text-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <button
                            onClick={onClose}
                            className="absolute top-0 right-0 p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/20 shadow-inner transition-all animate-sway">
                            <Camera className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Capture Impact</h2>
                        <p className="text-slate-400 font-medium mt-1 text-xs md:text-sm">Share your tree's progress with the world.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    { }
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject of Care</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 appearance-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none cursor-pointer"
                            value={selectedTreeId}
                            onChange={(e) => setSelectedTreeId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose a Tree --</option>
                            {trees.map(t => <option key={t.id} value={t.id}>{t.species}</option>)}
                        </select>
                    </div>
                    { }
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Proof of Care</label>
                        <label className="relative group cursor-pointer block">
                            <div className={`w-full h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${imageFile ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200'}`}>
                                {imageFile ? (
                                    <div className="text-center">
                                        <div className="text-emerald-500 font-black text-[10px] uppercase truncate max-w-[200px] mb-1">{imageFile.name}</div>
                                        <div className="text-[8px] text-emerald-400 font-bold uppercase">Ready for upload</div>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Image</span>
                                    </>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        {imageFile && (
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2 nature-btn"
                            >
                                <Scan className="w-4 h-4" />
                                AI Plant Scan
                            </button>
                        )}
                    </div>
                    { }
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Caption</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none resize-none"
                            rows="3"
                            placeholder="How is your tree doing today?"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    { }
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl group transition-all hover:bg-white hover:border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400 animate-pulse'}`}>
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Position Sync Required"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={getLocation}
                            className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] py-1.5 px-3 rounded-xl hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 nature-btn"
                        >
                            Sync GPS
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || processingFile}
                        className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center nature-btn"
                    >
                        {loading || processingFile ? <Loader className="w-5 h-5 animate-spin" /> : "Publish Update"}
                    </button>
                    {uploadError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-fade-in">
                            <p className="text-[10px] font-black text-red-600 uppercase text-center mb-3">{uploadError}</p>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="flex-1 bg-white border border-red-200 rounded-xl py-2 text-[10px] font-black text-red-600 uppercase hover:bg-red-50 nature-btn"
                                >
                                    Retry
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkipImage}
                                    className="flex-1 bg-red-600 rounded-xl py-2 text-[10px] font-black text-white uppercase hover:bg-red-700 nature-btn"
                                >
                                    Skip Media
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>,
        document.body
    );
};
export default CreatePostModal;
