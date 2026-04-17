import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Ministries() {
  const [ministries, setMinistries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchMinistries() }, [])

  async function fetchMinistries() {
    setLoading(true)
    const res = await api.get('/ministries')
    setMinistries(res.data.data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setError('')
    setShowModal(true)
  }

  function openEdit(m) {
    setEditing(m)
    setName(m.name)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.put(`/ministries/${editing.id}`, { name })
      } else {
        await api.post('/ministries', { name })
      }
      setShowModal(false)
      fetchMinistries()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this ministry?')) return
    await api.delete(`/ministries/${id}`)
    fetchMinistries()
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Ministries</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Ministry</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ministries.length === 0 ? (
                <tr><td colSpan={3} style={{textAlign:'center',color:'var(--text-muted)'}}>No ministries yet</td></tr>
              ) : ministries.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                    {' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? 'Edit Ministry' : 'Add Ministry'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ministry Name *</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
