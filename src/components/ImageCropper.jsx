import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/canvasUtils';
const ImageCropper = ({ image, aspect = 1, onComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        console.log("onCropComplete triggered", { croppedArea, croppedAreaPixels });
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);
    const showCroppedImage = useCallback(async () => {
        console.log("showCroppedImage called", { image, croppedAreaPixels });
        try {
            const croppedImage = await getCroppedImg(
                image,
                croppedAreaPixels,
                rotation
            );
            console.log("getCroppedImg result:", croppedImage);
            onComplete(croppedImage);
        } catch (e) {
            console.error("Error in showCroppedImage:", e);
        }
    }, [image, croppedAreaPixels, rotation, onComplete]);
    return (
        <div className="fixed inset-0 z-[70] bg-black/90 flex flex-col animate-fade-in">
            <div className="relative flex-1 w-full bg-slate-900">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    rotation={rotation}
                    onRotationChange={setRotation}
                    objectFit="contain"
                />
            </div>
            <div className="bg-white p-6 pb-10 rounded-t-3xl shadow-2xl animate-slide-up">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span>Zoom</span>
                            <span>{zoom.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <span>Rotate</span>
                            <span>{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            value={rotation}
                            min={0}
                            max={360}
                            step={1}
                            aria-labelledby="Rotation"
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl border border-slate-200 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={showCroppedImage}
                            className="flex-1 py-3 rounded-xl bg-emerald-500 font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ImageCropper;
