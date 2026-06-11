export default function StumpsHit({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground shadow */}
      <ellipse cx="105" cy="208" rx="55" ry="6" fill="rgba(255,255,255,0.04)" />

      {/* Stumps — slightly askew from impact */}
      {/* Left stump — leaning left */}
      <g transform="rotate(-8, 78, 180)">
        <rect x="74" y="100" width="8" height="100" rx="3" fill="url(#stumpGrad)" />
        <rect x="73" y="97" width="10" height="6" rx="2" fill="#e2c97e" />
      </g>
      {/* Middle stump — straight but wobbling */}
      <g transform="rotate(3, 105, 180)">
        <rect x="101" y="95" width="8" height="105" rx="3" fill="url(#stumpGrad)" />
        <rect x="100" y="92" width="10" height="6" rx="2" fill="#e2c97e" />
      </g>
      {/* Right stump — flying away */}
      <g transform="rotate(18, 132, 160)">
        <rect x="128" y="88" width="8" height="105" rx="3" fill="url(#stumpGrad)" />
        <rect x="127" y="85" width="10" height="6" rx="2" fill="#e2c97e" />
      </g>

      {/* Bails flying off */}
      <g transform="rotate(-25, 90, 88) translate(-4, -10)">
        <rect x="78" y="88" width="22" height="4" rx="2" fill="#f0d080" opacity="0.9" />
      </g>
      <g transform="rotate(30, 118, 82) translate(6, -14)">
        <rect x="104" y="82" width="22" height="4" rx="2" fill="#f0d080" opacity="0.9" />
      </g>

      {/* Impact flash behind ball */}
      <circle cx="58" cy="110" r="22" fill="rgba(251,191,36,0.12)" />
      <circle cx="58" cy="110" r="14" fill="rgba(251,191,36,0.08)" />

      {/* Impact lines / sparks */}
      <line x1="58" y1="88" x2="52" y2="72" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="74" y1="96" x2="88" y2="84" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="38" y1="96" x2="24" y2="86" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="36" y1="114" x2="20" y2="112" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="44" y1="128" x2="34" y2="140" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="70" y1="126" x2="76" y2="140" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round" opacity="0.35" />

      {/* Cricket ball */}
      <defs>
        <radialGradient id="ballG" cx="36%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="45%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </radialGradient>
        <radialGradient id="stumpGrad" cx="30%" cy="0%" r="100%" gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="200">
          <stop offset="0%" stopColor="#f0d080" />
          <stop offset="100%" stopColor="#a07840" />
        </radialGradient>
        <radialGradient id="ballShine" cx="30%" cy="28%" r="40%">
          <stop offset="0%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="58" cy="110" r="20" fill="url(#ballG)" />
      <circle cx="58" cy="110" r="20" fill="url(#ballShine)" />
      {/* Seam */}
      <path d="M58 91 C46 98 70 110 58 129" stroke="rgba(255,210,210,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 91 C70 98 46 110 58 129" stroke="rgba(255,210,210,0.6)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Motion blur lines behind ball */}
      <line x1="20" y1="104" x2="36" y2="107" stroke="rgba(220,38,38,0.3)" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="110" x2="36" y2="110" stroke="rgba(220,38,38,0.25)" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="116" x2="36" y2="113" stroke="rgba(220,38,38,0.2)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
