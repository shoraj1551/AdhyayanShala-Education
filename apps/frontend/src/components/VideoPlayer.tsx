"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    onEnded?: () => void;
}

export function VideoPlayer({ src, poster, onEnded }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Auto-hide controls after 3s of inactivity
    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        } else {
            setShowControls(true);
        }
        return () => clearTimeout(timeout);
    }, [isPlaying, showControls]);

    const handleMouseMove = () => {
        setShowControls(true);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (value: number[]) => {
        const seekPercentage = value[0];
        if (videoRef.current) {
            const newTime = (videoRef.current.duration * seekPercentage) / 100;
            videoRef.current.currentTime = newTime;
            setProgress(seekPercentage);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0];
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            if (newVolume === 0) setIsMuted(true);
            else setIsMuted(false);
        }
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const formatTime = (timeInSeconds: number) => {
        const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
        return result.startsWith("00:") ? result.substr(3) : result;
    };

    return (
        <div
            ref={containerRef}
            className="group relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center font-sans"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                    if (onEnded) onEnded();
                }}
            />

            {/* Play overlay for when paused */}
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity duration-300 pointer-events-none"
                >
                    <div className="bg-primary/90 text-primary-foreground rounded-full p-4 transform scale-100 transition-transform group-hover:scale-110 shadow-lg">
                        <Play className="h-8 w-8 ml-1" />
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Timeline */}
                <div className="flex items-center mb-4 gap-4 px-2">
                    <span className="text-white text-xs font-medium min-w-[40px]">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progress}
                        onChange={(e) => handleSeek([Number(e.target.value)])}
                        className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-white text-xs font-medium min-w-[40px]">{formatTime(duration)}</span>
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors focus:outline-none">
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </button>

                        <div className="flex items-center gap-2 group/volume relative">
                            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors focus:outline-none">
                                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>
                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 flex items-center h-full">
                                <div className="w-20 pl-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => handleVolumeChange([Number(e.target.value)])}
                                        className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleFullScreen} className="text-white hover:text-primary transition-colors focus:outline-none">
                            <Maximize className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
