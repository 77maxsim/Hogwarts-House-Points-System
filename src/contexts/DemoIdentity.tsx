import { createContext, useContext, useState, type ReactNode } from 'react'

export type DemoPersona = 'professor' | 'student' | 'head'

export interface DemoIdentity {
  persona: DemoPersona
  id: string
  name: string
  role: string
  house: string | null
  houseId: string | null
}

export const DEMO_IDENTITIES: Record<DemoPersona, DemoIdentity> = {
  professor: {
    persona: 'professor',
    id: '00000000-0000-0000-0000-000000000201',
    name: 'Prof. E. Mallory',
    role: 'Professor',
    house: null,
    houseId: null,
  },
  student: {
    persona: 'student',
    id: '00000000-0000-0000-0000-000000000205',
    name: 'M. Aldridge',
    role: 'Student',
    house: 'Gryffindor',
    houseId: '11111111-1111-1111-1111-111111111111',
  },
  head: {
    persona: 'head',
    id: '00000000-0000-0000-0000-000000000206',
    name: 'Head V. Wren',
    role: 'Head of House',
    house: 'Gryffindor',
    houseId: '11111111-1111-1111-1111-111111111111',
  },
}

interface DemoCtx {
  identity: DemoIdentity
  setPersona: (p: DemoPersona) => void
}

const DemoCtx = createContext<DemoCtx | null>(null)

export function DemoIdentityProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona>('professor')
  return (
    <DemoCtx.Provider value={{ identity: DEMO_IDENTITIES[persona], setPersona }}>
      {children}
    </DemoCtx.Provider>
  )
}

export function useDemoIdentity() {
  const ctx = useContext(DemoCtx)
  if (!ctx) throw new Error('useDemoIdentity used outside DemoIdentityProvider')
  return ctx
}
