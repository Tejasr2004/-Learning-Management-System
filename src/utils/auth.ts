import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_lms_key_12345';

export function verifyAuth(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
        return decoded;
    } catch (err) {
        return null;
    }
}
