import { useDemoIdentity, DEMO_IDENTITIES, type DemoPersona } from '../contexts/DemoIdentity'

const PERSONA_LABELS: Record<DemoPersona, string> = {
  professor: 'Prof. E. Mallory — Professor',
  student: 'M. Aldridge — Student, Gryffindor',
  head: 'Head V. Wren — Head of House, Gryffindor',
}

export default function DemoSwitcher() {
  const { identity, setPersona } = useDemoIdentity()

  return (
    <div className="mb-6 rounded-xl p-4" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-mono text-parchment-gold uppercase tracking-[0.2em] mb-1">
            Demo Identity
          </p>
          <p className="font-body font-medium text-ink">{identity.name}</p>
          <p className="text-xs font-mono text-ink-dim">
            {identity.role}{identity.house ? `, ${identity.house}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DEMO_IDENTITIES) as DemoPersona[]).map(p => (
            <button
              key={p}
              onClick={() => setPersona(p)}
              className="text-xs font-mono px-3 py-1.5 rounded transition-colors"
              style={identity.persona === p
                ? { background: 'rgba(201,168,76,0.2)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.4)' }
                : { background: 'rgba(30,25,12,0.6)', color: '#6b5b3e', border: '1px solid rgba(61,46,24,0.5)' }
              }
            >
              {PERSONA_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-ink-dim font-mono mt-3 pt-3" style={{ borderTop: '1px solid rgba(61,46,24,0.4)' }}>
        Prototype-only role switcher. Production would use real login.
      </p>
    </div>
  )
}
