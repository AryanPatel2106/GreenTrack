import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
let model = null;
export const loadModel = async () => {
    if (model) return model;
    console.log("Loading AI Model...");
    try {
        model = await mobilenet.load({
            version: 2,
            alpha: 1.0
        });
        console.log("AI Model loaded successfully (V2 Alpha 1.0)");
        return model;
    } catch (error) {
        console.error("Failed to load AI model:", error);
        throw error;
    }
};
export const classifyImage = async (image) => {
    if (!model) {
        await loadModel();
    }
    try {
        const predictions = await model.classify(image);
        return predictions;
    } catch (error) {
        console.error("Classification error:", error);
        return [];
    }
};
export const isPlantRelated = (predictions) => {
    return !!findPlantResult(predictions);
};
export const translateToBotanicalCategory = (className) => {
    const name = className.toLowerCase();
    if (name.includes('tree') || name.includes('oak') || name.includes('pine') || name.includes('palm') || name.includes('spruce') || name.includes('cedar') || name.includes('willow') || name.includes('maple') || name.includes('birch')) {
        return "Tree / Forest Signature";
    }
    if (name.includes('orchid') || name.includes('slipper') || name.includes('flower') || name.includes('bloom') || name.includes('petal')) {
        return "Tropical Flora / Flowering Plant";
    }
    if (name.includes('mango') || name.includes('fruit') || name.includes('lemon') || name.includes('orange') || name.includes('apple')) {
        return "Fruit-Bearing Tree / Vegetation";
    }
    if (name.includes('leaf') || name.includes('foliage') || name.includes('greenery') || name.includes('vegetation')) {
        return "Greenery / Foliage";
    }
    if (name.includes('grass') || name.includes('moss') || name.includes('fern') || name.includes('herb')) {
        return "Low-Lying Vegetation / Plant";
    }
    return "Botanical Signature"; // Default fallback for any matched keyword
};
export const findPlantResult = (predictions) => {
    const plantKeywords = [
        'tree', 'plant', 'leaf', 'flower', 'forest', 'wood',
        'grass', 'stem', 'branch', 'nature', 'flora', 'vegetation',
        'park', 'garden', 'oak', 'pine', 'palm', 'bush', 'shrub',
        'spruce', 'cedar', 'willow', 'maple', 'birch', 'conifer', 'evergreen',
        'cedar', 'cyprus', 'sequoia', 'bonsai', 'pot', 'herb',
        'mango', 'fruit', 'orchid', 'slipper', 'bloom', 'petal', 'seed',
        'sap', 'root', 'stump', 'canopy', 'foliage', 'greenery',
        'tropical', 'jungle', 'bark', 'acacia', 'baobab', 'banyan',
        'ebony', 'mahogany', 'teak', 'bamboo', 'fern', 'moss', 'algae',
        'buckeye', 'chestnut', 'walnut', 'pecan', 'fig', 'olive', 'citrus',
        'lemon', 'orange', 'apple', 'pear', 'cherry', 'plum', 'peach'
    ];
    const match = predictions.find(p => {
        const className = p.className.toLowerCase();
        return plantKeywords.some(keyword => className.includes(keyword)) && p.probability > 0.02;
    });
    if (match) {
        return {
            ...match,
            displayName: translateToBotanicalCategory(match.className)
        };
    }
    return null;
};
