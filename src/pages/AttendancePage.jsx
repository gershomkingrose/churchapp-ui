import { useEffect, useState } from 'react'
import api from '../services/api'

export default function AttendancePage() {
  const [ministries, setMinistries] = useState([])
  const [members, setMembers] = useState([])
  const [selectedMinistry, setSelectedMinistry] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/ministries').then(res => setMinistries(res.data.data))
    api.get('/members').then(res => setMembers(res.data.data))
  }, [])

  function toggleStatus(memberId) {
    setAttendance(prev => ({
      ...prev,
      [memberId]: prev[memberId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }))
  }

  function initAll(status) {
    const init = {}
    members.forEach(m => { init[m.id] = status })
    setAttendance(init)
  }

  async function handleSave() {
    if (!selectedMinistry) { setError('Please select a ministry'); return }
    setError('')
    const records = members.map(m => ({
      ministryId: Number(selectedMinistry),
      memberId: m.id,
      date,
      status: attendance[m.id] || 'ABSENT',
    }))
    try {
      await api.post('/attendance', records)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save attendance')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Attendance</h2>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Ministry</label>
            <select className="form-control" value={selectedMinistry} onChange={e => setSelectedMinistry(e.target.value)}>
              <option value="">Select ministry...</option>
              {ministries.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => initAll('PRESENT')}>Mark All Present</button>
          <button className="btn btn-secondary btn-sm" onClick={() => initAll('ABSENT')}>Mark All Absent</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {saved && <div className="alert alert-success">Attendance saved successfully!</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Status</th>
              <th>Toggle</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-muted)'}}>No members found</td></tr>
            ) : members.map(m => {
              const status = attendance[m.id] || 'ABSENT'
              return (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>
                    <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${status === 'PRESENT' ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleStatus(m.id)}
                    >
                      {status === 'PRESENT' ? 'Mark Absent' : 'Mark Present'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {members.length > 0 && (
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button className="btn btn-primary" onClick={handleSave}>Save Attendance</button>
        </div>
      )}
    </div>
  )
}
