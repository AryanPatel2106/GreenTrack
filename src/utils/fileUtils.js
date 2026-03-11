import heic2any from "heic2any";
export const processFile = async (file) => {
    const isHeic = file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif');
    if (isHeic) {
        try {
            console.log("HEIC file detected. Converting...");
            const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8
            });
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            const newFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
            return new File([blob], newFileName, {
                type: "image/jpeg"
            });
        } catch (error) {
            console.error("Error converting HEIC:", error);
            throw new Error("Failed to convert HEIC image. Please try a standard JPEG or PNG.");
        }
    }
    return file;
};
