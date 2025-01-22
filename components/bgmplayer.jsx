"use client"
import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <audio
        ref={audioRef}
        src="/bgm.mp3"
        loop
      />
      <button
        onClick={togglePlay}
        className="bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-gray-800" />
        ) : (
          <Play className="w-6 h-6 text-gray-800" />
        )}
      </button>
    </div>
  );
};

export default AudioPlayer;