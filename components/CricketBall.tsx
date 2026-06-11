export default function CricketBall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ballBody" cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="35%" stopColor="#dc2626" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#3b0000" />
        </radialGradient>
        <radialGradient id="ballShine" cx="32%" cy="26%" r="38%">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ballShine2" cx="72%" cy="75%" r="25%">
          <stop offset="0%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main sphere */}
      <circle cx="100" cy="100" r="96" fill="url(#ballBody)" />

      {/* Primary shine */}
      <circle cx="100" cy="100" r="96" fill="url(#ballShine)" />
      <circle cx="100" cy="100" r="96" fill="url(#ballShine2)" />

      {/* Left seam curve */}
      <path d="M100 6 C65 30 135 100 100 194" stroke="rgba(255,210,210,0.65)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Right seam curve */}
      <path d="M100 6 C135 30 65 100 100 194" stroke="rgba(255,210,210,0.65)" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Stitches - left seam */}
      {([
        [85, 22, -18], [79, 36, -12], [77, 51, -6], [79, 66, 0],
        [82, 81, 4], [82, 96, 6], [80, 111, 4], [78, 126, 0],
        [79, 141, -4], [82, 156, -8], [86, 170, -14],
      ] as [number, number, number][]).map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r}, ${x}, ${y})`}>
          <line x1={x - 5} y1={y - 2} x2={x + 5} y2={y - 2} stroke="rgba(255,200,200,0.55)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x - 5} y1={y + 2} x2={x + 5} y2={y + 2} stroke="rgba(255,200,200,0.55)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}

      {/* Stitches - right seam */}
      {([
        [115, 22, 18], [121, 36, 12], [123, 51, 6], [121, 66, 0],
        [118, 81, -4], [118, 96, -6], [120, 111, -4], [122, 126, 0],
        [121, 141, 4], [118, 156, 8], [114, 170, 14],
      ] as [number, number, number][]).map(([x, y, r], i) => (
        <g key={i} transform={`rotate(${r}, ${x}, ${y})`}>
          <line x1={x - 5} y1={y - 2} x2={x + 5} y2={y - 2} stroke="rgba(255,200,200,0.55)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={x - 5} y1={y + 2} x2={x + 5} y2={y + 2} stroke="rgba(255,200,200,0.55)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      ))}

      {/* Rim highlight */}
      <circle cx="100" cy="100" r="95" stroke="rgba(255,100,100,0.12)" strokeWidth="2" fill="none" />
    </svg>
  );
}
