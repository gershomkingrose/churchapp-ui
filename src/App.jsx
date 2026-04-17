import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Ministries from './pages/Ministries'
import AttendancePage from './pages/AttendancePage'
import Donations from './pages/Donations'
import Layout from './components/Layout'
import { getToken } from './services/auth'

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="donations" element={<Donations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
