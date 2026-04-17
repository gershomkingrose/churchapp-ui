import { useEffect, useState } from 'react'
import api from '../services/api'

const EMPTY_FORM = {
  ministryId: '',
  memberId: '',
  donorId: '',
  donorType: 'member', // 'member' or 'donor' or 'new_donor'
  amount: '',
  purpose: '',
  date: new Date().toISOString().split('T')[0],
  newDonorName: '',
  newDonorPhone: '',
}

export default function Donations() {
  const [donations, setDonations] = useState([])
  const [ministries, setMinistries] = useState([])
  const [members, setMembers] = useState([])
  const [donors, setDonors] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/donations'),
      api.get('/ministries'),
      api.get('/members'),
      api.get('/donors'),
    ]).then(([d, m, mem, don]) => {
      setDonations(d.data.data)
      setMinistries(m.data.data)
      setMembers(mem.data.data)
      setDonors(don.data.data)
    }).finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      let memberId = null
      let donorId = null

      if (form.donorType === 'member') {
        memberId = form.memberId ? Number(form.memberId) : null
      } else if (form.donorType === 'donor') {
        donorId = form.donorId ? Number(form.donorId) : null
      } else if (form.donorType === 'new_donor') {
        const newDonor = await api.post('/donors', { name: form.newDonorName, phone: form.newDonorPhone })
        donorId = newDonor.data.data.id
        setDonors(prev => [...prev, newDonor.data.data])
      }

      if (!memberId && !donorId) {
        setError('Please select or add a member/donor')
        return
      }

      await api.post('/donations', {
        ministryId: form.ministryId ? Number(form.ministryId) : null,
        memberId,
        donorId,
        amount: Number(form.amount),
        purpose: form.purpose,
        date: form.date,
      })

      setShowModal(false)
      const res = await api.get('/donations')
      setDonations(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this donation?')) return
    await api.delete(`/donations/${id}`)
    setDonations(prev => prev.filter(d => d.id !== id))
  }

  const ministryName = (id) => ministries.find(m => m.id === id)?.name || '-'
  const memberName = (id) => members.find(m => m.id === id)?.name
  const donorName = (id) => donors.find(d => d.id === id)?.name

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Donations</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Donation</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Ministry</th>
                <th>Donor/Member</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-muted)'}}>No donations yet</td></tr>
              ) : donations.map(d => (
                <tr key={d.id}>
                  <td>{d.date}</td>
                  <td>${Number(d.amount).toLocaleString()}</td>
                  <td>{d.purpose || '-'}</td>
                  <td>{ministryName(d.ministryId)}</td>
                  <td>{d.memberId ? memberName(d.memberId) : donorName(d.donorId) || '-'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
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
              <h3 className="modal-title">Add Donation</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ministry</label>
                <select className="form-control" value={form.ministryId} onChange={e => setForm({...form, ministryId: e.target.value})}>
                  <option value="">Select ministry...</option>
                  {ministries.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount *</label>
                <input type="number" step="0.01" className="form-control" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-control" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Donor Type</label>
                <select className="form-control" value={form.donorType} onChange={e => setForm({...form, donorType: e.target.value})}>
                  <option value="member">Church Member</option>
                  <option value="donor">Existing Donor</option>
                  <option value="new_donor">New Donor</option>
                </select>
              </div>
              {form.donorType === 'member' && (
                <div className="form-group">
                  <label className="form-label">Member</label>
                  <select className="form-control" value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
                    <option value="">Select member...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              )}
              {form.donorType === 'donor' && (
                <div className="form-group">
                  <label className="form-label">Donor</label>
                  <select className="form-control" value={form.donorId} onChange={e => setForm({...form, donorId: e.target.value})}>
                    <option value="">Select donor...</option>
                    {donors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              {form.donorType === 'new_donor' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Donor Name *</label>
                    <input className="form-control" value={form.newDonorName} onChange={e => setForm({...form, newDonorName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Donor Phone</label>
                    <input className="form-control" value={form.newDonorPhone} onChange={e => setForm({...form, newDonorPhone: e.target.value})} />
                  </div>
                </>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Donation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
