'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { PlayCircle, Clock, BookOpen, ArrowRight } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail_url: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Master New Skills with <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 via-primary-400 to-purple-400 bg-clip-text text-transparent">
              Premium Learning
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Join thousands of learners achieving their goals with our expert-led courses, engaging video paths, and seamless tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="#courses" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25 flex items-center gap-2">
              Explore Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-primary-500 w-8 h-8" />
            Available Paths
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#1e293b] rounded-2xl h-80 border border-white/5" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-white/5">
            <p className="text-gray-400 text-lg">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="group">
                <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-white/5 hover:border-primary-500/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
                  <div className="aspect-video relative overflow-hidden bg-gray-800">
                    <img
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80'}
                      alt={course.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <PlayCircle className="w-3 h-3 text-primary-400" /> Videos
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-6">
                      {course.description}
                    </p>
                    <div className="flex items-center text-primary-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Start Learning <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
