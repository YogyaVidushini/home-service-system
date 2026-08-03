import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext'
import HVid from '../../assets/HVid.mp4'


function WorkerDashboard() {
  const { user, token, logout } = useApp()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [availableBookings, setAvailableBookings] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('available')

  const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: { Authorization: `Bearer ${token}` }
  })

  useEffect(() => {
    if (!user || user.role !== 'worker') { navigate('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [p, n, av, my] = await Promise.all([
        api.get('/worker/profile'),
        api.get('/worker/notifications'),
        api.get('/worker/bookings/available'),
        api.get('/worker/bookings/mine'),
      ])
      setProfile(p.data)
      setNotifications(n.data)
      setAvailableBookings(av.data)
      setMyBookings(my.data)
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  const acceptBooking = async (id) => {
    try {
      await api.post(`/worker/bookings/${id}/accept`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not accept booking.')
    }
  }

  const startService = async (id) => {
    try {
      await api.post(`/worker/bookings/${id}/in-progress`)
      fetchData()
    } catch (err) {
      console.error('Start service error:', err)
      alert(err.response?.data?.message || 'Could not start service.')
    }
  }

  const completeBooking = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return
    try {
      await api.post(`/worker/bookings/${id}/complete`)
      fetchData()
    } catch (err) {
      console.error('Complete error:', err)
    }
  }

  const markRead = async (id) => {
    try {
      await api.post(`/worker/notifications/${id}/read`)
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x))
    } catch (err) { }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) { }
    logout()
    navigate('/login')
  }

  const worker = profile?.worker
  const unreadCount = notifications.filter(n => !n.is_read).length

  const statusStyle = {
    approved: 'bg-green-500/20  text-green-400  border border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    rejected: 'bg-red-500/20    text-red-400    border border-red-500/30',
  }

  const bookingStatusStyle = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    accepted: 'bg-blue-500/20   text-blue-400   border-blue-500/30',
    in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    completed: 'bg-green-500/20  text-green-400  border-green-500/30',
    cancelled: 'bg-red-500/20    text-red-400    border-red-500/30',
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <nav className="relative z-20 flex justify-between items-center px-8 py-4
                      bg-black/40 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold">
          Home<span className="text-teal-400">Service</span>
          <span className="text-white/40 text-sm font-normal ml-3">Worker Dashboard</span>
        </h1>
        <div className="hidden md:flex space-x-6 text-sm text-white/70">
          <button onClick={() => setTab('my-bookings')}
            className="hover:text-teal-400 transition-colors">My Bookings</button>
          <button onClick={() => setTab('profile')}
            className="hover:text-teal-400 transition-colors">Profile</button>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <div className="relative cursor-pointer" onClick={() => setTab('notifications')}>
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white
                               text-xs w-4 h-4 rounded-full flex items-center
                               justify-center font-bold">
                {unreadCount}
              </span>
            </div>
          )}
          <span className="text-white/70 text-sm">
            🔧 Welcome, <span className="text-teal-400 font-semibold capitalize">{user?.username}</span>
          </span>
          <button onClick={handleLogout}
            className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30
                       text-red-400 border border-red-500/30 rounded-lg transition-all">
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 py-6 max-w-5xl mx-auto">

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            Welcome, <span className="text-teal-400 capitalize">{user?.username}</span>! 👋
          </h2>
        </div>

        {/* Unread notifications */}
        {notifications.filter(n => !n.is_read).map(n => (
          <div key={n.id}
            className="flex justify-between items-start bg-teal-500/15
                       border border-teal-500/40 rounded-2xl px-5 py-4 mb-4">
            <div>
              <p className="font-semibold text-teal-300">{n.title}</p>
              <p className="text-white/70 text-sm mt-1">{n.message}</p>
            </div>
            <button onClick={() => markRead(n.id)}
              className="text-white/30 hover:text-white text-lg ml-4 shrink-0">✕</button>
          </div>
        ))}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'available', label: `📋 Available (${availableBookings.length})` },
            { key: 'my-bookings', label: `✅ My Bookings (${myBookings.length})` },
            { key: 'profile', label: '👤 Profile' },
            { key: 'notifications', label: `🔔 Notifications (${unreadCount})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${tab === t.key
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/50">Loading...</div>
        ) : (
          <>
            {/* Available bookings */}
            {tab === 'available' && (
              <div className="space-y-4">
                {availableBookings.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    No available bookings right now.
                  </div>
                ) : availableBookings.map(b => (
                  <div key={b.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20
                               rounded-2xl p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-3">{b.service_type}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-white/40 text-xs">📅 Date</p>
                            <p className="text-white mt-0.5">{b.date}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">🕐 Time</p>
                            <p className="text-white mt-0.5">{b.time}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">📍 Location</p>
                            <p className="text-white mt-0.5 truncate">{b.location}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">💳 Payment</p>
                            <p className="text-white mt-0.5 capitalize">{b.payment_method}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4">
                          <p className="text-white/50 text-xs">
                            👤 Customer: {b.customer?.username}
                          </p>
                          <p className="text-white/50 text-xs">
                            📞 {b.customer?.phone}
                          </p>
                        </div>
                        {b.notes && (
                          <p className="text-white/40 text-xs mt-2 italic">
                            📝 {b.notes}
                          </p>
                        )}
                      </div>
                      <button onClick={() => acceptBooking(b.id)}
                        className="ml-4 px-4 py-2 bg-teal-500 hover:bg-teal-600
                                   text-white rounded-xl text-sm font-semibold
                                   transition-all shrink-0">
                        ✅ Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My bookings */}
            {tab === 'my-bookings' && (
              <div className="space-y-4">
                {myBookings.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    You haven't accepted any bookings yet.
                  </div>
                ) : myBookings.map(b => (
                  <div key={b.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20
                               rounded-2xl p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-bold text-lg">{b.service_type}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs
                                            font-medium border
                                            ${bookingStatusStyle[b.status]}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-white/40 text-xs">📅 Date</p>
                            <p className="text-white mt-0.5">{b.date}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">🕐 Time</p>
                            <p className="text-white mt-0.5">{b.time}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">📍 Location</p>
                            <p className="text-white mt-0.5 truncate">{b.location}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-xs">💳 Payment</p>
                            <p className="text-white mt-0.5 capitalize">{b.payment_method}</p>
                          </div>
                        </div>
                        <p className="text-white/50 text-xs mt-3">
                          👤 Customer: {b.customer?.username} | 📞 {b.customer?.phone}
                        </p>
                      </div>
                      {b.status === 'accepted' && (
                        <button onClick={() => startService(b.id)}
                          className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600
               text-white rounded-xl text-sm font-semibold
               transition-all shrink-0">
                          🔧 Start Service
                        </button>
                      )}
                      {b.status === 'in_progress' && (
                        <button onClick={() => completeBooking(b.id)}
                          className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700
               text-white rounded-xl text-sm font-semibold
               transition-all shrink-0">
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile tab */}
            {tab === 'profile' && (
              <>
                <div className={`rounded-2xl px-6 py-5 mb-6
                                 ${statusStyle[worker?.status || 'pending']}`}>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-1 opacity-70">
                    Account Status
                  </p>
                  <p className="text-3xl font-bold capitalize">
                    {worker?.status ?? 'pending'}
                  </p>
                  {worker?.status === 'approved' && (
                    <p className="text-sm mt-1 opacity-80">
                      🎉 You are verified and can receive bookings.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Username', value: profile?.username },
                    { label: 'Email', value: profile?.email },
                    { label: 'Phone', value: profile?.phone },
                    { label: 'NIC', value: worker?.nic },
                    { label: 'Service', value: worker?.service_category },
                    { label: 'Experience', value: (worker?.experience ?? '—') + ' years' },
                    { label: 'Bank', value: worker?.bank_name },
                    { label: 'Acc. Number', value: worker?.account_number },
                  ].map(item => (
                    <div key={item.label}
                      className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                      <p className="text-white/40 text-xs">{item.label}</p>
                      <p className="text-white text-sm mt-1 font-medium">
                        {item.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Notifications tab */}
            {tab === 'notifications' && (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
                {notifications.length === 0 ? (
                  <p className="text-center text-white/40 py-8">No notifications.</p>
                ) : notifications.map(n => (
                  <div key={n.id}
                    className={`border-b border-white/10 py-3 last:border-0
                                ${n.is_read ? 'opacity-40' : ''}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-white/50 text-xs mt-1">{n.message}</p>
                    <p className="text-white/30 text-xs mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default WorkerDashboard