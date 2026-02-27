'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { BookOpen, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await api.post('/auth/register', { username, email, password });
            // Redirect to login after successful register
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="z-10 w-full max-w-md bg-[#1e293b] p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                        <BookOpen className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Create Account</h1>
                    <p className="text-gray-400 mt-2">Join us to start your learning journey</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-600"
                            placeholder="johndoe"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-600"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-gray-600"
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-gray-400 mt-6 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
