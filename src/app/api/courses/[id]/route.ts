import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: subjectId } = await params;

    try {
        // 1. Get Subject details
        const [subjects]: any = await pool.query('SELECT id, name, description, thumbnail_url FROM subjects WHERE id = ?', [subjectId]);
        if (subjects.length === 0) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        const subject = subjects[0];

        // 2. Get Sections for this subject
        const [sections]: any = await pool.query('SELECT id, title, order_index FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);

        // 3. For each section, get its videos
        for (let section of sections) {
            const [videos] = await pool.query('SELECT id, title, video_url, youtube_id, duration, order_index FROM videos WHERE section_id = ? ORDER BY order_index ASC', [section.id]);
            section.videos = videos;
        }

        subject.sections = sections;
        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error fetching course details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
