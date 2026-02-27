import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '@/utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_key_12345';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
