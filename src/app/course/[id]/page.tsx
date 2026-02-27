'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { PlayCircle, Clock, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

interface Video {
    id: number;
    title: string;
    duration: number;
}

interface Section {
    id: number;
    title: string;
    videos: Video[];
}

interface Course {
    id: number;
    name: string;
    description: string;
    thumbnail_url: string;
    sections: Section[];
}

export default function CoursePage() {
    const { id } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${id}`);
                setCourse(res.data);
            } catch (err: any) {
                console.error('Failed to load course details', err);
                if (err.response?.status === 404) router.push('/');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchCourse();
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] pt-20 px-4">
                <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                    <div className="h-64 bg-[#1e293b] rounded-2xl" />
                    <div className="h-20 bg-[#1e293b] rounded-xl" />
                    <div className="h-40 bg-[#1e293b] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 relative">
            <div className="absolute top-0 w-full h-96 bg-primary-900/20 blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link href="/" className="hover:text-white transition-colors">Courses</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">{course.name}</span>
                </div>

                {/* Hero Section */}
                <div className="bg-[#1e293b] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-12">
                    <div className="aspect-video sm:h-[400px] w-full relative">
                        <img
                            src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'}
                            alt={course.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8 w-full">
                            <span className="bg-primary-500/20 text-primary-400 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 inline-block">
                                Learning Path
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
                                {course.name}
                            </h1>
                            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
                                {course.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Curriculum Sections */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="text-primary-500 w-6 h-6" />
                        Course Curriculum
                    </h2>

                    <div className="space-y-6">
                        {course.sections.map((section, idx) => (
                            <div key={section.id} className="bg-[#1e293b] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10">
                                <div className="bg-white/[0.02] px-6 py-4 flex items-center justify-between border-b border-white/5">
                                    <h3 className="font-semibold text-lg text-white flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 text-sm">
                                            {idx + 1}
                                        </span>
                                        {section.title}
                                    </h3>
                                    <span className="text-sm text-gray-500 font-medium">
                                        {section.videos.length} videos
                                    </span>
                                </div>

                                <div className="divide-y divide-white/5 bg-[#0f172a]/30">
                                    {section.videos.map((video, vIdx) => (
                                        <Link
                                            key={video.id}
                                            href={`/video/${video.id}`}
                                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-white/5 transition-colors gap-4"
                                        >
                                            <div className="flex items-start sm:items-center gap-4">
                                                <div className="mt-1 sm:mt-0 w-8 flex justify-center">
                                                    <PlayCircle className="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-300 group-hover:text-white transition-colors font-medium">
                                                        {idx + 1}.{vIdx + 1} {video.title}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 pl-12 sm:pl-0">
                                                <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-black/20 px-2 py-1 rounded">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    {section.videos.length === 0 && (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            No contents in this section yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {course.sections.length === 0 && (
                            <div className="text-center py-12 bg-[#1e293b] rounded-2xl border border-white/5">
                                <p className="text-gray-400">Chapters are being prepared. Check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
