import { useDemoIdentity, DEMO_IDENTITIES, type DemoPersona } from '../contexts/DemoIdentity'

const PERSONA_META: Record<DemoPersona, { short: string; role: string; house?: string; color: string }> = {
  professor: {
    short: 'Prof. Mallory',
    role: 'Professor',
    color: '#93c5fd',
  },
  student: {
    short: 'M. Aldridge',
    role: 'Student',
    house: 'Gryffindor',
    color: '#f87171',
  },
  head: {
    short: 'Head V. Wren',
    role: 'Head of House',
    house: 'Gryffindor',
    color: '#fbbf24',
  },
}

export default function DemoSwitcher() {
  const { identity, setPersona } = useDemoIdentity()
  const current = PERSONA_META[identity.persona]

  return (
    <div
      className="mb-6 rounded-xl"
      style={{
        background: 'rgba(10,8,3,0.6)',
        border: '1px solid rgba(201,168,76,0.14)',
        boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.06)',
      }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
        {/* Current identity */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-semibold text-sm"
            style={{
              background: `${current.color}18`,
              border: `1px solid ${current.color}40`,
              color: current.color,
            }}
          >
            {identity.name.charAt(0)}
          </div>
          <div>
            <p className="font-body font-medium text-sm text-ink leading-none">{identity.name}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#6b5b3e' }}>
              {current.role}{current.house ? ` · ${current.house}` : ''}
            </p>
          </div>
        </div>

        {/* Switcher */}
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(DEMO_IDENTITIES) as DemoPersona[]).map(p => {
            const meta = PERSONA_META[p]
            const isActive = identity.persona === p
            return (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className="text-xs font-mono px-2.5 py-1.5 rounded-lg transition-all duration-150"
                style={isActive ? {
                  background: `${meta.color}15`,
                  color: meta.color,
                  border: `1px solid ${meta.color}45`,
                  boxShadow: `0 0 10px ${meta.color}18`,
                } : {
                  background: 'rgba(30,21,9,0.5)',
                  color: '#6b5b3e',
                  border: '1px solid rgba(61,46,24,0.45)',
                }}
              >
                {meta.short}
              </button>
            )
          })}
        </div>
      </div>

      <div
        className="px-4 py-2 text-xs font-mono"
        style={{
          borderTop: '1px solid rgba(61,46,24,0.35)',
          color: '#4a3c28',
        }}
      >
        Prototype role switcher — production would use authenticated login
      </div>
    </div>
  )
}
