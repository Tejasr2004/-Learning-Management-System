'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Basic auth check
        const storedUser = localStorage.getItem('lms_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        setUser(null);
        router.push('/login');
    };

    return (
        <nav className="fixed w-full z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-primary-600/20 rounded-lg group-hover:bg-primary-600/30 transition-colors">
                            <BookOpen className="w-6 h-6 text-primary-500" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">NextLMS</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium">{user.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary-500/20"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
