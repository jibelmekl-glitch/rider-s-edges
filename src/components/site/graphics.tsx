/** Lightweight inline vector graphics — used where a themed photo isn't available. */

export function WorkshopScene({ accent = "#D61C2C" }: { accent?: string }) {
  return (
    <svg
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="wsbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1220" />
          <stop offset="100%" stopColor="#141b2e" />
        </linearGradient>
        <linearGradient id="wsbeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#wsbg)" />

      <polygon points="150,0 260,0 120,600 20,600" fill="url(#wsbeam)" opacity="0.5" />
      <polygon points="950,0 1060,0 1150,600 1010,600" fill="url(#wsbeam)" opacity="0.4" />

      {Array.from({ length: 6 }).map((_, i) => (
        <line key={i} x1={0} y1={90 + i * 70} x2={1200} y2={90 + i * 70} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
      ))}

      <g transform="translate(150,470)" opacity="0.14">
        <circle r="70" fill="none" stroke="white" strokeWidth="10" />
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <rect key={i} x={-8} y={-86} width={16} height={26} fill="white" transform={`rotate(${(a * 180) / Math.PI})`} />
          );
        })}
      </g>

      <g transform="translate(560,300)" fill={accent} opacity="0.92">
        <path d="M20 180 h430 a30 30 0 0 0 0-60 h-40 l-30-70 a40 40 0 0 0-36-22 h-90 l-18 40 h-70 l-40 60 h-60 a26 26 0 0 0-26 26 v0 a26 26 0 0 0 26 26 z" />
        <circle cx="70" cy="182" r="46" fill="#0a1220" stroke={accent} strokeWidth="10" />
        <circle cx="380" cy="182" r="46" fill="#0a1220" stroke={accent} strokeWidth="10" />
        <path d="M300 46 q40 -6 56 26" stroke="#0a1220" strokeWidth="14" fill="none" strokeLinecap="round" />
      </g>

      <circle cx="640" cy="330" r="10" fill="white" opacity="0.9" />
      <circle cx="640" cy="330" r="26" fill="white" opacity="0.18" />
    </svg>
  );
}
