const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all subjects (courses)
router.get('/', async (req, res) => {
    try {
        const [subjects] = await pool.query('SELECT id, name, description, thumbnail_url, created_at FROM subjects');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get detailed course (subject) info including sections and videos
router.get('/:id', async (req, res) => {
    const subjectId = req.params.id;
    try {
        // 1. Get Subject details
        const [subjects] = await pool.query('SELECT id, name, description, thumbnail_url FROM subjects WHERE id = ?', [subjectId]);
        if (subjects.length === 0) return res.status(404).json({ error: 'Course not found' });
        const subject = subjects[0];

        // 2. Get Sections for this subject
        const [sections] = await pool.query('SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);

        // 3. For each section, get its videos
        for (let section of sections) {
            const [videos] = await pool.query('SELECT id, title, video_url, youtube_id, duration, order_index FROM videos WHERE section_id = ? ORDER BY order_index ASC', [section.id]);
            section.videos = videos;
        }

        subject.sections = sections;
        res.json(subject);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
