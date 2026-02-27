import { NextResponse } from 'next/server';
import pool from '@/utils/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ videoId: string }> }
) {
    const { videoId } = await params;
    const user = verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const [progress]: any = await pool.query(
            'SELECT last_watched_sec, completed FROM user_progress WHERE user_id = ? AND video_id = ?',
            [user.userId, videoId]
        );

        if (progress.length === 0) {
            return NextResponse.json({ last_watched_sec: 0, completed: false });
        }

        const record = progress[0];
        return NextResponse.json({
            last_watched_sec: record.last_watched_sec,
            completed: !!record.completed
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
