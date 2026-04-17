import { useEffect, useState } from 'react'
import api from '../services/api'

const EMPTY_FORM = { name: '', phone: '', baptismDate: '', marriageDate: '', status: 'ACTIVE' }

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const res = await api.get('/members')
    setMembers(res.data.data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(member) {
    setEditing(member)
    setForm({
      name: member.name,
      phone: member.phone || '',
      baptismDate: member.baptismDate || '',
      marriageDate: member.marriageDate || '',
      status: member.status,
    })
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        baptismDate: form.baptismDate || null,
        marriageDate: form.marriageDate || null,
      }
      if (editing) {
        await api.put(`/members/${editing.id}`, payload)
      } else {
        await api.post('/members', payload)
      }
      setShowModal(false)
      fetchMembers()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this member?')) return
    await api.delete(`/members/${id}`)
    fetchMembers()
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Members</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Member</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Baptism Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-muted)'}}>No members yet</td></tr>
              ) : members.map(m => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.phone || '-'}</td>
                  <td>{m.baptismDate || '-'}</td>
                  <td>
                    <span className={`badge badge-${m.status?.toLowerCase()}`}>{m.status}</span>
                  </td>
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
              <h3 className="modal-title">{editing ? 'Edit Member' : 'Add Member'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Baptism Date</label>
                <input type="date" className="form-control" value={form.baptismDate} onChange={e => setForm({...form, baptismDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Marriage Date</label>
                <input type="date" className="form-control" value={form.marriageDate} onChange={e => setForm({...form, marriageDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
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
