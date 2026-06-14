import { useId } from 'react'
import type { HouseSlug } from '../types/db'

interface HouseCrestProps {
  house: HouseSlug
  size?: number
  className?: string
}

const SHIELD = 'M 50 5 L 94 5 L 94 64 Q 94 86 50 99 Q 6 86 6 64 Z'
const INNER  = 'M 50 9 L 90 9 L 90 63 Q 90 84 50 96 Q 10 84 10 63 Z'

// 8-pointed mane star: outer r=25, inner r=17, center (50,50)
const MANE = '50,25 57,34 68,32 66,43 75,50 66,57 68,68 57,66 50,75 43,66 32,68 34,57 25,50 34,43 32,32 43,34'

function GryffindorCrest({ id, size }: { id: string; size: number }) {
  const clip = `${id}g`
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Gryffindor — The Lion">
      <defs>
        <clipPath id={clip}><path d={SHIELD} /></clipPath>
      </defs>

      {/* Shield base — deep crimson */}
      <path d={SHIELD} fill="#2A0707" />

      {/* Inner background gradient overlay */}
      <path d={INNER} fill="#3D0A0A" opacity="0.8" clipPath={`url(#${clip})`} />

      {/* === LION === */}
      {/* Mane — gold spiky star ring */}
      <polygon points={MANE} fill="#FBBF24" clipPath={`url(#${clip})`} />

      {/* Mane inner shading */}
      <polygon points={MANE} fill="#B45309" opacity="0.35" clipPath={`url(#${clip})`} />

      {/* Face — crimson circle over mane */}
      <circle cx="50" cy="50" r="17" fill="#7F1D1D" clipPath={`url(#${clip})`} />

      {/* Muzzle — slightly lighter lower face area */}
      <ellipse cx="50" cy="57" rx="9" ry="6" fill="#8B2020" clipPath={`url(#${clip})`} />

      {/* Ears — gold triangles poking above mane */}
      <polygon points="40,29 35,15 48,24" fill="#FBBF24" clipPath={`url(#${clip})`} />
      <polygon points="60,29 65,15 52,24" fill="#FBBF24" clipPath={`url(#${clip})`} />
      {/* Ear inner shadow */}
      <polygon points="40,28 37,18 46,24" fill="#B45309" opacity="0.5" clipPath={`url(#${clip})`} />
      <polygon points="60,28 63,18 54,24" fill="#B45309" opacity="0.5" clipPath={`url(#${clip})`} />

      {/* Eyes — gold, almond shape */}
      <ellipse cx="43.5" cy="47" rx="3.5" ry="2.5" fill="#FBBF24" clipPath={`url(#${clip})`} />
      <ellipse cx="56.5" cy="47" rx="3.5" ry="2.5" fill="#FBBF24" clipPath={`url(#${clip})`} />
      {/* Pupils */}
      <ellipse cx="44" cy="47" rx="1.6" ry="2" fill="#3D0A0A" clipPath={`url(#${clip})`} />
      <ellipse cx="56" cy="47" rx="1.6" ry="2" fill="#3D0A0A" clipPath={`url(#${clip})`} />
      {/* Eye shine */}
      <circle cx="45" cy="46" r="0.7" fill="#FDE68A" clipPath={`url(#${clip})`} />
      <circle cx="57" cy="46" r="0.7" fill="#FDE68A" clipPath={`url(#${clip})`} />

      {/* Nose — small upward-pointing diamond */}
      <path d="M 47.5 53 L 50 57 L 52.5 53 Q 50 51 47.5 53 Z" fill="#FBBF24" clipPath={`url(#${clip})`} />

      {/* Chin tuft — two short strokes */}
      <path d="M 44 62 Q 50 67 56 62" fill="none" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" clipPath={`url(#${clip})`} opacity="0.7" />

      {/* Shield border — gold */}
      <path d={SHIELD} fill="none" stroke="#FBBF24" strokeWidth="2.8" />
      <path d={INNER} fill="none" stroke="#FBBF24" strokeWidth="0.7" opacity="0.40" />
    </svg>
  )
}

function SlytherinCrest({ id, size }: { id: string; size: number }) {
  const clip = `${id}s`
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Slytherin — The Serpent">
      <defs>
        <clipPath id={clip}><path d={SHIELD} /></clipPath>
      </defs>

      {/* Shield base — deep forest */}
      <path d={SHIELD} fill="#020F08" />
      <path d={INNER} fill="#041F14" opacity="0.9" clipPath={`url(#${clip})`} />

      {/* === SERPENT === */}
      {/* Body — coiled arc, clockwise from head at top ~300° around */}
      {/* Arc: center (50,50), r=26, from (50,24) clockwise to (37,73) */}
      <path
        d="M 50 24 A 26 26 0 1 1 37 73"
        fill="none"
        stroke="#059669"
        strokeWidth="10"
        strokeLinecap="round"
        clipPath={`url(#${clip})`}
      />
      {/* Body highlight — lighter green center line */}
      <path
        d="M 50 24 A 26 26 0 1 1 37 73"
        fill="none"
        stroke="#34D399"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.40"
        clipPath={`url(#${clip})`}
      />
      {/* Scale diamonds along body */}
      <ellipse cx="72" cy="37" rx="3.5" ry="1.8" fill="#064E3B" transform="rotate(38 72 37)" clipPath={`url(#${clip})`} />
      <ellipse cx="76" cy="55" rx="3.5" ry="1.8" fill="#064E3B" transform="rotate(-10 76 55)" clipPath={`url(#${clip})`} />
      <ellipse cx="65" cy="68" rx="3.5" ry="1.8" fill="#064E3B" transform="rotate(-35 65 68)" clipPath={`url(#${clip})`} />
      <ellipse cx="45" cy="76" rx="3" ry="1.5" fill="#064E3B" transform="rotate(-60 45 76)" clipPath={`url(#${clip})`} />

      {/* Tail taper */}
      <path d="M 37 73 Q 26 80 28 88 Q 30 94 36 93"
        fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round" clipPath={`url(#${clip})`} />
      <path d="M 28 88 Q 30 94 36 93"
        fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" clipPath={`url(#${clip})`} />

      {/* Neck connection */}
      <path d="M 50 14 L 50 26"
        fill="none" stroke="#059669" strokeWidth="10" strokeLinecap="round" clipPath={`url(#${clip})`} />

      {/* Head — flattened diamond/oval, raised above body */}
      <path d="M 41 22 Q 50 10 59 22 Q 56 28 50 28 Q 44 28 41 22 Z"
        fill="#064E3B" clipPath={`url(#${clip})`} />
      <ellipse cx="50" cy="18" rx="9" ry="6" fill="#059669" clipPath={`url(#${clip})`} />

      {/* Scales on head */}
      <path d="M 42 20 Q 50 16 58 20" fill="none" stroke="#064E3B" strokeWidth="1" opacity="0.6" clipPath={`url(#${clip})`} />

      {/* Eye — silver-grey */}
      <ellipse cx="45" cy="18" rx="2.8" ry="2.2" fill="#C0C7C4" clipPath={`url(#${clip})`} />
      <ellipse cx="45" cy="18" rx="1.4" ry="1.8" fill="#052E16" clipPath={`url(#${clip})`} />
      <circle cx="44.5" cy="17.2" r="0.6" fill="#E5E7EB" clipPath={`url(#${clip})`} />

      {/* Tongue — forked silver */}
      <line x1="50" y1="10" x2="46" y2="5" stroke="#C0C7C4" strokeWidth="1.6" strokeLinecap="round" clipPath={`url(#${clip})`} />
      <line x1="50" y1="10" x2="54" y2="5" stroke="#C0C7C4" strokeWidth="1.6" strokeLinecap="round" clipPath={`url(#${clip})`} />
      <circle cx="50" cy="11" r="1" fill="#059669" clipPath={`url(#${clip})`} />

      {/* Shield border — silver */}
      <path d={SHIELD} fill="none" stroke="#C0C7C4" strokeWidth="2.8" />
      <path d={INNER} fill="none" stroke="#C0C7C4" strokeWidth="0.7" opacity="0.35" />
    </svg>
  )
}

function RavenclawCrest({ id, size }: { id: string; size: number }) {
  const clip = `${id}r`
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Ravenclaw — The Raven">
      <defs>
        <clipPath id={clip}><path d={SHIELD} /></clipPath>
      </defs>

      {/* Shield base — deep navy */}
      <path d={SHIELD} fill="#060C20" />
      <path d={INNER} fill="#0A1435" opacity="0.9" clipPath={`url(#${clip})`} />

      {/* === RAVEN IN FLIGHT === */}
      {/* Left wing — arches up and sweeps out to left tip */}
      <path
        d="M 50 54 C 38 44 22 34 10 42 C 16 54 32 57 46 57 L 50 57 Z"
        fill="#2563EB"
        clipPath={`url(#${clip})`}
      />
      {/* Right wing */}
      <path
        d="M 50 54 C 62 44 78 34 90 42 C 84 54 68 57 54 57 L 50 57 Z"
        fill="#2563EB"
        clipPath={`url(#${clip})`}
      />

      {/* Wing upper edge highlight (feather curve) */}
      <path d="M 50 54 C 38 44 22 34 10 42"
        fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.55" clipPath={`url(#${clip})`} />
      <path d="M 50 54 C 62 44 78 34 90 42"
        fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.55" clipPath={`url(#${clip})`} />

      {/* Wing feather divisions (left) */}
      <path d="M 38 54 C 30 44 20 38 12 44" fill="none" stroke="#1D4ED8" strokeWidth="1.2" opacity="0.7" clipPath={`url(#${clip})`} />
      <path d="M 29 55 C 24 47 16 42 10 46" fill="none" stroke="#1D4ED8" strokeWidth="1" opacity="0.5" clipPath={`url(#${clip})`} />
      {/* Wing feather divisions (right) */}
      <path d="M 62 54 C 70 44 80 38 88 44" fill="none" stroke="#1D4ED8" strokeWidth="1.2" opacity="0.7" clipPath={`url(#${clip})`} />
      <path d="M 71 55 C 76 47 84 42 90 46" fill="none" stroke="#1D4ED8" strokeWidth="1" opacity="0.5" clipPath={`url(#${clip})`} />

      {/* Body — dark oval */}
      <ellipse cx="50" cy="57" rx="10" ry="14" fill="#172554" clipPath={`url(#${clip})`} />

      {/* Head — round, slightly left-of-center (bird facing left) */}
      <circle cx="48" cy="37" r="11" fill="#172554" clipPath={`url(#${clip})`} />

      {/* Beak — bronze, pointing left and slightly down */}
      <path d="M 47 40 L 30 46 L 44 48 Z" fill="#CD7F32" clipPath={`url(#${clip})`} />
      {/* Beak detail line */}
      <path d="M 37 43 L 47 40" fill="none" stroke="#92400E" strokeWidth="0.8" opacity="0.6" clipPath={`url(#${clip})`} />

      {/* Eye — bronze ring with dark pupil */}
      <circle cx="53" cy="34" r="4.5" fill="#CD7F32" clipPath={`url(#${clip})`} />
      <circle cx="53" cy="34" r="2.5" fill="#0F172A" clipPath={`url(#${clip})`} />
      <circle cx="54" cy="33" r="0.9" fill="#FDE68A" clipPath={`url(#${clip})`} />

      {/* Tail feathers — fan at bottom of body */}
      <path d="M 43 69 C 46 80 50 86 54 80 C 55 84 50 90 45 84 C 42 80 42 74 43 69 Z"
        fill="#172554" clipPath={`url(#${clip})`} />
      <path d="M 50 70 C 50 82 50 88 50 84" fill="none" stroke="#1D4ED8" strokeWidth="1.2" opacity="0.5" clipPath={`url(#${clip})`} />
      <path d="M 47 71 C 46 82 45 87 44 83" fill="none" stroke="#1D4ED8" strokeWidth="1" opacity="0.4" clipPath={`url(#${clip})`} />
      <path d="M 53 71 C 54 82 55 87 56 83" fill="none" stroke="#1D4ED8" strokeWidth="1" opacity="0.4" clipPath={`url(#${clip})`} />

      {/* Shield border — bronze */}
      <path d={SHIELD} fill="none" stroke="#CD7F32" strokeWidth="2.8" />
      <path d={INNER} fill="none" stroke="#CD7F32" strokeWidth="0.7" opacity="0.38" />
    </svg>
  )
}

function HufflepuffCrest({ id, size }: { id: string; size: number }) {
  const clip = `${id}h`
  return (
    <svg width={size} height={size} viewBox="0 0 100 105" xmlns="http://www.w3.org/2000/svg" aria-label="Hufflepuff — The Badger">
      <defs>
        <clipPath id={clip}><path d={SHIELD} /></clipPath>
      </defs>

      {/* Shield base — near-black */}
      <path d={SHIELD} fill="#070401" />
      <path d={INNER} fill="#0F0803" opacity="0.9" clipPath={`url(#${clip})`} />

      {/* === BADGER FACE === */}
      {/* Main head — wide dark oval */}
      <ellipse cx="50" cy="58" rx="34" ry="26" fill="#1A1207" clipPath={`url(#${clip})`} />

      {/* Left dark cheek patch — darker than head */}
      <ellipse cx="29" cy="55" rx="16" ry="18" fill="#0A0703" clipPath={`url(#${clip})`} />
      {/* Right dark cheek patch */}
      <ellipse cx="71" cy="55" rx="16" ry="18" fill="#0A0703" clipPath={`url(#${clip})`} />

      {/* Central cream/yellow stripe — the badger's signature marking */}
      <path d="M 45 88 C 47 78 50 62 50 22 C 50 62 53 78 55 88 Q 52.5 92 50 93 Q 47.5 92 45 88 Z"
        fill="#FDE68A"
        clipPath={`url(#${clip})`}
      />
      {/* Stripe shading (middle slightly darker) */}
      <path d="M 48 88 C 49 78 50 62 50 22 C 50 62 51 78 52 88 Q 51 92 50 93 Q 49 92 48 88 Z"
        fill="#F59E0B"
        opacity="0.4"
        clipPath={`url(#${clip})`}
      />

      {/* Nose pad — prominent, on the stripe */}
      <ellipse cx="50" cy="70" rx="9.5" ry="7.5" fill="#1A1207" stroke="#FDE68A" strokeWidth="1" clipPath={`url(#${clip})`} />
      <ellipse cx="50" cy="69" rx="6" ry="4.5" fill="#111827" clipPath={`url(#${clip})`} />
      {/* Nostril marks */}
      <ellipse cx="47.5" cy="69" rx="1.6" ry="1.2" fill="#2D1B00" opacity="0.8" clipPath={`url(#${clip})`} />
      <ellipse cx="52.5" cy="69" rx="1.6" ry="1.2" fill="#2D1B00" opacity="0.8" clipPath={`url(#${clip})`} />

      {/* Left eye — amber iris, dark pupil, highlight */}
      <circle cx="33" cy="51" r="6.5" fill="#D97706" clipPath={`url(#${clip})`} />
      <circle cx="33" cy="51" r="3.5" fill="#111827" clipPath={`url(#${clip})`} />
      <circle cx="34.5" cy="49.5" r="1.2" fill="#FDE68A" clipPath={`url(#${clip})`} />

      {/* Right eye */}
      <circle cx="67" cy="51" r="6.5" fill="#D97706" clipPath={`url(#${clip})`} />
      <circle cx="67" cy="51" r="3.5" fill="#111827" clipPath={`url(#${clip})`} />
      <circle cx="68.5" cy="49.5" r="1.2" fill="#FDE68A" clipPath={`url(#${clip})`} />

      {/* Left ear — round, dark with inner colour */}
      <circle cx="22" cy="34" r="12" fill="#1A1207" clipPath={`url(#${clip})`} />
      <circle cx="22" cy="34" r="7.5" fill="#2D1B00" clipPath={`url(#${clip})`} />
      <circle cx="22" cy="34" r="4" fill="#3D2500" opacity="0.6" clipPath={`url(#${clip})`} />

      {/* Right ear */}
      <circle cx="78" cy="34" r="12" fill="#1A1207" clipPath={`url(#${clip})`} />
      <circle cx="78" cy="34" r="7.5" fill="#2D1B00" clipPath={`url(#${clip})`} />
      <circle cx="78" cy="34" r="4" fill="#3D2500" opacity="0.6" clipPath={`url(#${clip})`} />

      {/* Fur texture hints around face (subtle lines) */}
      <path d="M 18 56 Q 26 54 32 57" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.18" clipPath={`url(#${clip})`} />
      <path d="M 82 56 Q 74 54 68 57" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.18" clipPath={`url(#${clip})`} />

      {/* Shield border — amber/gold */}
      <path d={SHIELD} fill="none" stroke="#D97706" strokeWidth="2.8" />
      <path d={INNER} fill="none" stroke="#D97706" strokeWidth="0.7" opacity="0.40" />
    </svg>
  )
}

export default function HouseCrest({ house, size = 64, className }: HouseCrestProps) {
  const uid = useId().replace(/:/g, '_')
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {house === 'gryffindor' && <GryffindorCrest id={uid} size={size} />}
      {house === 'slytherin'  && <SlytherinCrest  id={uid} size={size} />}
      {house === 'ravenclaw'  && <RavenclawCrest  id={uid} size={size} />}
      {house === 'hufflepuff' && <HufflepuffCrest id={uid} size={size} />}
    </span>
  )
}
