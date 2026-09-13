import React from 'react';

interface ArcReactorProps {
  size?: number;
  className?: string;
  pulsing?: boolean;
}

export const JarvisArcReactor: React.FC<ArcReactorProps> = ({
  size = 40,
  className = '',
  pulsing = true,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Cyan Glow Blur */}
      <div
        className={`absolute inset-0 rounded-full bg-cyan-500/25 blur-md ${
          pulsing ? 'animate-pulse' : ''
        }`}
      />

      {/* SVG Concentric Reactor */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
      >
        <defs>
          <radialGradient id="reactorOuter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
          </radialGradient>
          <radialGradient id="reactorCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="80%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Outer Background Circle */}
        <circle cx="50" cy="50" r="46" fill="#040914" stroke="#0ea5e9" strokeWidth="2.5" strokeOpacity="0.6" />

        {/* Outer segmented tick ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeOpacity="0.8"
          className={pulsing ? 'origin-center animate-[spin_18s_linear_infinite]' : ''}
        />

        {/* Middle Glowing Ring */}
        <circle
          cx="50"
          cy="50"
          r="33"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="4"
          className="drop-shadow-[0_0_8px_rgba(56,189,248,0.9)]"
        />

        {/* Inner Dark Rim */}
        <circle cx="50" cy="50" r="25" fill="#030712" stroke="#0284c7" strokeWidth="1.5" />

        {/* Inner Glowing Core Pupil */}
        <circle
          cx="50"
          cy="50"
          r="16"
          fill="url(#reactorCore)"
          className="drop-shadow-[0_0_10px_rgba(224,242,254,1)]"
        />

        {/* Bright Center Specular Flare */}
        <circle cx="46" cy="46" r="4.5" fill="#ffffff" fillOpacity="0.9" />
      </svg>
    </div>
  );
};
