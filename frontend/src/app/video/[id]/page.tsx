'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import Link from 'next/link';
import api from '@/utils/api';
import { ArrowLeft, CheckCircle2, Loader2, PlayCircle, Trophy } from 'lucide-react';

interface VideoDetail {
    id: number;
    title: string;
    youtube_id: string;
    section_id: number;
    course_id: number; // added to fetch context if we modify backend, but currently we just play
}

// Global context might be needed for full flow, but we can do a localized flow:
// Fetch all videos for this course to find "Next Video"
export default function VideoPlayerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [video, setVideo] = useState<any>(null);
    const [nextVideoId, setNextVideoId] = useState<number | null>(null);
    const [progress, setProgress] = useState({ lastWatched: 0, completed: false });
    const [isLoading, setIsLoading] = useState(true);
    const [player, setPlayer] = useState<YouTubePlayer | null>(null);

    // Use a ref to save progress interval
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // We need the video details. But our backend route `courses/:id` gives nested.
        // Let's create a quick way or assume we get course via fetching all courses and filtering.
        // For a robust app, we'd add `GET /api/videos/:id` to backend, but since I only created `/courses/:id`,
        // let's fetch all courses and finding the video in the frontend. It's safe since it's an LMS demo.
        const loadData = async () => {
            try {
                const userStr = localStorage.getItem('lms_user');
                if (!userStr) {
                    router.push('/login');
                    return;
                }

                const [coursesRes, progressRes] = await Promise.all([
                    api.get('/courses'),
                    api.get(`/progress/${id}`).catch(() => ({ data: { last_watched_sec: 0, completed: false } })) // graceful fail
                ]);

                let foundVideo = null;
                let foundNextId = null;
                let lastV = null;
                let isNext = false;

                // Very brute force search for demo purposes
                for (const c of coursesRes.data) {
                    try {
                        const detailRes = await api.get(`/courses/${c.id}`);
                        const sections = detailRes.data.sections;
                        for (const s of sections) {
                            for (const v of s.videos) {
                                if (isNext) {
                                    foundNextId = v.id;
                                    isNext = false;
                                }
                                if (v.id.toString() === id) {
                                    foundVideo = v;
                                    foundVideo.course_id = c.id;
                                    isNext = true; // next loop will capture the next video id
                                }
                            }
                        }
                    } catch (e) { }
                    if (foundVideo && !isNext) break; // if we found it and we got the next, stop
                }

                if (foundVideo) {
                    setVideo(foundVideo);
                    setNextVideoId(foundNextId);
                    setProgress({
                        lastWatched: progressRes.data.last_watched_sec || 0,
                        completed: progressRes.data.completed || false
                    });
                } else {
                    router.push('/');
                }
            } catch (err) {
                console.error('Error loading video wrapper:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id, router]);

    // Handle saving progress to DB
    const saveProgressToDb = async (currentTime: number, isCompleted: boolean) => {
        try {
            await api.post('/progress', {
                videoId: parseInt(id as string),
                lastWatchedSec: Math.floor(currentTime),
                completed: isCompleted
            });
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    };

    const onPlayerReady = (event: YouTubeEvent) => {
        setPlayer(event.target);
        // Seek to last watched
        if (progress.lastWatched > 0 && !progress.completed) {
            event.target.seekTo(progress.lastWatched, true);
        }
    };

    const onPlayerStateChange = (event: YouTubeEvent) => {
        // YT.PlayerState.PLAYING == 1
        if (event.data === 1) {
            // Start tracking interval
            timerRef.current = setInterval(async () => {
                const currentTime = await event.target.getCurrentTime();
                saveProgressToDb(currentTime, progress.completed);
            }, 5000) as NodeJS.Timeout; // save every 5 seconds
        } else {
            // Pause or End
            if (timerRef.current) clearInterval(timerRef.current);
        }

        // YT.PlayerState.ENDED == 0
        if (event.data === 0) {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setProgress(prev => ({ ...prev, completed: true }));
        await saveProgressToDb(video?.duration || 0, true);

        // Auto load next if exists
        if (nextVideoId) {
            setTimeout(() => {
                router.push(`/video/${nextVideoId}`);
            }, 3000); // 3 sec delay before auto load next
        }
    };

    const handleMarkComplete = () => {
        handleComplete();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!video) return null;

    return (
        <div className="min-h-screen bg-[#0f172a]">
            {/* Top Bar */}
            <div className="bg-[#1e293b]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link
                        href={`/course/${video.course_id}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Course
                    </Link>

                    <div className="flex items-center gap-3">
                        {progress.completed ? (
                            <span className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-sm font-medium border border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                <CheckCircle2 className="w-4 h-4" /> Completed
                            </span>
                        ) : (
                            <button
                                onClick={handleMarkComplete}
                                className="flex items-center gap-1.5 text-gray-300 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-3 py-1.5 rounded-full text-sm transition-all"
                            >
                                Mark as Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        {/* Video Player */}
                        <div className="rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 aspect-video relative">
                            <YouTube
                                videoId={video.youtube_id}
                                opts={{
                                    width: '100%',
                                    height: '100%',
                                    playerVars: {
                                        autoplay: 1,
                                        modestbranding: 1,
                                        rel: 0,
                                    }
                                }}
                                onReady={onPlayerReady}
                                onStateChange={onPlayerStateChange}
                                className="absolute top-0 left-0 w-full h-full"
                            />
                        </div>

                        {/* Video Details */}
                        <div className="bg-[#1e293b] p-6 rounded-2xl border border-white/5">
                            <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
                        </div>

                        {/* Auto Next Notify */}
                        {progress.completed && nextVideoId && (
                            <div className="bg-primary-900/40 border border-primary-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 shrink-0">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Great job! You finished this.</h3>
                                        <p className="text-primary-300 text-sm">Autoplaying next video in a moment...</p>
                                    </div>
                                </div>
                                <Link
                                    href={`/video/${nextVideoId}`}
                                    className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto text-center shadow-lg hover:shadow-primary-500/25 whitespace-nowrap"
                                >
                                    Play Next Now
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-[#1e293b] rounded-2xl border border-white/5 p-6 sticky top-24">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-primary-500" />
                                Up Next
                            </h3>

                            {nextVideoId ? (
                                <div className="space-y-4">
                                    <p className="text-gray-400 text-sm mb-4">You have pending videos remaining in this course path to learn from.</p>
                                    <Link href={`/video/${nextVideoId}`}>
                                        <div className="group border border-white/10 hover:border-primary-500/50 rounded-xl p-4 transition-all hover:bg-white/5 cursor-pointer relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-2 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <h4 className="text-white font-medium mb-1 group-hover:text-primary-400 transition-colors">Continue Learning</h4>
                                            <p className="text-xs text-gray-500">Go to the next segment</p>
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                        <Trophy className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h4 className="text-white font-medium mb-1">Course Completed!</h4>
                                    <p className="text-sm text-gray-400">You have no more videos ahead.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
