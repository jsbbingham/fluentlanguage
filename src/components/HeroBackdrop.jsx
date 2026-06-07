// Pure inline-SVG kinetic backdrop for the hero — no image requests, crisp at
// any DPI. A "language bridge" motif: two sets of flowing contour lines (ES / EN)
// converging through a luminous core, over drifting mesh-gradient blobs.

export default function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Drifting mesh blobs (CSS gradient + keyframe) */}
      <div className="absolute inset-0 bg-mesh-warm animate-mesh-drift" />

      {/* Flowing contour SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="bridge-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C2613D" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#E8A23D" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="bridge-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1F6E5E" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2E8A76" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8A23D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E8A23D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Luminous convergence core */}
        <circle cx="720" cy="300" r="260" fill="url(#core)" />

        {/* Spanish-side flowing lines (warm) */}
        <g stroke="url(#bridge-a)" strokeWidth="1.5" className="animate-float">
          {[0, 26, 52, 78, 104].map((dy, i) => (
            <path
              key={`a-${i}`}
              d={`M-40 ${180 + dy} C 280 ${120 + dy}, 460 ${360 + dy}, 760 ${260 + dy} S 1180 ${200 + dy}, 1280 ${300 + dy}`}
              opacity={0.9 - i * 0.13}
            />
          ))}
        </g>

        {/* English-side flowing lines (jewel) */}
        <g stroke="url(#bridge-b)" strokeWidth="1.5">
          {[0, 24, 48, 72, 96].map((dy, i) => (
            <path
              key={`b-${i}`}
              d={`M1280 ${440 + dy} C 980 ${500 + dy}, 760 ${300 + dy}, 480 ${440 + dy} S 60 ${520 + dy}, -40 ${430 + dy}`}
              opacity={0.85 - i * 0.13}
            />
          ))}
        </g>

        {/* Fine node dots along the convergence */}
        <g fill="#C2613D">
          {[
            [720, 300],
            [640, 340],
            [800, 268],
            [700, 250],
          ].map(([cx, cy], i) => (
            <circle key={`n-${i}`} cx={cx} cy={cy} r="3" opacity="0.5" />
          ))}
        </g>
      </svg>

      {/* Bottom fade into the page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-alabaster" />
    </div>
  )
}
