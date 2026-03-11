import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
export const seedDatabase = async (currentUser) => {
    if (!currentUser) {
        alert("You must be logged in to seed data!");
        return;
    }
    const treesCollection = collection(db, "trees");
    const postsCollection = collection(db, "posts");
    try {
        const treesData = [
            { species: "Mango Tree (Mangifera indica)", location: "Backyard Garden", plantedDate: "2023-05-15", healthScore: 95 },
            { species: "Neem Tree (Azadirachta indica)", location: "Community Park, North Corner", plantedDate: "2023-08-20", healthScore: 88 },
            { species: "Oak Sapling", location: "Roadside Avenue", plantedDate: "2024-01-10", healthScore: 72 }
        ];
        const treeIds = [];
        for (const tree of treesData) {
            const docRef = await addDoc(treesCollection, {
                ...tree,
                caretakerId: currentUser.uid,
                createdAt: serverTimestamp()
            });
            treeIds.push(docRef.id);
        }
        const postsData = [
            { caption: "Just planted this beautiful Mango tree! 🌱 #GreenTrack", status: "verified", upvotesCount: 12, imageUrl: "https://images.unsplash.com/photo-1599598425947-d352b344569b?w=800&q=80" },
            { caption: "Watering day for the Neem tree. It's growing fast!", status: "verified", upvotesCount: 5, imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" },
            { caption: "Added some organic compost today. Hope it helps with the yellowing leaves.", status: "pending", upvotesCount: 2, imageUrl: "https://images.unsplash.com/photo-1598555848316-5629f635c91f?w=800&q=80" },
            { caption: "Morning checkup: The Oak sapling is standing strong despite the wind.", status: "verified", upvotesCount: 8, imageUrl: "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=800&q=80" },
            { caption: "Sunset view of the garden. 🌿", status: "pending", upvotesCount: 0, imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&q=80" }
        ];
        for (const [index, post] of postsData.entries()) {
            await addDoc(postsCollection, {
                userId: currentUser.uid,
                userName: currentUser.displayName || "GreenTracker",
                userPhoto: currentUser.photoURL || null,
                treeId: treeIds[index % treeIds.length], // Distribute posts among trees
                caption: post.caption,
                imageUrl: post.imageUrl,
                location: { lat: 28.6139 + (Math.random() * 0.01), lng: 77.2090 + (Math.random() * 0.01) }, // Mock location (New Delhi approx)
                createdAt: serverTimestamp(),
                status: post.status,
                upvotesCount: post.upvotesCount
            });
        }
        alert("Successfully seeded 3 trees and 5 posts! Refresh the page to see them.");
        window.location.reload();
    } catch (error) {
        console.error("Error seeding data:", error);
        alert("Failed to seed data. Check console for details.");
    }
};
