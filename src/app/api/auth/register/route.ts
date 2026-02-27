import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_key_12345';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [result]: any = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        return NextResponse.json({ message: 'User registered successfully', userId: result.insertId }, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
