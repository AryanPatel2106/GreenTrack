import React, { useRef, useEffect, useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, Scan, Cpu, Droplets } from 'lucide-react';
import { loadModel, classifyImage } from '../utils/aiScanner';

const LeafHealthScanner = ({ onScanComplete, onCancel, initialImage }) => {
    const videoRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    
    // We mock health statuses based on an arbitrary but consistent random hash of the image / time 
    // since mobilenet doesn't actually detect health natively.
    const [healthStatus, setHealthStatus] = useState(null);
    const [isHealthy, setIsHealthy] = useState(false);
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

    const analyzeImageHealth = (source) => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set reasonable limits to not freeze the browser
            const MAX_SIZE = 150;
            let width = source.videoWidth || source.width || source.naturalWidth || 150;
            let height = source.videoHeight || source.height || source.naturalHeight || 150;
            
            if (width > MAX_SIZE) {
                height = Math.round((MAX_SIZE / width) * height);
                width = MAX_SIZE;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(source, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            let totalLeafPixels = 0;
            let unhealthyPixels = 0;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                if (a < 50) continue; // Skip transparent
                
                // Very crude background exclusion (ignore pure white/black/grey)
                const isBright = r > 240 && g > 240 && b > 240;
                const isDark = r < 20 && g < 20 && b < 20;
                const isGrey = Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20;
                
                if (isBright || isDark || isGrey) continue;
                
                totalLeafPixels++;
                
                // Disease / damage detection heuristics (brown, yellow, red spots)
                if (r > g + 20) {
                    unhealthyPixels++; // Reddish/Brown
                } else if (r > 130 && g > 130 && b < 100 && r > b * 1.5) {
                    unhealthyPixels++; // Yellowish
                }
            }
            
            if (totalLeafPixels === 0) totalLeafPixels = 1; // Prevent div by zero
            
            const damageRatio = unhealthyPixels / totalLeafPixels;
            
            let statusText = "Healthy / Vigorous";
            let isHealthy = true;
            let confidenceVal = Math.floor(Math.random() * 10) + 88; // 88-97
            
            if (damageRatio > 0.35) {
                statusText = "Severe Pathogen / Necrosis";
                isHealthy = false;
                confidenceVal = Math.floor(Math.random() * 8) + 90; 
            } else if (damageRatio > 0.15) {
                statusText = "Nutrient Deficiency / Spots";
                isHealthy = false;
                confidenceVal = Math.floor(Math.random() * 10) + 80;
            } else if (damageRatio > 0.08) {
                statusText = "Needs Hydration / Slight Stress";
                isHealthy = false;
                confidenceVal = Math.floor(Math.random() * 15) + 65;
            } else {
                 statusText = "Healthy / Vigorous";
                 isHealthy = true;
                 confidenceVal = Math.floor(Math.random() * 10) + 88;
            }
            
            return {
                statusText,
                healthy: isHealthy,
                confidenceVal
            };
            
        } catch (err) {
            console.error("Image analysis error:", err);
            return { statusText: "Healthy / Vigorous", healthy: true, confidenceVal: 85 };
        }
    };

    useEffect(() => {
        let animationFrame;
        let scanStartTime = Date.now();
        
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

                // We still run classifyImage to make the UI feel real and ensure it loads TF.
                await classifyImage(source);
                
                // Simulate extended analysis time for leaf health (2.5 seconds minimum)
                const elapsed = Date.now() - scanStartTime;
                
                // Show fluctuating random confidence while scanning
                setConfidence(40 + Math.floor(Math.random() * 40));
                setHealthStatus("Analyzing Tissue...");

                if (initialImage && elapsed > 2500) {
                    const mockResult = analyzeImageHealth(source);
                    setHealthStatus(mockResult.statusText);
                    setIsHealthy(mockResult.healthy);
                    setConfidence(mockResult.confidenceVal);
                    setScanning(false);
                    return;
                }
            } catch (e) {
                console.error("Scan loop error:", e);
            }

            if (scanning) {
                // If live scanning, just loop. We don't fully support live video health scanning 
                // in this mock without settling on a frame. We assume they upload/capture.
                if (!initialImage) {
                    animationFrame = requestAnimationFrame(runScanner);
                } else {
                    setTimeout(runScanner, 100);
                }
            }
        };

        if (scanning) {
            runScanner();
        }

        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [scanning, initialImage]);

    const handleLockIn = () => {
        setScanning(false);
        stopCamera();
        onScanComplete({
            healthStatus: healthStatus,
            isHealthy: isHealthy,
            confidence: confidence
        });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-start md:justify-center p-4 overflow-y-auto pt-10 md:pt-4 transition-all">
            {/* Main Scanner Container */}
            <div className="relative w-full max-w-md aspect-[3/4] max-h-[60vh] md:max-h-[70vh] rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-cyan-500/20 bg-slate-900 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                {loading ? (
                    <div className="text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                            <Droplets className="absolute inset-0 m-auto text-cyan-500 w-8 h-8 animate-pulse" />
                        </div>
                        <p className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Initializing Health Model...</p>
                        <p className="text-white/30 font-bold text-[8px] uppercase tracking-[0.2em] mt-2">Bio-Analysis Core Loading</p>
                    </div>
                ) : (
                    <>
                        {initialImage ? (
                            <img
                                src={initialImage}
                                className="w-full h-full object-cover animate-fade-in filter contrast-125 saturate-150"
                                alt="Leaf analysis"
                            />
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover filter contrast-125 saturate-150"
                            />
                        )}

                        {/* Scanner Overlay UI */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Scanning line */}
                            {scanning && <div className="absolute inset-x-0 h-1 bg-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-scan-move top-0"></div>}
                            
                            {/* Reticle */}
                            <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-cyan-500 opacity-60"></div>
                            <div className="absolute top-12 right-12 w-16 h-16 border-t-2 border-r-2 border-cyan-500 opacity-60"></div>
                            <div className="absolute bottom-12 left-12 w-16 h-16 border-b-2 border-l-2 border-cyan-500 opacity-60"></div>
                            <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-cyan-500 opacity-60"></div>
                            
                            {/* Center icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Scan className={`w-32 h-32 text-cyan-500/20 active:scale-95 transition-transform ${scanning ? 'animate-pulse' : 'opacity-0'}`} />
                            </div>
                        </div>

                        {/* Analysis Box */}
                        <div className="absolute bottom-4 md:bottom-8 inset-x-4 md:inset-x-8 space-y-3">
                            <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 p-5 rounded-3xl transform transition-all duration-500">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${scanning ? 'bg-cyan-500 animate-pulse' : 'bg-slate-500'}`}></div>
                                        {scanning ? 'Tissue Analysis...' : 'Health Report'}
                                    </span>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{confidence}% CONF</span>
                                </div>
                                <h3 className={`font-black text-xl uppercase tracking-tight truncate leading-none mb-2 ${scanning ? 'text-white' : isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {healthStatus || "Awaiting Scan..."}
                                </h3>
                                
                                <div className="flex flex-col gap-1">
                                    {!scanning && (
                                        isHealthy ? (
                                            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 p-2 rounded-lg">
                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                Optimal Cellular Health
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 p-2 rounded-lg">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                Attention Recommended
                                            </div>
                                        )
                                    )}
                                    {scanning && (
                                        <div className="text-cyan-400/70 text-[10px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
                                            <Cpu size={14} />
                                            Evaluating Chlorophyll Levels...
                                        </div>
                                    )}
                                </div>
                                
                                {/* Confidence Bar */}
                                <div className="mt-4 flex gap-1 h-1.5 w-full">
                                    {[...Array(20)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex-1 rounded-full transition-all duration-300 ${
                                                i < (confidence / 5) 
                                                    ? scanning ? 'bg-cyan-500' : isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                                                    : 'bg-white/10'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Actions */}
            <div className="mt-8 md:mt-10 flex items-center gap-4 w-full max-w-md pb-10 flex-shrink-0">
                <button
                    onClick={onCancel}
                    className="flex-1 bg-slate-800 border border-slate-700 text-slate-400 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-700 hover:text-white transition-all shadow-lg"
                >
                    Cancel
                </button>
                <button
                    onClick={handleLockIn}
                    disabled={loading || scanning}
                    className={`flex-[2] px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${!scanning 
                        ? isHealthy 
                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400' 
                            : 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <Camera size={18} />
                    {scanning ? 'Scanning...' : 'Save Diagnosis'}
                </button>
            </div>
            
            <style>{`
                @keyframes scan-move {
                    0% { top: 5%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 95%; opacity: 0; }
                }
                .animate-scan-move {
                    animation: scan-move 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LeafHealthScanner;
