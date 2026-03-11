const express = require('express');
const cors = require('cors');
const pool = require('./db');
const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Initialize Firebase Admin (requires service account key)
// For now, we'll try to initialize from default credentials or error gracefully
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });
    console.log("Firebase Admin initialized");
} catch (e) {
    console.warn("Firebase Admin failed to initialize with applicationDefault. Auth verification might fail until a service account is provided.");
}

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

// --- FILE UPLOAD (Local Storage) ---
const multer = require('multer');


// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unique filename: fieldname-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed!'));
    }
});

// Serve 'uploads' folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload Endpoint
app.post('/api/upload', authenticate, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        // Return full URL to the file
        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const host = req.get('host');
        const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        res.json({ url: fullUrl });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).send(err.message);
    }
});

// --- USERS ---

// Sync/Create User
app.post('/api/users', authenticate, async (req, res) => {
    const { name, email, photoURL, communityId, communityName } = req.body;
    const uid = req.user.uid;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE uid = ?', [uid]);
        if (rows.length === 0) {
            // Check if name is already taken by another user
            const [nameCheck] = await pool.execute('SELECT uid FROM users WHERE name = ?', [name]);

            let finalName = name;
            if (nameCheck.length > 0) {
                // If name taken, append random 4-digit suffix
                const suffix = Math.floor(1000 + Math.random() * 9000);
                finalName = `${name} #${suffix}`;
                console.log(`Username '${name}' taken. Auto-assigning: '${finalName}'`);
            }

            await pool.execute(
                'INSERT INTO users (uid, name, email, photo_url, community_id, community_name) VALUES (?, ?, ?, ?, ?, ?)',
                [uid, finalName, email, photoURL, communityId || 'global', communityName || 'Global Earth Guardians']
            );
        } else {
            // Update existing user community if they were 'global' and now have a specific city
            // or just refresh their community info if it's different
            if (communityId && communityId !== rows[0].community_id) {
                await pool.execute(
                    'UPDATE users SET community_id = ?, community_name = ? WHERE uid = ?',
                    [communityId, communityName, uid]
                );
            }
        }

        // Ensure community record exists (including global)
        const targetId = communityId || rows[0]?.community_id || 'global';
        const targetName = communityName || rows[0]?.community_name || 'Global Earth Guardians';

        const [commRows] = await pool.execute('SELECT id FROM communities WHERE id = ?', [targetId]);
        if (commRows.length === 0) {
            await pool.execute(
                'INSERT INTO communities (id, name, community_points) VALUES (?, ?, ?)',
                [targetId, targetName, 0]
            );
        }
        res.status(200).send('User synced');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Username already taken.');
        }
        console.error("User Sync Error:", err);
        res.status(500).send(err.message);
    }
});

// Get User Profile
app.get('/api/users/profile', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT u.*,
                (SELECT CAST(COUNT(*) AS SIGNED) FROM follows f WHERE f.target_id = u.uid AND f.status = 'accepted') as follower_count,
                (SELECT CAST(COUNT(*) AS SIGNED) FROM follows f WHERE f.follower_id = u.uid AND f.status = 'accepted') as following_count
            FROM users u WHERE u.uid = ?
        `, [req.user.uid]);
        if (rows.length === 0) return res.status(404).send('User not found');
        console.log(`[PROFILE] Sending stats for ${rows[0].name}: Followers: ${rows[0].follower_count}, Following: ${rows[0].following_count}`);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update User Profile Photo
app.put('/api/users/profile/photo', authenticate, async (req, res) => {
    const { photoUrl } = req.body;
    try {
        await pool.execute('UPDATE users SET photo_url = ? WHERE uid = ?', [photoUrl, req.user.uid]);
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
        // Use COALESCE or simple OR to handle potentially missing bio
        await pool.execute('UPDATE users SET name = ?, bio = ? WHERE uid = ?', [name, bio || null, uid]);

        // Also update posts and comments
        await pool.execute('UPDATE posts SET user_name = ? WHERE user_id = ?', [name, uid]);
        await pool.execute('UPDATE comments SET user_name = ? WHERE user_id = ?', [name, uid]);

        console.log(`Profile Update Success for ${uid}`);
        res.status(200).send('Profile updated');
    } catch (err) {
        console.error("Profile Save Error:", err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Username already taken.');
        }
        res.status(500).send(err.message);
    }
});

// Get Public Profile (Any User)
app.get('/api/users/:uid', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT u.uid, u.name, u.bio, u.photo_url, u.points, u.level, u.xp, u.trees_planted, u.verified_posts, u.role, u.community_name, u.is_community_leader, u.created_at,
                (SELECT CAST(COUNT(*) AS SIGNED) FROM follows f WHERE f.target_id = u.uid AND f.status = 'accepted') as follower_count,
                (SELECT CAST(COUNT(*) AS SIGNED) FROM follows f WHERE f.follower_id = u.uid AND f.status = 'accepted') as following_count
             FROM users u WHERE u.uid = ?`,
            [req.params.uid]
        );
        if (rows.length === 0) return res.status(404).send('User not found');
        console.log(`[PUBLIC_PROFILE] Sending stats for ${rows[0].name}: Followers: ${rows[0].follower_count}, Following: ${rows[0].following_count}`);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- TREES ---

// Register Tree
app.post('/api/trees', authenticate, async (req, res) => {
    const { species, plantedDate, location, treeTag } = req.body;
    try {
        await pool.execute(
            'INSERT INTO trees (tree_tag, species, planted_date, location, caretaker_id) VALUES (?, ?, ?, ?, ?)',
            [treeTag, species, plantedDate, location, req.user.uid]
        );
        // Increment tree count
        await pool.execute('UPDATE users SET trees_planted = trees_planted + 1, points = points + 20, xp = xp + 20 WHERE uid = ?', [req.user.uid]);
        res.status(201).send({ message: 'Tree registered' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('You have already registered a tree with this ID.');
        }
        res.status(500).send(err.message);
    }
});

// Get My Trees
app.get('/api/trees', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM trees WHERE caretaker_id = ?', [req.user.uid]);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Single Tree
app.get('/api/trees/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM trees WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Tree not found');
        res.json(rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- POSTS ---

// Create Post
app.post('/api/posts', authenticate, async (req, res) => {
    const { caption, imageUrl, hasImage, treeId, communityId, locationLat, locationLng, aiSpecies, isAiVerified } = req.body;
    try {
        await pool.execute(
            'INSERT INTO posts (user_id, user_name, user_photo, tree_id, caption, image_url, has_image, community_id, location_lat, location_lng, ai_species, is_ai_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.uid, req.user.name || 'Anonymous', req.user.picture || '', treeId, caption, imageUrl, hasImage, communityId, locationLat, locationLng, aiSpecies || null, isAiVerified || false]
        );
        // Increment points
        await pool.execute('UPDATE users SET points = points + 5, xp = xp + 5 WHERE uid = ?', [req.user.uid]);
        res.status(201).send({ message: 'Post created' });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Get Feed / Posts by Tree, Community, or User
app.get('/api/posts', authenticate, async (req, res) => {
    const { treeId, communityId, userId } = req.query;
    try {
        let sql = 'SELECT * FROM posts';
        let params = [];
        let whereClauses = [];

        if (treeId) {
            whereClauses.push('tree_id = ?');
            params.push(treeId);
        }
        if (communityId) {
            whereClauses.push('community_id = ?');
            params.push(communityId);
        }
        if (userId) {
            whereClauses.push('user_id = ?');
            params.push(userId);
        }

        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        sql += ' ORDER BY created_at DESC LIMIT 50';
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Like Post
app.post('/api/posts/:id/like', authenticate, async (req, res) => {
    try {
        // Simple increment for MVP (no per-user check in DB for now to keep it simple, but usually needed)
        await pool.execute('UPDATE posts SET upvotes_count = upvotes_count + 1 WHERE id = ?', [req.params.id]);

        // Award point to author
        const [posts] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
        if (posts.length > 0) {
            await pool.execute('UPDATE users SET points = points + 1, xp = xp + 1 WHERE uid = ?', [posts[0].user_id]);
        }

        res.status(200).send('Liked');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete Post
app.delete('/api/posts/:id', authenticate, async (req, res) => {
    try {
        // Check ownership
        const [posts] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
        if (posts.length === 0) return res.status(404).send('Not found');
        if (posts[0].user_id !== req.user.uid) return res.status(403).send('Forbidden');

        await pool.execute('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.status(200).send('Deleted');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Verify Post (Admin)
app.patch('/api/posts/:id/verify', authenticate, async (req, res) => {
    try {
        // Simple role check
        const [users] = await pool.execute('SELECT role FROM users WHERE uid = ?', [req.user.uid]);
        if (users.length === 0 || !['admin', 'checker'].includes(users[0].role)) {
            return res.status(403).send('Forbidden');
        }

        await pool.execute("UPDATE posts SET status = 'verified' WHERE id = ?", [req.params.id]);

        // Award points for verification
        const [posts] = await pool.execute('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
        if (posts.length > 0) {
            await pool.execute('UPDATE users SET points = points + 10, xp = xp + 10, verified_posts = verified_posts + 1 WHERE uid = ?', [posts[0].user_id]);
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
        await pool.execute(
            'INSERT INTO comments (post_id, user_id, user_name, user_photo, text) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, req.user.uid, req.user.name || 'Anonymous', req.user.picture || '', text]
        );
        res.status(201).send('Comment added');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Comments for a Post
app.get('/api/posts/:id/comments', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- FOLLOWS ---

// Send Follow Request
app.post('/api/follows', authenticate, async (req, res) => {
    const { targetId } = req.body;
    const followerId = req.user.uid;

    if (followerId === targetId) return res.status(400).send("Can't follow yourself");

    try {
        await pool.execute(
            'INSERT INTO follows (follower_id, target_id, status) VALUES (?, ?, ?)',
            [followerId, targetId, 'pending']
        );
        res.status(201).send({ message: 'Follow request sent' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('Request already exists');
        }
        res.status(500).send(err.message);
    }
});

// Get Pending Follow Requests (Incoming)
app.get('/api/follows/requests', authenticate, async (req, res) => {
    const uid = req.user.uid;
    try {
        const [rows] = await pool.execute(`
            SELECT f.id, f.follower_id, f.created_at, u.name as follower_name, u.photo_url as follower_photo
            FROM follows f
            JOIN users u ON f.follower_id = u.uid
            WHERE f.target_id = ? AND f.status = 'pending'
            ORDER BY f.created_at DESC
        `, [uid]);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
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
        // Ensure the person updating is the target of the follow request
        const [check] = await pool.execute('SELECT follower_id, target_id FROM follows WHERE id = ?', [id]);
        if (check.length === 0) return res.status(404).send('Request not found');
        const { follower_id, target_id } = check[0];

        if (target_id !== uid) return res.status(403).send('Forbidden');

        // Update the current request
        await pool.execute('UPDATE follows SET status = ? WHERE id = ?', [status, id]);

        // If accepted, also make the reverse follow relationship 'accepted' (Mutual Follow)
        if (status === 'accepted') {
            await pool.execute(`
                INSERT INTO follows (follower_id, target_id, status) 
                VALUES (?, ?, 'accepted')
                ON DUPLICATE KEY UPDATE status = 'accepted'
            `, [target_id, follower_id]);
            console.log(`Mutual follow established between ${target_id} and ${follower_id}`);
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
        const [rows] = await pool.execute(
            'SELECT * FROM follows WHERE follower_id = ? AND target_id = ?',
            [followerId, targetId]
        );
        if (rows.length === 0) return res.json({ status: 'none' });
        res.json({ status: rows[0].status, id: rows[0].id });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Social Stats (Counts)
app.get('/api/users/social-stats/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const [followers] = await pool.execute('SELECT COUNT(*) as count FROM follows WHERE target_id = ? AND status = "accepted"', [uid]);
        const [following] = await pool.execute('SELECT COUNT(*) as count FROM follows WHERE follower_id = ? AND status = "accepted"', [uid]);
        res.json({ followers: followers[0].count, following: following[0].count });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Followers
app.get('/api/users/followers/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const [rows] = await pool.execute(`
            SELECT u.uid as id, u.name, u.photo_url as profilePhoto, u.points, u.role, u.bio
            FROM follows f
            JOIN users u ON f.follower_id = u.uid
            WHERE f.target_id = ? AND f.status = 'accepted'
        `, [uid]);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get Following
app.get('/api/users/following/:uid', authenticate, async (req, res) => {
    try {
        const uid = req.params.uid;
        const [rows] = await pool.execute(`
            SELECT u.uid as id, u.name, u.photo_url as profilePhoto, u.points, u.role, u.bio
            FROM follows f
            JOIN users u ON f.target_id = u.uid
            WHERE f.follower_id = ? AND f.status = 'accepted'
        `, [uid]);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- LEADERBOARD ---
app.get('/api/leaderboard/users', authenticate, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT uid as id, name, photo_url as profilePhoto, points, role FROM users ORDER BY points DESC LIMIT 20');
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/leaderboard/communities', authenticate, async (req, res) => {
    try {
        // We group by both ID and Name from the users table to handle teams even if the 'communities' table is sparse
        const [rows] = await pool.execute(`
            SELECT 
                community_id as id, 
                community_name as name, 
                MAX(name) as leader_name, -- Placeholder for leader
                SUM(points) as community_points 
            FROM users 
            GROUP BY community_id, community_name
            ORDER BY community_points DESC 
            LIMIT 10
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- STATS ---
app.get('/api/stats', authenticate, async (req, res) => {
    try {
        const [[{ count }]] = await pool.execute('SELECT COUNT(*) as count FROM trees');
        const [species] = await pool.execute('SELECT species, COUNT(*) as count FROM trees GROUP BY species ORDER BY count DESC LIMIT 5');
        res.json({ totalTrees: count || 0, topSpecies: species });
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
