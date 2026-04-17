import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading dashboard...</p>

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalMembers ?? 0}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalMinistries ?? 0}</div>
          <div className="stat-label">Total Ministries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.todayAttendance ?? 0}</div>
          <div className="stat-label">Present Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${Number(stats?.monthlyDonations ?? 0).toLocaleString()}
          </div>
          <div className="stat-label">Monthly Donations</div>
        </div>
      </div>
    </div>
  )
}
