const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');

let db = null;
// Initialize Firebase Admin
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("Firebase Admin initialized with serviceAccountKey.json");
} catch (e) {
    console.warn("Could not load serviceAccountKey.json, trying default credentials...", e.message);
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.VITE_FIREBASE_PROJECT_ID
        });
        db = admin.firestore();
        console.log("Firebase Admin initialized with applicationDefault");
    } catch (err) {
        console.warn("Firebase Admin failed to initialize entirely. Set up serviceAccountKey.json.");
    }
}

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware to verify Firebase Token
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('Unauthorized');
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log("Auth Success for UID:", decodedToken.uid);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).send('Unauthorized');
    }
};

// --- FILE UPLOAD (Cloudinary Storage) ---
const multer = require('multer');

// Use Memory Storage for processing file buffers
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});



// Upload Endpoint (Cloudinary)
app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        // Upload buffer to Cloudinary using a promise wrapper for the upload stream
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'greentrack' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
        };

        const result = await uploadToCloudinary(req.file.buffer);
        
        // Return Cloudinary public URL (secure_url)
        res.json({ url: result.secure_url });
    } catch (err) {
        console.error("Cloudinary Upload error:", err);
        res.status(500).send(err.message);
    }
});

// --- USERS ---

// Sync/Create User
app.post('/api/users', authenticate, async (req, res) => {
    const { name, email, photoURL, communityId, communityName } = req.body;
    const uid = req.user.uid;
    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        
        let finalName = name;
        if (!userDoc.exists) {
            // Check if name is already taken
            const nameCheck = await db.collection('users').where('name', '==', name).get();
            if (!nameCheck.empty) {
                const suffix = Math.floor(1000 + Math.random() * 9000);
                finalName = `${name} #${suffix}`;
                console.log(`Username '${name}' taken. Auto-assigning: '${finalName}'`);
            }

            await userRef.set({
                uid,
                name: finalName,
                email,
                photo_url: photoURL,
                points: 0,
                level: 1,
                xp: 0,
                trees_planted: 0,
                verified_posts: 0,
                role: 'user',
                community_id: communityId || 'global',
                community_name: communityName || 'Global Earth Guardians',
                is_community_leader: false,
                created_at: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            const userData = userDoc.data();
            if (communityId && communityId !== userData.community_id) {
                await userRef.update({
                    community_id: communityId,
                    community_name: communityName
                });
            }
        }

        const targetId = communityId || (userDoc.exists ? userDoc.data().community_id : null) || 'global';
        const targetName = communityName || (userDoc.exists ? userDoc.data().community_name : null) || 'Global Earth Guardians';

        const commRef = db.collection('communities').doc(targetId);
        const commDoc = await commRef.get();
        if (!commDoc.exists) {
            await commRef.set({
                id: targetId,
                name: targetName,
                community_points: 0,
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        res.status(200).send('User synced');
    } catch (err) {
        console.error("User Sync Error:", err);
        res.status(500).send(err.message);
    }
});

// Get User Profile
app.get('/api/users/profile', authenticate, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists) return res.status(404).send('User not found');
        
        const followersQuery = await db.collection('follows').where('target_id', '==', req.user.uid).where('status', '==', 'accepted').count().get();
        const followingQuery = await db.collection('follows').where('follower_id', '==', req.user.uid).where('status', '==', 'accepted').count().get();
        
        const userData = userDoc.data();
        userData.follower_count = followersQuery.data().count;
        userData.following_count = followingQuery.data().count;
        
        console.log(`[PROFILE] Sending stats for ${userData.name}: Followers: ${userData.follower_count}, Following: ${userData.following_count}`);
        res.json(userData);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update User Profile Photo
app.put('/api/users/profile/photo', authenticate, async (req, res) => {
    const { photoUrl } = req.body;
    try {
        await db.collection('users').doc(req.user.uid).update({ photo_url: photoUrl });
        res.status(200).send('Photo updated');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update User Profile (Name & Bio)
app.put('/api/users/profile', authenticate, async (req, res) => {
    const { name, bio } = req.body;
    const uid = req.user.uid;
    console.log(`Profile Update Request for ${uid}:`, { name, bio });
    try {
        // Check uniqueness of name if changed
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists && userDoc.data().name !== name) {
            const nameCheck = await db.collection('users').where('name', '==', name).get();
            if (!nameCheck.empty) {
                return res.status(409).send('Username already taken.');
            }
        }

        await db.collection('users').doc(uid).update({
            name,
            bio: bio || null
        });

        // Batch update posts and comments
        const batch = db.batch();
        const postsQuery = await db.collection('posts').where('user_id', '==', uid).get();
        postsQuery.forEach(doc => batch.update(doc.ref, { user_name: name }));
        
        const commentsQuery = await db.collection('comments').where('user_id', '==', uid).get();
        commentsQuery.forEach(doc => batch.update(doc.ref, { user_name: name }));
        
        await batch.commit();

        console.log(`Profile Update Success for ${uid}`);
        res.status(200).send('Profile updated');
    } catch (err) {
        console.error("Profile Save Error:", err);
        res.status(500).send(err.message);
    }
});

// Get Public Profile (Any User)
app.get('/api/users/:uid', authenticate, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.params.uid).get();
        if (!userDoc.exists) return res.status(404).send('User not found');
        
        const followersQuery = await db.collection('follows').where('target_id', '==', req.params.uid).where('status', '==', 'accepted').count().get();
        const followingQuery = await db.collection('follows').where('follower_id', '==', req.params.uid).where('status', '==', 'accepted').count().get();
        
        const userData = userDoc.data();
        userData.follower_count = followersQuery.data().count;
        userData.following_count = followingQuery.data().count;
        
        console.log(`[PUBLIC_PROFILE] Sending stats for ${userData.name}: Followers: ${userData.follower_count}, Following: ${userData.following_count}`);
        res.json(userData);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- TREES ---

// Register Tree
app.post('/api/trees', authenticate, async (req, res) => {
    const { species, plantedDate, location, treeTag } = req.body;
    try {
        // Check uniqueness of treeTag for this user
        const existingTree = await db.collection('trees')
            .where('caretaker_id', '==', req.user.uid)
            .where('tree_tag', '==', treeTag)
            .get();
        if (!existingTree.empty) {
            return res.status(409).send('You have already registered a tree with this ID.');
        }

        const treeRef = await db.collection('trees').add({
            tree_tag: treeTag,
            species,
            planted_date: plantedDate,
            location,
            caretaker_id: req.user.uid,
            health_score: 100,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add actual id to the document
        await treeRef.update({ id: treeRef.id });

        // Increment tree count and points
        await db.collection('users').doc(req.user.uid).update({
            trees_planted: admin.firestore.FieldValue.increment(1),
            points: admin.firestore.FieldValue.increment(20),
            xp: admin.firestore.FieldValue.increment(20)
        });
        
        res.status(201).send({ message: 'Tree registered', id: treeRef.id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get My Trees
app.get('/api/trees', authenticate, async (req, res) => {
    try {
        const treesSnapshot = await db.collection('trees').where('caretaker_id', '==', req.user.uid).get();
        const trees = treesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(trees);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Single Tree
app.get('/api/trees/:id', authenticate, async (req, res) => {
    console.log(`[GET_TREE] Requesting ID: ${req.params.id}`);
    try {
        const treeDoc = await db.collection('trees').doc(req.params.id).get();
        if (!treeDoc.exists) {
            console.warn(`[GET_TREE] Tree NOT FOUND for ID: ${req.params.id}`);
            return res.status(404).send('Tree not found');
        }
        res.json({ id: treeDoc.id, ...treeDoc.data() });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- POSTS ---

// Create Post
app.post('/api/posts', authenticate, async (req, res) => {
    const { caption, imageUrl, hasImage, treeId, communityId, locationLat, locationLng, aiSpecies, isAiVerified, leafImageUrl, leafHealthStatus, isLeafHealthy } = req.body;
    try {
        const postRef = await db.collection('posts').add({
            user_id: req.user.uid,
            user_name: req.user.name || 'Anonymous',
            user_photo: req.user.picture || '',
            tree_id: treeId,
            caption,
            image_url: imageUrl,
            has_image: hasImage,
            community_id: communityId,
            location_lat: locationLat,
            location_lng: locationLng,
            status: 'verified', // Set default
            ai_species: aiSpecies || null,
            is_ai_verified: isAiVerified || false,
            upvotes_count: 0,
            leaf_image_url: leafImageUrl || null,
            leaf_health_status: leafHealthStatus || null,
            is_leaf_healthy: isLeafHealthy || false,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        await postRef.update({ id: postRef.id });

        // Increment points
        await db.collection('users').doc(req.user.uid).update({
            points: admin.firestore.FieldValue.increment(5),
            xp: admin.firestore.FieldValue.increment(5)
        });
        
        res.status(201).send({ message: 'Post created', id: postRef.id });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Get Feed / Posts by Tree, Community, or User
app.get('/api/posts', authenticate, async (req, res) => {
    const { treeId, communityId, userId } = req.query;
    try {
        let query = db.collection('posts');

        if (treeId) query = query.where('tree_id', '==', treeId);
        if (communityId) query = query.where('community_id', '==', communityId);
        if (userId) query = query.where('user_id', '==', userId);

        query = query.orderBy('created_at', 'desc').limit(50);
        const postsSnapshot = await query.get();
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(posts);
    } catch (err) {
        console.error("Posts Fetch Error (Index likely missing):", err);
        res.status(500).send(err.message);
    }
});

// Like Post
app.post('/api/posts/:id/like', authenticate, async (req, res) => {
    try {
        const postRef = db.collection('posts').doc(req.params.id);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return res.status(404).send('Post not found');

        await postRef.update({
            upvotes_count: admin.firestore.FieldValue.increment(1)
        });

        // Award point to author
        const authorId = postDoc.data().user_id;
        if (authorId) {
            await db.collection('users').doc(authorId).update({
                points: admin.firestore.FieldValue.increment(1),
                xp: admin.firestore.FieldValue.increment(1)
            });
        }

        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete Post
app.delete('/api/posts/:id', authenticate, async (req, res) => {
    try {
        const postRef = db.collection('posts').doc(req.params.id);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return res.status(404).send('Not found');
        if (postDoc.data().user_id !== req.user.uid) return res.status(403).send('Forbidden');

        await postRef.delete();
        res.status(200).send('Deleted');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Verify Post (Admin)
app.patch('/api/posts/:id/verify', authenticate, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        if (!userDoc.exists || !['admin', 'checker'].includes(userDoc.data().role)) {
            return res.status(403).send('Forbidden');
        }

        const postRef = db.collection('posts').doc(req.params.id);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return res.status(404).send('Post not found');

        await postRef.update({ status: 'verified' });

        // Award points for verification
        const authorId = postDoc.data().user_id;
        if (authorId) {
            await db.collection('users').doc(authorId).update({
                points: admin.firestore.FieldValue.increment(10),
                xp: admin.firestore.FieldValue.increment(10),
                verified_posts: admin.firestore.FieldValue.increment(1)
            });
        }

        res.status(200).send('Verified');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- COMMENTS ---

// Add Comment
app.post('/api/posts/:id/comments', authenticate, async (req, res) => {
    const { text } = req.body;
    try {
        await db.collection('comments').add({
            post_id: req.params.id,
            user_id: req.user.uid,
            user_name: req.user.name || 'Anonymous',
            user_photo: req.user.picture || '',
            text,
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).send('Comment added');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Comments for a Post
app.get('/api/posts/:id/comments', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('comments')
            .where('post_id', '==', req.params.id)
            .orderBy('created_at', 'asc')
            .get();
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(comments);
    } catch (err) {
        // Fallback for missing index on created_at
        if (err.message.includes('index')) {
            console.warn("Missing index for comments. Please create it in Firebase Console:", err.message);
            // Fallback: fetch and sort in memory
            try {
                const snapshot = await db.collection('comments').where('post_id', '==', req.params.id).get();
                let comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                comments.sort((a, b) => {
                    const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : 0;
                    const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : 0;
                    return tA - tB;
                });
                return res.json(comments);
            } catch (fallbackErr) {
                res.status(500).send(fallbackErr.message);
            }
        } else {
            res.status(500).send(err.message);
        }
    }
});

// --- FOLLOWS ---

// Send Follow Request
app.post('/api/follows', authenticate, async (req, res) => {
    const { targetId } = req.body;
    const followerId = req.user.uid;

    if (followerId === targetId) return res.status(400).send("Can't follow yourself");

    try {
        // Check if exists
        const existing = await db.collection('follows')
            .where('follower_id', '==', followerId)
            .where('target_id', '==', targetId)
            .get();
            
        if (!existing.empty) {
            return res.status(409).send('Request already exists');
        }

        await db.collection('follows').add({
            follower_id: followerId,
            target_id: targetId,
            status: 'pending',
            created_at: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).send({ message: 'Follow request sent' });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Pending Follow Requests (Incoming)
app.get('/api/follows/requests', authenticate, async (req, res) => {
    const uid = req.user.uid;
    try {
        const snapshot = await db.collection('follows')
            .where('target_id', '==', uid)
            .where('status', '==', 'pending')
            .orderBy('created_at', 'desc')
            .get();
            
        // We need to fetch user details for each follower
        const requests = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.follower_id).get();
            if (userDoc.exists) {
                requests.push({
                    id: doc.id,
                    follower_id: data.follower_id,
                    created_at: data.created_at,
                    follower_name: userDoc.data().name,
                    follower_photo: userDoc.data().photo_url
                });
            }
        }
        res.json(requests);
    } catch (err) {
        if (err.message.includes('index')) {
             try {
                 const snapshot = await db.collection('follows')
                    .where('target_id', '==', uid)
                    .where('status', '==', 'pending')
                    .get();
                const requests = [];
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    const userDoc = await db.collection('users').doc(data.follower_id).get();
                    if (userDoc.exists) {
                        requests.push({
                            id: doc.id,
                            follower_id: data.follower_id,
                            created_at: data.created_at,
                            follower_name: userDoc.data().name,
                            follower_photo: userDoc.data().photo_url
                        });
                    }
                }
                requests.sort((a,b) => {
                    const tA = (a.created_at && a.created_at.toMillis) ? a.created_at.toMillis() : 0;
                    const tB = (b.created_at && b.created_at.toMillis) ? b.created_at.toMillis() : 0;
                    return tB - tA;
                });
                return res.json(requests);
             } catch(fallbackErr) {
                 res.status(500).send(fallbackErr.message);
             }
        } else {
             res.status(500).send(err.message);
        }
    }
});

// Update Follow Status (Accept/Reject)
app.patch('/api/follows/:id/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const uid = req.user.uid;

    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).send('Invalid status');
    }

    try {
        const followRef = db.collection('follows').doc(id);
        const followDoc = await followRef.get();
        
        if (!followDoc.exists) return res.status(404).send('Request not found');
        const data = followDoc.data();

        if (data.target_id !== uid) return res.status(403).send('Forbidden');

        await followRef.update({ status });

        // Mutual Follow
        if (status === 'accepted') {
            const reverseCheck = await db.collection('follows')
                .where('follower_id', '==', data.target_id)
                .where('target_id', '==', data.follower_id)
                .get();
                
            if (reverseCheck.empty) {
                await db.collection('follows').add({
                    follower_id: data.target_id,
                    target_id: data.follower_id,
                    status: 'accepted',
                    created_at: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await reverseCheck.docs[0].ref.update({ status: 'accepted' });
            }
            console.log(`Mutual follow established between ${data.target_id} and ${data.follower_id}`);
        }

        res.status(200).send({ message: `Follow request ${status}` });
    } catch (err) {
        console.error("Follow status update error:", err);
        res.status(500).send(err.message);
    }
});

// Get Follow Status
app.get('/api/follows/status/:uid', authenticate, async (req, res) => {
    const targetId = req.params.uid;
    const followerId = req.user.uid;

    try {
        const snapshot = await db.collection('follows')
            .where('follower_id', '==', followerId)
            .where('target_id', '==', targetId)
            .get();
            
        if (snapshot.empty) return res.json({ status: 'none' });
        const data = snapshot.docs[0].data();
        res.json({ status: data.status, id: snapshot.docs[0].id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Social Stats (Counts)
app.get('/api/users/social-stats/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const followersCount = (await db.collection('follows').where('target_id', '==', uid).where('status', '==', 'accepted').count().get()).data().count;
        const followingCount = (await db.collection('follows').where('follower_id', '==', uid).where('status', '==', 'accepted').count().get()).data().count;
        res.json({ followers: followersCount, following: followingCount });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Followers
app.get('/api/users/followers/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const followsSnapshot = await db.collection('follows')
            .where('target_id', '==', uid)
            .where('status', '==', 'accepted')
            .get();
            
        const followerIds = followsSnapshot.docs.map(doc => doc.data().follower_id);
        const users = [];
        
        // Fetch user data
        for (const fId of followerIds) {
            const userDoc = await db.collection('users').doc(fId).get();
            if (userDoc.exists) {
                const ud = userDoc.data();
                users.push({
                    id: ud.uid,
                    name: ud.name,
                    profilePhoto: ud.photo_url,
                    points: ud.points,
                    role: ud.role,
                    bio: ud.bio
                });
            }
        }
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Following
app.get('/api/users/following/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const followsSnapshot = await db.collection('follows')
            .where('follower_id', '==', uid)
            .where('status', '==', 'accepted')
            .get();
            
        const targetIds = followsSnapshot.docs.map(doc => doc.data().target_id);
        const users = [];
        
        for (const tId of targetIds) {
            const userDoc = await db.collection('users').doc(tId).get();
            if (userDoc.exists) {
                const ud = userDoc.data();
                users.push({
                    id: ud.uid,
                    name: ud.name,
                    profilePhoto: ud.photo_url,
                    points: ud.points,
                    role: ud.role,
                    bio: ud.bio
                });
            }
        }
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- LEADERBOARD ---
app.get('/api/leaderboard/users', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('users').orderBy('points', 'desc').limit(20).get();
        const users = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: d.uid,
                name: d.name,
                profilePhoto: d.photo_url,
                points: d.points,
                role: d.role
            };
        });
        res.json(users);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/leaderboard/communities', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const communitiesMap = {};
        
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const cid = data.community_id || 'global';
            const cname = data.community_name || 'Global Earth Guardians';
            if (!communitiesMap[cid]) {
                communitiesMap[cid] = { id: cid, name: cname, leader_name: data.name, community_points: 0 };
            }
            communitiesMap[cid].community_points += (data.points || 0);
        });
        
        const sorted = Object.values(communitiesMap).sort((a,b) => b.community_points - a.community_points).slice(0, 10);
        res.json(sorted);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- STATS ---
app.get('/api/stats', authenticate, async (req, res) => {
    try {
        const totalTrees = (await db.collection('trees').count().get()).data().count;
        
        const treesSnapshot = await db.collection('trees').get();
        const speciesCount = {};
        treesSnapshot.docs.forEach(doc => {
            const sp = doc.data().species;
            if (sp) {
                speciesCount[sp] = (speciesCount[sp] || 0) + 1;
            }
        });
        
        const topSpecies = Object.keys(speciesCount)
            .map(sp => ({ species: sp, count: speciesCount[sp] }))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5);
            
        res.json({ totalTrees, topSpecies });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global Error Handler to prevent crash
app.use((err, req, res, next) => {
    console.error("CRITICAL SERVER ERROR:", err);
    res.status(500).send("A critical server error occurred.");
});
