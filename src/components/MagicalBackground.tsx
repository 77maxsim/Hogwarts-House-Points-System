import { useLocation } from 'react-router-dom'

/**
 * Fixed-position decorative background.
 * z-index 0, pointer-events none — never blocks clicks or keyboard focus.
 * The parent content wrapper must have position: relative; z-index: 1 to sit above.
 *
 * variant: 'cinematic'  — dashboard (all 5 orbs + particles)
 *          'calm'       — staff pages (3 orbs, no particles)
 */
export default function MagicalBackground() {
  const { pathname } = useLocation()
  const cinematic = pathname === '/dashboard' || pathname === '/'

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Orb 1 — warm gold/amber, lower-left anchor */}
      <div className="magical-orb magical-orb-1" />

      {/* Orb 2 — midnight blue, upper-right */}
      <div className="magical-orb magical-orb-2" />

      {/* Orb 3 — deep crimson, centre — cinematic only */}
      {cinematic && <div className="magical-orb magical-orb-3" />}

      {/* Orb 4 — emerald, mid-right — present on all pages at reduced opacity */}
      <div className="magical-orb magical-orb-4" style={cinematic ? undefined : { opacity: 0.55 }} />

      {/* Orb 5 — warm amber, upper-centre — cinematic only */}
      {cinematic && <div className="magical-orb magical-orb-5" />}

      {/* Edge vignette — draws eyes to centre content */}
      <div className="magical-vignette" />

      {/* Floating dust — cinematic dashboard only */}
      {cinematic && (
        <>
          <span className="magical-particle" style={{ left: '13%',  animationDuration: '20s', animationDelay:   '0s', opacity: 0.045 }} />
          <span className="magical-particle" style={{ left: '27%',  animationDuration: '26s', animationDelay:  '-6s', opacity: 0.055, width: '3px', height: '3px' }} />
          <span className="magical-particle" style={{ left: '42%',  animationDuration: '18s', animationDelay: '-11s', opacity: 0.040 }} />
          <span className="magical-particle" style={{ left: '58%',  animationDuration: '24s', animationDelay:  '-4s', opacity: 0.050 }} />
          <span className="magical-particle" style={{ left: '71%',  animationDuration: '22s', animationDelay:  '-9s', opacity: 0.045, width: '3px', height: '3px' }} />
          <span className="magical-particle" style={{ left: '84%',  animationDuration: '19s', animationDelay: '-15s', opacity: 0.040 }} />
          <span className="magical-particle" style={{ left: '36%',  animationDuration: '29s', animationDelay:  '-7s', opacity: 0.035 }} />
          <span className="magical-particle" style={{ left: '64%',  animationDuration: '23s', animationDelay: '-13s', opacity: 0.050, width: '3px', height: '3px' }} />
        </>
      )}
    </div>
  )
}
