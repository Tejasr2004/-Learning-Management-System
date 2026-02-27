import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import { verifyAuth } from '@/utils/auth';

export async function POST(request: Request) {
    const user = verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { videoId, lastWatchedSec, completed } = body;

        if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

        await pool.query(
            `INSERT INTO user_progress (user_id, video_id, last_watched_sec, completed) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       last_watched_sec = VALUES(last_watched_sec), 
       completed = IF(completed=1, 1, VALUES(completed))`,
            [user.userId, videoId, lastWatchedSec || 0, completed ? 1 : 0]
        );

        return NextResponse.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
