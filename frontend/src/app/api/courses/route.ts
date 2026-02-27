import { NextResponse } from 'next/server';
import pool from '@/utils/db';

export async function GET() {
    try {
        const [subjects] = await pool.query('SELECT id, name, description, thumbnail_url, created_at FROM subjects');
        return NextResponse.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
