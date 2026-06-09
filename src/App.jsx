import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import AddDrive from './pages/AddDrive.jsx'
import Calendar from './pages/Calendar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import DriveDetails from './pages/DriveDetails.jsx'
import EditDrive from './pages/EditDrive.jsx'
import Landing from './pages/Landing.jsx'
import PlacementEmailParser from './pages/PlacementEmailParser.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-drive" element={<AddDrive />} />
        <Route path="/email-parser" element={<PlacementEmailParser />} />
        <Route path="/drives/:id" element={<DriveDetails />} />
        <Route path="/drives/:id/edit" element={<EditDrive />} />
        <Route path="/calendar" element={<Calendar />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
