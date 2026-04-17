import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../services/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/ministries', label: 'Ministries', icon: '🏛️' },
  { to: '/attendance', label: 'Attendance', icon: '📅' },
  { to: '/donations', label: 'Donations', icon: '💰' },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>⛪ ChurchFlow</h1>
          <p>Church Management</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <strong>{user?.name}</strong>
            {user?.role}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
