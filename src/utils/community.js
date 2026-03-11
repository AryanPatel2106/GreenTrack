export const COMMUNITIES = [
    { id: 'mumbai', name: 'Mumbai Community', type: 'city', lat: 19.0760, lng: 72.8777 },
    { id: 'delhi', name: 'Delhi Community', type: 'city', lat: 28.7041, lng: 77.1025 },
    { id: 'bengaluru', name: 'Bengaluru Community', type: 'city', lat: 12.9716, lng: 77.5946 },
    { id: 'chennai', name: 'Chennai Community', type: 'city', lat: 13.0827, lng: 80.2707 },
    { id: 'hyderabad', name: 'Hyderabad Community', type: 'city', lat: 17.3850, lng: 78.4867 },
    { id: 'kolkata', name: 'Kolkata Community', type: 'city', lat: 22.5726, lng: 88.3639 },
    { id: 'ahmedabad', name: 'Ahmedabad Community', type: 'city', lat: 23.0225, lng: 72.5714 },
    { id: 'pune', name: 'Pune Community', type: 'city', lat: 18.5204, lng: 73.8567 },
    { id: 'surat', name: 'Surat Community', type: 'city', lat: 21.1702, lng: 72.8311 },
    { id: 'jaipur', name: 'Jaipur Community', type: 'city', lat: 26.9124, lng: 75.7873 },
    { id: 'indore', name: 'Indore Community', type: 'city', lat: 22.7196, lng: 75.8577 },
    { id: 'bhopal', name: 'Bhopal Community', type: 'city', lat: 23.2599, lng: 77.4126 },
    { id: 'nagpur', name: 'Nagpur Community', type: 'city', lat: 21.1458, lng: 79.0882 },
    { id: 'nashik', name: 'Nashik Community', type: 'city', lat: 19.9975, lng: 73.7898 },
    { id: 'thane', name: 'Thane Community', type: 'city', lat: 19.2183, lng: 72.9781 },
    { id: 'lucknow', name: 'Lucknow Community', type: 'city', lat: 26.8467, lng: 80.9462 },
    { id: 'kanpur', name: 'Kanpur Community', type: 'city', lat: 26.4499, lng: 80.3319 },
    { id: 'ghaziabad', name: 'Ghaziabad Community', type: 'city', lat: 28.6692, lng: 77.4538 },
    { id: 'ludhiana', name: 'Ludhiana Community', type: 'city', lat: 30.9010, lng: 75.8573 },
    { id: 'agra', name: 'Agra Community', type: 'city', lat: 27.1767, lng: 78.0081 },
    { id: 'chandigarh', name: 'Chandigarh Community', type: 'city', lat: 30.7333, lng: 76.7794 },
    { id: 'visakhapatnam', name: 'Visakhapatnam Community', type: 'city', lat: 17.6868, lng: 83.2185 },
    { id: 'coimbatore', name: 'Coimbatore Community', type: 'city', lat: 11.0168, lng: 76.9558 },
    { id: 'kochi', name: 'Kochi Community', type: 'city', lat: 9.9312, lng: 76.2673 },
    { id: 'trivandrum', name: 'Trivandrum Community', type: 'city', lat: 8.5241, lng: 76.9366 },
    { id: 'mysuru', name: 'Mysuru Community', type: 'city', lat: 12.2958, lng: 76.6394 },
    { id: 'madurai', name: 'Madurai Community', type: 'city', lat: 9.9252, lng: 78.1198 },
    { id: 'patna', name: 'Patna Community', type: 'city', lat: 25.5941, lng: 85.1376 },
    { id: 'bhubaneswar', name: 'Bhubaneswar Community', type: 'city', lat: 20.2961, lng: 85.8245 },
    { id: 'guwahati', name: 'Guwahati Community', type: 'city', lat: 26.1158, lng: 91.7086 },
    { id: 'ranchi', name: 'Ranchi Community', type: 'city', lat: 23.3441, lng: 85.3096 },
    { id: 'global', name: 'Global Earth Guardians', type: 'global', lat: 0, lng: 0 }
];
export const getCityFromCoords = async (lat, lng) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            {
                headers: { 'Accept-Language': 'en' },
                signal: controller.signal
            }
        );
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error("OSM Response not ok");
        const data = await response.json();
        if (data && data.address) {
            const city = data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.suburb ||
                data.address.county;
            return city;
        }
        return null;
    } catch (error) {
        return null;
    }
};
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        }
    });
};
export const findNearestCommunity = (lat, lng) => {
    let closest = COMMUNITIES.find(c => c.id === 'global');
    let minDistance = Infinity;
    const MAX_DISTANCE_KM = 500;
    COMMUNITIES.forEach(community => {
        if (community.type === 'global') return;
        const dist = getDistanceFromLatLonInKm(lat, lng, community.lat, community.lng);
        if (dist < minDistance && dist <= MAX_DISTANCE_KM) {
            minDistance = dist;
            closest = community;
        }
    });
    return closest;
};
export const assignUserCommunity = async (userId, location = null) => {
    console.warn("assignUserCommunity is now handled by the backend server.");
    return null;
};
