import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
const AuthContext = createContext();
export function useAuth() {
    return useContext(AuthContext);
}
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const { default: api } = await import('../utils/api');
                    const { getUserLocation, getCityFromCoords, findNearestCommunity } = await import('../utils/community');
                    let communityId = 'global';
                    let communityName = 'Global Earth Guardians';
                    try {
                        const loc = await getUserLocation();
                        console.log("%c[Sync] Lat/Lng Detected:", "color: #10b981", loc.lat, loc.lng);
                        const nearest = findNearestCommunity(loc.lat, loc.lng);
                        if (nearest) {
                            communityId = nearest.id;
                            communityName = nearest.name;
                            console.log(`%c[Sync] Proximity Match: ${communityName}`, "color: #10b981; font-weight: bold; border-left: 4px solid #10b981; padding-left: 8px;");
                        }
                    } catch (locErr) {
                        console.warn("[Sync] Geolocation Position Unavailable. User will remain in Global team.");
                    }
                    await api.post('/users', {
                        name: user.displayName || 'Anonymous',
                        email: user.email,
                        photoURL: user.photoURL,
                        communityId,
                        communityName
                    });
                    console.log(`User synced with ${communityName}`);
                } catch (apiErr) {
                    console.error("Failed to sync user with backend:", apiErr);
                }
            }
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    const value = {
        currentUser
    };
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
