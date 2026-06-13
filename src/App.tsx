import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import PointsEntry from './pages/PointsEntry'
import AuditAppeals from './pages/AuditAppeals'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
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
  )
}
