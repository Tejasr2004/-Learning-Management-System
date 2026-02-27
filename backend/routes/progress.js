const express = require('express');
const pool = require('../db');
const jwt = require('jwt-simple');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_key_12345';

// Middleware to protect progress routes and extract user ID
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.decode(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Apply auth middleware to all progress endpoints
router.use(requireAuth);

// Get progress for a specific video
router.get('/:videoId', async (req, res) => {
    try {
        const [progress] = await pool.query(
            'SELECT last_watched_sec, completed FROM user_progress WHERE user_id = ? AND video_id = ?',
            [req.userId, req.params.videoId]
        );

        if (progress.length === 0) {
            return res.json({ last_watched_sec: 0, completed: false });
        }

        // Ensure we send booleans
        const record = progress[0];
        res.json({
            last_watched_sec: record.last_watched_sec,
            completed: !!record.completed
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upsert progress
router.post('/', async (req, res) => {
    const { videoId, lastWatchedSec, completed } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId is required' });

    try {
        // Basic upsert query
        await pool.query(
            `INSERT INTO user_progress (user_id, video_id, last_watched_sec, completed) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       last_watched_sec = VALUES(last_watched_sec), 
       completed = IF(completed=1, 1, VALUES(completed))`, // Once completed=true, it stays true
            [req.userId, videoId, lastWatchedSec || 0, completed ? 1 : 0]
        );

        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
