import type { HouseSlug } from '../types/db'

interface HouseCrestProps {
  house: HouseSlug
  size?: number
  className?: string
}

// Shared shield path — heraldic pointed base
const SHIELD = 'M 50 5 L 94 5 L 94 64 Q 94 86 50 99 Q 6 86 6 64 Z'

function GryffindorCrest({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Gryffindor crest">
      <defs>
        <clipPath id="gc-clip">
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id="gc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#5a0f0f" />
        </linearGradient>
        <linearGradient id="gc-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      {/* Shield fill */}
      <path d={SHIELD} fill="url(#gc-bg)" />
      {/* Quarterly division — top-right & bottom-left in gold */}
      <rect x="50" y="5" width="44" height="54" fill="url(#gc-gold)" clipPath="url(#gc-clip)" opacity="0.22" />
      <path d="M 6 59 L 50 59 L 50 99 Q 28 93 6 64 Z" fill="url(#gc-gold)" clipPath="url(#gc-clip)" opacity="0.22" />
      {/* Cross dividers */}
      <line x1="50" y1="5" x2="50" y2="99" stroke="#fbbf24" strokeWidth="1.2" clipPath="url(#gc-clip)" opacity="0.55" />
      <line x1="6" y1="59" x2="94" y2="59" stroke="#fbbf24" strokeWidth="1.2" clipPath="url(#gc-clip)" opacity="0.55" />
      {/* Outer border */}
      <path d={SHIELD} fill="none" stroke="#fbbf24" strokeWidth="2.8" />
      {/* Inner subtle border */}
      <path d="M 52 9 L 90 9 L 90 63 Q 90 83 50 95 Q 10 83 10 63 L 10 9 Z" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.35" />
      {/* Initial */}
      <text x="50" y="32" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill="#fbbf24" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">G</text>
      {/* Lower flourish */}
      <text x="50" y="78" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fontWeight="400" fill="#fbbf24" textAnchor="middle" dominantBaseline="middle" opacity="0.65" letterSpacing="2">LION</text>
    </svg>
  )
}

function SlytherinCrest({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Slytherin crest">
      <defs>
        <clipPath id="sc-clip">
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id="sc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>
        <linearGradient id="sc-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill="url(#sc-bg)" />
      {/* Per fess: silver band across middle */}
      <rect x="6" y="46" width="88" height="18" fill="url(#sc-silver)" clipPath="url(#sc-clip)" opacity="0.18" />
      {/* Serpentine wave */}
      <path
        d="M 15 52 Q 30 40 50 52 Q 70 64 85 52"
        fill="none" stroke="url(#sc-silver)" strokeWidth="3.5" strokeLinecap="round"
        clipPath="url(#sc-clip)" opacity="0.70"
      />
      {/* Outer border */}
      <path d={SHIELD} fill="none" stroke="#d1d5db" strokeWidth="2.8" />
      <path d="M 52 9 L 90 9 L 90 63 Q 90 83 50 95 Q 10 83 10 63 L 10 9 Z" fill="none" stroke="#d1d5db" strokeWidth="0.8" opacity="0.30" />
      {/* Initial */}
      <text x="50" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="28" fontWeight="700" fill="#e2e8f0" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">S</text>
      <text x="50" y="78" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fontWeight="400" fill="#d1d5db" textAnchor="middle" dominantBaseline="middle" opacity="0.60" letterSpacing="2">SERPENT</text>
    </svg>
  )
}

function RavenclawCrest({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Ravenclaw crest">
      <defs>
        <clipPath id="rc-clip">
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id="rc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f1e4a" />
        </linearGradient>
        <linearGradient id="rc-bronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill="url(#rc-bg)" />
      {/* Chevron shape */}
      <path
        d="M 6 30 L 50 62 L 94 30 L 94 46 L 50 78 L 6 46 Z"
        fill="url(#rc-bronze)" clipPath="url(#rc-clip)" opacity="0.30"
      />
      <path
        d="M 6 30 L 50 62 L 94 30"
        fill="none" stroke="url(#rc-bronze)" strokeWidth="3" strokeLinecap="round" clipPath="url(#rc-clip)" opacity="0.80"
      />
      {/* Outer border */}
      <path d={SHIELD} fill="none" stroke="#d97706" strokeWidth="2.8" />
      <path d="M 52 9 L 90 9 L 90 63 Q 90 83 50 95 Q 10 83 10 63 L 10 9 Z" fill="none" stroke="#d97706" strokeWidth="0.8" opacity="0.30" />
      {/* Initial */}
      <text x="50" y="26" fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" fontWeight="700" fill="#bfdbfe" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">R</text>
      <text x="50" y="78" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" fontWeight="400" fill="#93c5fd" textAnchor="middle" dominantBaseline="middle" opacity="0.60" letterSpacing="2">RAVEN</text>
    </svg>
  )
}

function HufflepuffCrest({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Hufflepuff crest">
      <defs>
        <clipPath id="hc-clip">
          <path d={SHIELD} />
        </clipPath>
        <linearGradient id="hc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="hc-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d={SHIELD} fill="url(#hc-bg)" />
      {/* Barry pattern — alternating horizontal stripes */}
      {[0, 1, 2, 3].map(i => (
        <rect
          key={i}
          x="6" y={5 + i * 24} width="88" height="12"
          fill="url(#hc-gold)"
          clipPath="url(#hc-clip)"
          opacity="0.22"
        />
      ))}
      {/* Dividing stripe lines */}
      {[29, 53, 77].map(y => (
        <line key={y} x1="6" y1={y} x2="94" y2={y} stroke="#fcd34d" strokeWidth="0.8" clipPath="url(#hc-clip)" opacity="0.40" />
      ))}
      {/* Outer border */}
      <path d={SHIELD} fill="none" stroke="#fcd34d" strokeWidth="2.8" />
      <path d="M 52 9 L 90 9 L 90 63 Q 90 83 50 95 Q 10 83 10 63 L 10 9 Z" fill="none" stroke="#fcd34d" strokeWidth="0.8" opacity="0.30" />
      {/* Initial */}
      <text x="50" y="48" fontFamily="Georgia, 'Times New Roman', serif" fontSize="26" fontWeight="700" fill="#fcd34d" textAnchor="middle" dominantBaseline="middle" letterSpacing="-0.5">H</text>
      <text x="50" y="83" fontFamily="Georgia, 'Times New Roman', serif" fontSize="9" fontWeight="400" fill="#fcd34d" textAnchor="middle" dominantBaseline="middle" opacity="0.60" letterSpacing="2">BADGER</text>
    </svg>
  )
}

export default function HouseCrest({ house, size = 64, className }: HouseCrestProps) {
  const props = { size }
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {house === 'gryffindor' && <GryffindorCrest {...props} />}
      {house === 'slytherin' && <SlytherinCrest {...props} />}
      {house === 'ravenclaw' && <RavenclawCrest {...props} />}
      {house === 'hufflepuff' && <HufflepuffCrest {...props} />}
    </span>
  )
}
