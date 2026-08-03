import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext'
import HVid from '../../assets/HVid.mp4'

function AdminDashboard() {
  const { user, token, logout } = useApp()
  const navigate                = useNavigate()
  const [tab, setTab]           = useState('pending')
  const [workers, setWorkers]   = useState([])
  const [customers, setCustomers] = useState([])
  const [stats, setStats]       = useState({})
  const [rejectModal, setRejectModal] = useState(null)
  const [reason, setReason]     = useState('')
  const [loading, setLoading]   = useState(true)

  //  worker detail modal
  const [detailWorker, setDetailWorker] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  //emergency modal
  const [emergencies, setEmergencies] = useState([])

  const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: { Authorization: `Bearer ${token}` }
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return }
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [s, w, c, em] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/workers'),
        api.get('/admin/customers'),
        api.get('/admin/emergencies'),
      ])
      setStats(s.data)
      setWorkers(w.data)
      setCustomers(c.data)
      setEmergencies(em.data)
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NEW — fetch full worker details
  const openDetail = async (id) => {
    setDetailLoading(true)
    setDetailWorker(null)
    try {
      const res = await api.get(`/admin/workers/${id}`)
      setDetailWorker(res.data)
    } catch (err) {
      console.error('Detail error:', err.response?.data || err.message)
    } finally {
      setDetailLoading(false)
    }
  }

  const approve = async (id) => {
    try {
      await api.post(`/admin/workers/${id}/approve`)
      setDetailWorker(null)
      fetchAll()
    } catch (err) {
      console.error('Approve error:', err.response?.data || err.message)
    }
  }

  const reject = async () => {
    try {
      await api.post(`/admin/workers/${rejectModal}/reject`, { reason })
      setRejectModal(null)
      setDetailWorker(null)
      setReason('')
      fetchAll()
    } catch (err) {
      console.error('Reject error:', err.response?.data || err.message)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const pending  = workers.filter(w => w.status === 'pending')
  const approved = workers.filter(w => w.status === 'approved')
  const rejected = workers.filter(w => w.status === 'rejected')

  const badgeColor = (status) => ({
    pending:  'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20  text-green-400',
    rejected: 'bg-red-500/20    text-red-400',
  }[status])

  // ✅ Helper — is this file a PDF?
  const isPdf = (url) => url?.toLowerCase().endsWith('.pdf')

  return (
    <div className="relative min-h-screen text-white">

      {/* Video background */}
      <div className="fixed inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-4
                      bg-black/40 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold">
          Home<span className="text-teal-400">Service</span>
          <span className="text-white/40 text-sm font-normal ml-3">Admin Panel</span>
        </h1>
        <div className="hidden md:flex space-x-6 text-sm text-white/70">
          <button onClick={() => setTab('pending')}
            className="hover:text-teal-400 transition-colors">Applications</button>
          <button onClick={() => setTab('customers')}
            className="hover:text-teal-400 transition-colors">Customers</button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">
            👤 Welcome, <span className="text-teal-400 font-semibold capitalize">{user?.username}</span>
          </span>
          <button onClick={handleLogout}
            className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30
                       text-red-400 border border-red-500/30 rounded-lg transition-all">
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 px-8 py-6">

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            Welcome back, <span className="text-teal-400 capitalize">{user?.username}</span>! 👋
          </h2>
          <p className="text-white/50 text-sm mt-1">
            Here's what's happening on your platform today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Workers',   value: stats.total_workers,   color: 'teal',   icon: '🔧' },
            { label: 'Pending Approval', value: stats.pending_workers, color: 'yellow', icon: '⏳' },
            { label: 'Total Customers',  value: stats.total_customers, color: 'blue',   icon: '🏠' },
          ].map((s) => (
            <div key={s.label}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <p className="text-white/50 text-sm">{s.label}</p>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <p className={`text-3xl font-bold mt-2 text-${s.color}-400`}>
                {loading ? '...' : (s.value ?? '0')}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'pending',   label: `⏳ Pending (${pending.length})`     },
            { key: 'approved',  label: `✅ Approved (${approved.length})`   },
            { key: 'rejected',  label: `❌ Rejected (${rejected.length})`   },
            { key: 'customers', label: `🏠 Customers (${customers.length})` },
            { key: 'emergencies', label: `🚨 Emergencies` },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${tab === t.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 backdrop-blur-sm text-white/50 hover:bg-white/20'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Worker table */}
        {tab !== 'customers' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20
                          rounded-2xl overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-white/50">Loading...</div>
            ) : (tab === 'pending' ? pending : tab === 'approved' ? approved : rejected).length === 0 ? (
              <div className="text-center py-12 text-white/40">
                No {tab} applications found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/30 text-white/50 text-xs uppercase">
                  <tr>
                    {['Name','Email','NIC','Category','Experience','Status','Actions']
                      .map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'pending' ? pending : tab === 'approved' ? approved : rejected)
                    .map((w) => (
                    <tr key={w.id}
                      className="border-t border-white/10 hover:bg-white/5 cursor-pointer"
                      onClick={() => openDetail(w.id)}>
                      <td className="px-4 py-3 font-medium">{w.user?.username}</td>
                      <td className="px-4 py-3 text-white/60">{w.user?.email}</td>
                      <td className="px-4 py-3 text-white/60">{w.nic}</td>
                      <td className="px-4 py-3">{w.service_category}</td>
                      <td className="px-4 py-3">{w.experience} yrs</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium
                                          ${badgeColor(w.status)}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {w.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approve(w.id)}
                              className="px-3 py-1 bg-green-500/20 hover:bg-green-500/40
                                         text-green-400 rounded-lg text-xs transition-all
                                         border border-green-500/30">
                              ✅ Approve
                            </button>
                            <button onClick={() => setRejectModal(w.id)}
                              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40
                                         text-red-400 rounded-lg text-xs transition-all
                                         border border-red-500/30">
                              ❌ Reject
                            </button>
                          </div>
                        )}
                        {w.status === 'rejected' && (
                          <span className="text-white/30 text-xs italic">
                            {w.rejection_reason}
                          </span>
                        )}
                        {w.status === 'approved' && (
                          <span className="text-green-400 text-xs">Active ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Customers table */}
        {tab === 'customers' && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20
                          rounded-2xl overflow-hidden">
            {customers.length === 0 ? (
              <div className="text-center py-12 text-white/40">No customers yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-black/30 text-white/50 text-xs uppercase">
                  <tr>
                    {['Username','Email','Phone','Address','Joined']
                      .map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3">{c.username}</td>
                      <td className="px-4 py-3 text-white/60">{c.email}</td>
                      <td className="px-4 py-3 text-white/60">{c.phone}</td>
                      <td className="px-4 py-3 text-white/60">{c.address}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {tab === 'emergencies' && (
  <div className="space-y-4">
    {emergencies.length === 0 ? (
      <div className="text-center py-12 text-white/40">
        No emergencies reported.
      </div>
    ) : emergencies.map(e => (
      <div key={e.id}
        className={`rounded-2xl p-5 border backdrop-blur-md
          ${e.is_resolved
            ? 'bg-white/5 border-white/10'
            : 'bg-red-500/10 border-red-500/40 animate-pulse'}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🚨</span>
              <p className="font-bold text-red-400">
                {e.is_resolved ? 'Resolved' : 'ACTIVE EMERGENCY'}
              </p>
              <span className="text-white/40 text-xs">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-white font-medium mb-1">
              Customer: {e.customer?.username}
            </p>
            <p className="text-white/70 text-sm">{e.message}</p>
            {e.booking && (
              <p className="text-white/40 text-xs mt-1">
                Booking: {e.booking.service_type} on {e.booking.date}
              </p>
            )}
          </div>
          {!e.is_resolved && (
            <button
              onClick={async () => {
                await api.post(`/admin/emergencies/${e.id}/resolve`)
                fetchAll()
              }}
              className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700
                         text-white rounded-xl text-sm font-semibold
                         transition-all shrink-0">
              ✅ Resolve
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
)}

      {/*WORKER DETAIL MODAL */}
      {(detailWorker || detailLoading) && (
        <div className="fixed inset-0 bg-black/80 flex items-center
                justify-center z-[100] px-4 py-8 overflow-y-auto">
          <div className="bg-gray-900 border border-white/20 rounded-2xl
                w-full max-w-2xl text-white relative max-h-[90vh] 
                overflow-y-auto">

            {/* Modal header */}
            <div className="flex justify-between items-center px-6 py-4
                border-b border-white/10 sticky top-0 bg-gray-900 
                rounded-t-2xl z-10">
              <h3 className="text-lg font-bold">
                📋 Worker Application Details
              </h3>
              <button onClick={() => { setDetailWorker(null); setDetailLoading(false); }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/40
             text-white font-bold text-lg flex items-center justify-center
             transition-all border border-white/20 hover:border-red-400">
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="text-center py-16 text-white/50">Loading details...</div>
            ) : detailWorker && (
              <div className="px-6 py-5 space-y-6">

                {/* Personal Info */}
                <div>
                  <p className="text-teal-400 text-xs font-semibold uppercase
                                tracking-widest mb-3">
                    👤 Personal Information
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Username',    value: detailWorker.user?.username },
                      { label: 'Email',       value: detailWorker.user?.email },
                      { label: 'Phone',       value: detailWorker.user?.phone },
                      { label: 'NIC Number',  value: detailWorker.nic },
                      { label: 'Category',    value: detailWorker.service_category },
                      { label: 'Experience',  value: detailWorker.experience + ' years' },
                    ].map((item) => (
                      <div key={item.label}
                        className="bg-white/5 rounded-xl px-4 py-3">
                        <p className="text-white/40 text-xs">{item.label}</p>
                        <p className="text-white text-sm mt-1 font-medium">
                          {item.value || '—'}
                        </p>
                      </div>
                    ))}
                    {/* Address full width */}
                    <div className="col-span-2 bg-white/5 rounded-xl px-4 py-3">
                      <p className="text-white/40 text-xs">Address</p>
                      <p className="text-white text-sm mt-1 font-medium">
                        {detailWorker.user?.address || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <p className="text-teal-400 text-xs font-semibold uppercase
                                tracking-widest mb-3">
                    🏦 Bank Account Details
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Bank Name',       value: detailWorker.bank_name },
                      { label: 'Branch',          value: detailWorker.branch },
                      { label: 'Account Holder',  value: detailWorker.account_holder },
                      { label: 'Account Number',  value: detailWorker.account_number },
                    ].map((item) => (
                      <div key={item.label}
                        className="bg-white/5 rounded-xl px-4 py-3">
                        <p className="text-white/40 text-xs">{item.label}</p>
                        <p className="text-white text-sm mt-1 font-medium">
                          {item.value || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <p className="text-teal-400 text-xs font-semibold uppercase
                                tracking-widest mb-3">
                    📄 Uploaded Documents
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'NIC — Front',        url: detailWorker.nic_front_url },
                      { label: 'NIC — Back',         url: detailWorker.nic_back_url },
                      { label: 'Police Report',      url: detailWorker.police_report_url },
                      { label: 'Other Documents',    url: detailWorker.other_docs_url },
                    ].map((doc) => (
                      <div key={doc.label}
                        className="bg-white/5 rounded-xl overflow-hidden">
                        <p className="text-white/40 text-xs px-3 pt-3 pb-2">
                          {doc.label}
                        </p>
                        {doc.url ? (
                          isPdf(doc.url) ? (
                            // PDF — show open button
                            <a href={doc.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-3 pb-3
                                         text-blue-400 hover:text-blue-300 text-sm">
                              📄 Open PDF
                            </a>
                          ) : (
                            // Image — show thumbnail, click to preview
                            <img
                              src={doc.url}
                              alt={doc.label}
                              onClick={() => setPreviewDoc(doc.url)}
                              className="w-full h-32 object-cover cursor-pointer
                                         hover:opacity-80 transition-opacity"
                            />
                          )
                        ) : (
                          <p className="text-white/20 text-xs px-3 pb-3 italic">
                            Not uploaded
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons — only show for pending */}
                {detailWorker.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => approve(detailWorker.id)}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700
                                 rounded-xl text-sm font-semibold transition-all">
                      ✅ Approve Application
                    </button>
                    <button onClick={() => {
                        setRejectModal(detailWorker.id)
                        setDetailWorker(null)
                      }}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-700
                                 rounded-xl text-sm font-semibold transition-all">
                      ❌ Reject Application
                    </button>
                  </div>
                )}

                {/* Status badge for non-pending */}
                {detailWorker.status !== 'pending' && (
                  <div className={`rounded-xl px-4 py-3 text-sm font-medium
                                   ${badgeColor(detailWorker.status)}`}>
                    Status: <span className="capitalize font-bold ml-1">
                      {detailWorker.status}
                    </span>
                    {detailWorker.rejection_reason && (
                      <p className="text-xs mt-1 opacity-80">
                        Reason: {detailWorker.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ DOCUMENT FULLSCREEN PREVIEW */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/95 flex items-center
           justify-center z-[110]"
          onClick={() => setPreviewDoc(null)}>
          <button className="absolute top-4 right-6 text-white/60
                             hover:text-white text-3xl">✕</button>
          <img src={previewDoc} alt="Document preview"
            className="max-w-3xl max-h-screen object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center
                        justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-2xl
                          p-6 w-96 text-white">
            <h3 className="text-lg font-bold mb-4">❌ Reject Application</h3>
            <p className="text-white/50 text-sm mb-3">Please provide a reason:</p>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              rows={3} placeholder="e.g. Documents are unclear..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                         border-white/20 text-sm resize-none focus:outline-none
                         focus:ring-2 focus:ring-red-400 placeholder-white/30" />
            <div className="flex gap-3 mt-4">
              <button onClick={reject}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700
                           rounded-xl text-sm font-semibold transition-all">
                Confirm Reject
              </button>
              <button onClick={() => setRejectModal(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600
                           rounded-xl text-sm transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard