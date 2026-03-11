import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Scan, Cpu } from 'lucide-react';
import { loadModel, classifyImage, findPlantResult } from '../utils/aiScanner';
const GreenVisionScanner = ({ onScanComplete, onCancel, initialImage }) => {
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [isPlant, setIsPlant] = useState(false);
    const [confidence, setConfidence] = useState(0);
    useEffect(() => {
        if (initialImage) {
            setupStaticScan();
        } else {
            startCamera();
        }
        return () => stopCamera();
    }, [initialImage]);
    const setupStaticScan = async () => {
        try {
            setLoading(true);
            await loadModel();
            setLoading(false);
            setScanning(true);
        } catch (err) {
            console.error("Static scan setup error:", err);
            setLoading(false);
        }
    };
    const startCamera = async () => {
        try {
            setLoading(true);
            await loadModel(); // Ensure model is ready
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setLoading(false);
                setScanning(true);
            }
        } catch (err) {
            console.error("Camera/Model error:", err);
            setLoading(false);
        }
    };
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
    };
    useEffect(() => {
        let animationFrame;
        const runScanner = async () => {
            if (!scanning) return;
            try {
                let source = null;
                if (initialImage) {
                    const img = new Image();
                    img.src = initialImage;
                    await new Promise(r => img.onload = r);
                    source = img;
                } else if (videoRef.current) {
                    source = videoRef.current;
                }
                if (!source) return;
                const results = await classifyImage(source);
                const plantMatch = findPlantResult(results);
                if (plantMatch) {
                    setPrediction(plantMatch.displayName);
                    setConfidence(Math.round(plantMatch.probability * 100));
                    setIsPlant(true);
                } else if (results.length > 0) {
                    const topResult = results[0];
                    setPrediction(topResult.className);
                    setConfidence(Math.round(topResult.probability * 100));
                    setIsPlant(false);
                }
                if (initialImage) {
                    setScanning(false);
                    return;
                }
            } catch (e) {
                console.error("Scan loop error:", e);
            }
            if (!initialImage) {
                animationFrame = requestAnimationFrame(runScanner);
            }
        };
        if (scanning) {
            runScanner();
        }
        return () => cancelAnimationFrame(animationFrame);
    }, [scanning]);
    const handleLockIn = () => {
        setScanning(false);
        stopCamera();
        onScanComplete({
            species: prediction,
            isVerified: isPlant && confidence >= 10
        });
    };
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-start md:justify-center p-4 overflow-y-auto pt-10 md:pt-4">
            {}
            <div className="relative w-full max-w-md aspect-[3/4] max-h-[60vh] md:max-h-[70vh] rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-emerald-500/20 bg-slate-900 flex items-center justify-center flex-shrink-0">
                {loading ? (
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <Cpu className="absolute inset-0 m-auto text-emerald-500 w-8 h-8 animate-pulse" />
                        </div>
                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing Neural Core...</p>
                        <p className="text-white/30 font-bold text-[8px] uppercase tracking-[0.2em] mt-2">One-time download: Advanced Precision (V2 Alpha 1.0)</p>
                    </div>
                ) : (
                    <>
                        {initialImage ? (
                            <img
                                src={initialImage}
                                className="w-full h-full object-cover animate-fade-in"
                                alt="Selected for analysis"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                        )}
                        {}
                        <div className="absolute inset-0 pointer-events-none">
                            {}
                            {scanning && <div className="absolute inset-x-0 h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-scan-move top-0"></div>}
                            {}
                            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl opacity-50"></div>
                            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl opacity-50"></div>
                            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl opacity-50"></div>
                            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl opacity-50"></div>
                            {}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan className={`w-24 h-24 text-emerald-500/20 active:scale-95 transition-transform ${scanning ? 'animate-pulse' : 'opacity-0'}`} />
                            </div>
                        </div>
                        {}
                        <div className="absolute bottom-4 md:bottom-8 inset-x-4 md:inset-x-8 space-y-3">
                            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-3xl transform transition-all duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        {initialImage ? (scanning ? 'Image Analysis...' : 'Analysis Finalized') : 'Live Analysis'}
                                    </span>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{confidence}% CONFIDENCE</span>
                                </div>
                                <h3 className="text-white font-black text-xl uppercase tracking-tight truncate leading-none mb-1">
                                    {prediction || "Calibrating..."}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {isPlant ? (
                                        <>
                                            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                                <CheckCircle2 size={12} />
                                                Verified Biological Signature
                                            </div>
                                            <div className="text-white/40 text-[8px] font-medium uppercase tracking-[0.1em] italic">
                                                Note: Generic leaf profile may vary by species
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                                            <AlertCircle size={12} />
                                            {scanning ? 'Analyzing Environment...' : 'Unrecognized Subject'}
                                        </div>
                                    )}
                                </div>
                                {}
                                <div className="mt-3 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${isPlant ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${confidence}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {}
            <div className="mt-8 md:mt-10 flex items-center gap-4 w-full max-w-md pb-10 flex-shrink-0">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-white/5 border border-white/10 text-white/50 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                    Abort
                </button>
                <button
                    onClick={handleLockIn}
                    disabled={loading || !isPlant || confidence < 10}
                    className={`flex-[2] px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isPlant && confidence >= 10
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                >
                    <Camera size={18} />
                    Target Locked
                </button>
            </div>
            <style>{`
                @keyframes scan-move {
                    0% { top: 10%; opacity: 0; }
                    50% { opacity: 0.8; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan-move {
                    animation: scan-move 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};
export default GreenVisionScanner;
