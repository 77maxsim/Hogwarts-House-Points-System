import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import PointsEntry from './pages/PointsEntry'
import AuditAppeals from './pages/AuditAppeals'
import MagicalBackground from './components/MagicalBackground'
import { DemoIdentityProvider } from './contexts/DemoIdentity'

export default function App() {
  return (
    <DemoIdentityProvider>
      <BrowserRouter>
        {/* Decorative background — fixed, z-index 0, pointer-events none */}
        <MagicalBackground />
        {/* Content sits above background via z-index 1 */}
        <div className="min-h-screen flex flex-col relative" style={{ zIndex: 1 }}>
          <Nav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/points-entry" element={<PointsEntry />} />
              <Route path="/audit-appeals" element={<AuditAppeals />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </DemoIdentityProvider>
  )
}
