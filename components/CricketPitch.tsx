export default function CricketPitch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="outfield" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#166534" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#14532d" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#052e16" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="infield" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#15803d" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#166534" stopOpacity="0.5" />
        </radialGradient>
        <radialGradient id="pitchGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4a96a" />
          <stop offset="100%" stopColor="#a87c45" />
        </radialGradient>
        {/* Mowing stripe pattern */}
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="18" height="18" patternTransform="rotate(45)">
          <rect width="9" height="18" fill="rgba(255,255,255,0.025)" />
        </pattern>
      </defs>

      {/* Outer boundary oval */}
      <ellipse cx="200" cy="200" rx="196" ry="196" fill="url(#outfield)" />
      <ellipse cx="200" cy="200" rx="196" ry="196" fill="url(#stripes)" />

      {/* Boundary rope */}
      <ellipse cx="200" cy="200" rx="190" ry="190" stroke="white" strokeWidth="2" strokeOpacity="0.25" strokeDasharray="6 5" fill="none" />

      {/* Mowing stripes — alternating dark/light rings for realism */}
      <ellipse cx="200" cy="200" rx="170" ry="170" stroke="rgba(255,255,255,0.04)" strokeWidth="16" fill="none" />
      <ellipse cx="200" cy="200" rx="138" ry="138" stroke="rgba(255,255,255,0.04)" strokeWidth="16" fill="none" />
      <ellipse cx="200" cy="200" rx="106" ry="106" stroke="rgba(255,255,255,0.04)" strokeWidth="16" fill="none" />

      {/* 30-yard circle */}
      <ellipse cx="200" cy="200" rx="90" ry="90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />

      {/* Inner circle / infield */}
      <ellipse cx="200" cy="200" rx="80" ry="80" fill="url(#infield)" />

      {/* Pitch rectangle */}
      <rect x="182" y="110" width="36" height="180" rx="3" fill="url(#pitchGrad)" />

      {/* Pitch wear marks / dark centre */}
      <ellipse cx="200" cy="200" rx="6" ry="30" fill="rgba(100,60,10,0.3)" />

      {/* Bowling crease — top end */}
      <line x1="174" y1="135" x2="226" y2="135" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Popping crease — top */}
      <line x1="170" y1="148" x2="230" y2="148" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* Return crease — top left */}
      <line x1="182" y1="135" x2="182" y2="155" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      {/* Return crease — top right */}
      <line x1="218" y1="135" x2="218" y2="155" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />

      {/* Stumps — top end */}
      <line x1="195" y1="130" x2="195" y2="140" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="200" y1="130" x2="200" y2="140" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="205" y1="130" x2="205" y2="140" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      {/* Bails — top */}
      <line x1="194" y1="131" x2="206" y2="131" stroke="white" strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Bowling crease — bottom end */}
      <line x1="174" y1="265" x2="226" y2="265" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      {/* Popping crease — bottom */}
      <line x1="170" y1="252" x2="230" y2="252" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" />
      {/* Return crease — bottom left */}
      <line x1="182" y1="245" x2="182" y2="265" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />
      {/* Return crease — bottom right */}
      <line x1="218" y1="245" x2="218" y2="265" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" />

      {/* Stumps — bottom end */}
      <line x1="195" y1="260" x2="195" y2="270" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="200" y1="260" x2="200" y2="270" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="205" y1="260" x2="205" y2="270" stroke="white" strokeWidth="2" strokeOpacity="0.9" />
      {/* Bails — bottom */}
      <line x1="194" y1="269" x2="206" y2="269" stroke="white" strokeWidth="1.2" strokeOpacity="0.8" />

      {/* Cricket ball on pitch */}
      <circle cx="200" cy="185" r="6" fill="#dc2626" />
      <circle cx="200" cy="185" r="6" fill="radial-gradient(#f87171,#7f1d1d)" />
      <path d="M200 179 C197 181 203 185 200 191" stroke="rgba(255,200,200,0.7)" strokeWidth="0.8" fill="none" />
      <path d="M200 179 C203 181 197 185 200 191" stroke="rgba(255,200,200,0.7)" strokeWidth="0.8" fill="none" />

      {/* Fielder dots */}
      {[
        [200, 50], [320, 120], [350, 220], [300, 330], [200, 360],
        [100, 330], [55, 220], [80, 120], [290, 160], [110, 160],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(255,255,255,0.5)" />
      ))}

      {/* Outer ring glow */}
      <ellipse cx="200" cy="200" rx="196" ry="196" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
    </svg>
  );
}
