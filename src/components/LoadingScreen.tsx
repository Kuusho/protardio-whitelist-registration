'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        // Chunky progress like Windows XP
        const increment = Math.random() > 0.7 
          ? Math.floor(Math.random() * 15) + 5 
          : Math.floor(Math.random() * 8) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [onComplete]);
  
  // Calculate filled segments
  const segments = 20;
  const filledSegments = Math.floor((progress / 100) * segments);
  
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 via-sky-300 to-green-500">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/loading-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Hill with door - CSS fallback */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="relative">
          {/* Hill shape */}
          <div 
            className="w-80 h-48 sm:w-96 sm:h-56"
            style={{
              background: 'linear-gradient(180deg, #7cb342 0%, #558b2f 50%, #33691e 100%)',
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              borderRadius: '50% 50% 0 0'
            }}
          />
          {/* Door on hill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-28 sm:w-20 sm:h-32 bg-white border-4 border-gray-300 shadow-lg">
            <div className="absolute inset-1 bg-gradient-to-br from-yellow-100 via-amber-200 to-yellow-300 opacity-80" />
            <div className="absolute right-2 top-1/2 w-2 h-2 rounded-full bg-yellow-600" />
          </div>
        </div>
      </div>
      
      {/* XP-style loading bar */}
      <div className="pb-20 sm:pb-24 relative z-10">
        <div 
          className="w-64 sm:w-80 h-6 bg-gray-200 border-2 border-gray-400 flex items-center px-0.5" 
          style={{ borderStyle: 'inset' }}
        >
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={i}
              className={`
                h-4 w-3 mx-px transition-all duration-75
                ${i < filledSegments ? 'bg-[#0a246a]' : 'bg-transparent'}
              `}
            />
          ))}
        </div>
        <p className="text-center text-gray-600 font-mono text-xs mt-2">
          {progress < 100 ? 'Loading Protardio...' : 'Ready'}
        </p>
      </div>
    </div>
  );
}
