import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext'
import HVid from '../../assets/HVid.mp4'

// ── Progress tracker component ──────────────────────────────
function ProgressTracker({ status }) {
  const steps = ['pending', 'accepted', 'in_progress', 'completed']
  const labels = {
    pending:     'Pending',
    accepted:    'Accepted',
    in_progress: 'In Progress',
    completed:   'Completed',
  }
  const icons = {
    pending:     '⏳',
    accepted:    '✅',
    in_progress: '🔧',
    completed:   '🎉',
  }
  const currentIndex = steps.indexOf(status)

  return (
    <div className="flex items-center w-full mt-4 mb-2">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center
                             text-sm font-bold transition-all
              ${i <= currentIndex
                ? 'bg-teal-500 text-white'
                : 'bg-white/10 text-white/30'}`}>
              {i <= currentIndex ? icons[step] : i + 1}
            </div>
            <p className={`text-xs mt-1 ${
              i <= currentIndex ? 'text-teal-400' : 'text-white/30'}`}>
              {labels[step]}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-1 rounded transition-all
              ${i < currentIndex ? 'bg-teal-500' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Star rating component ────────────────────────────────────
function StarRating({ value, onChange, size = 'lg' }) {
  const s = size === 'lg' ? 'text-3xl' : 'text-lg'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange && onChange(star)}
          className={`${s} transition-all ${
            star <= value ? 'text-yellow-400' : 'text-white/20'
          } ${onChange ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}>
          ★
        </button>
      ))}
    </div>
  )
}

// ── Worker Profile Modal ─────────────────────────────────────
function WorkerProfileModal({ workerId, token, onClose }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`http://localhost:8001/api/workers/${workerId}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [workerId])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center
                    justify-center z-[100] px-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl
                      p-6 w-full max-w-md text-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">🔧 Worker Profile</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center text-white/60
                       hover:text-white transition-all">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/50">Loading...</div>
        ) : profile ? (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 border
                              border-teal-500/40 flex items-center justify-center
                              text-3xl mx-auto mb-2">
                🔧
              </div>
              <h4 className="text-xl font-bold">{profile.username}</h4>
              <p className="text-teal-400 text-sm">{profile.service_category}</p>
            </div>

            {/* Rating */}
            <div className="text-center">
              <StarRating value={Math.round(profile.avg_rating)} size="lg" />
              <p className="text-white/50 text-xs mt-1">
                {profile.avg_rating?.toFixed(1)} / 5.0
                ({profile.total_ratings} reviews)
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Phone',      value: profile.phone },
                { label: 'Experience', value: profile.experience + ' years' },
                { label: 'Expertise',  value: profile.service_category },
                { label: 'Rating',     value: profile.avg_rating?.toFixed(1) + ' ⭐' },
              ].map(item => (
                <div key={item.label}
                  className="bg-white/5 rounded-xl px-3 py-2.5">
                  <p className="text-white/40 text-xs">{item.label}</p>
                  <p className="text-white text-sm mt-0.5 font-medium">
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent reviews */}
            {profile.recent_ratings?.length > 0 && (
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Recent Reviews
                </p>
                {profile.recent_ratings.map(r => (
                  <div key={r.id}
                    className="bg-white/5 rounded-xl px-3 py-2.5 mb-2">
                    <div className="flex justify-between items-center">
                      <p className="text-white/60 text-xs">
                        {r.customer?.username}
                      </p>
                      <StarRating value={r.stars} size="sm" />
                    </div>
                    {r.review && (
                      <p className="text-white/50 text-xs mt-1 italic">
                        "{r.review}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-white/40 py-8">Profile not found.</p>
        )}
      </div>
    </div>
  )
}

// ── Rating Modal ─────────────────────────────────────────────
function RatingModal({ booking, token, onClose, onSubmit }) {
  const [stars, setStars]   = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const submit = async () => {
    if (stars === 0) { setError('Please select a star rating.'); return }
    setLoading(true)
    try {
      await axios.post(
        `http://localhost:8001/api/customer/bookings/${booking.id}/rate`,
        { stars, review },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onSubmit()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center
                    justify-center z-[100] px-4">
      <div className="bg-gray-900 border border-white/20 rounded-2xl
                      p-6 w-full max-w-md text-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">⭐ Rate Your Worker</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                       flex items-center justify-center text-white/60
                       hover:text-white transition-all">✕</button>
        </div>

        <div className="text-center mb-5">
          <p className="text-white/60 text-sm mb-1">
            How was your {booking.service_type} service?
          </p>
          <p className="text-teal-400 text-xs mb-4">
            Worker: {booking.worker?.username}
          </p>
          <StarRating value={stars} onChange={setStars} size="lg" />
          <p className="text-white/40 text-xs mt-2">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][stars]}
          </p>
        </div>

        <textarea value={review} onChange={e => setReview(e.target.value)}
          rows={3} placeholder="Share your experience (optional)..."
          className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                     border-white/20 text-sm resize-none focus:outline-none
                     focus:ring-2 focus:ring-teal-400 placeholder-white/30 mb-4" />

        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600
                       rounded-xl font-semibold text-sm transition-all
                       disabled:opacity-50">
            {loading ? 'Submitting...' : '⭐ Submit Rating'}
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20
                       rounded-xl text-sm transition-all">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Emergency Modal ──────────────────────────────────────────
function EmergencyModal({ bookingId, token, onClose }) {
  const [message, setMessage] = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await axios.post('http://localhost:8001/api/customer/emergency',
        { booking_id: bookingId, message },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center
                    justify-center z-[110] px-4">
      <div className="bg-red-950 border border-red-500/50 rounded-2xl
                      p-6 w-full max-w-md text-white">
        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">🚨</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Alert Sent!
            </h3>
            <p className="text-white/60 text-sm mb-6">
              The admin has been notified of your emergency.
              Help is on the way.
            </p>
            <button onClick={onClose}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700
                         rounded-xl text-sm font-semibold transition-all">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                <h3 className="text-lg font-bold text-red-400">
                  Emergency Alert
                </h3>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
                           flex items-center justify-center text-white/60
                           hover:text-white transition-all">✕</button>
            </div>

            <p className="text-white/60 text-sm mb-4">
              This will immediately notify the admin.
              Use only in genuine emergencies.
            </p>

            <textarea value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              placeholder="Describe the emergency situation..."
              className="w-full px-4 py-2.5 rounded-xl bg-red-900/40 border
                         border-red-500/30 text-sm resize-none focus:outline-none
                         focus:ring-2 focus:ring-red-400 placeholder-white/30 mb-4" />

            <button onClick={send} disabled={loading || !message.trim()}
              className="w-full py-3 bg-red-600 hover:bg-red-700
                         rounded-xl font-bold text-sm transition-all
                         disabled:opacity-50 animate-pulse">
              {loading ? 'Sending...' : '🚨 SEND EMERGENCY ALERT'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main CustomerDashboard ───────────────────────────────────
function CustomerDashboard() {
  const { user, token, logout } = useApp()
  const navigate                = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')

  // Modals
  const [ratingBooking, setRatingBooking]   = useState(null)
  const [emergencyBookingId, setEmergencyBookingId] = useState(null)
  const [workerProfileId, setWorkerProfileId]       = useState(null)

  const api = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: { Authorization: `Bearer ${token}` }
  })

  useEffect(() => {
  if (!user || user.role !== 'customer') { navigate('/login'); return }
  fetchBookings()
  const interval = setInterval(fetchBookings, 15000) // refresh every 15s
  return () => clearInterval(interval)
}, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/customer/bookings')
      setBookings(res.data)

      // Auto open rating for newly completed bookings
      const justCompleted = res.data.find(
        b => b.status === 'completed' && !b.rating
      )
      if (justCompleted) setRatingBooking(justCompleted)
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api.post(`/customer/bookings/${id}/cancel`)
      fetchBookings()
    } catch (err) { console.error(err) }
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch (err) {}
    logout()
    navigate('/login')
  }

  const filtered = tab === 'all'
    ? bookings
    : bookings.filter(b => b.status === tab)

  const statusStyle = {
    pending:     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    accepted:    'bg-blue-500/20   text-blue-400   border-blue-500/30',
    in_progress: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    completed:   'bg-green-500/20  text-green-400  border-green-500/30',
    cancelled:   'bg-red-500/20    text-red-400    border-red-500/30',
  }

  return (
    <div className="relative min-h-screen text-white">
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
          <span className="text-white/40 text-sm font-normal ml-3">
            Customer Dashboard
          </span>
        </h1>
        <div className="hidden md:flex space-x-6 text-sm text-white/70">
          <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
          <Link to="/Services" className="hover:text-teal-400 transition-colors">
            Services
          </Link>
          <Link to="/Contact" className="hover:text-teal-400 transition-colors">
            Services
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-sm">
            🏠 Welcome,{' '}
            <span className="text-teal-400 font-semibold capitalize">{user?.username}</span>
          </span>
          <button onClick={handleLogout}
            className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30
                       text-red-400 border border-red-500/30 rounded-lg
                       transition-all">
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 px-8 py-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold ">
              Welcome, <span className="text-teal-400 capitalize">{user?.username}</span>! 👋
            </h2>
            <p className="text-white/50 text-sm mt-1">
              Manage and track your bookings here.
            </p>
          </div>
          <button onClick={() => navigate('/Services')}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                       rounded-xl font-semibold text-sm transition-all">
            + Book a Service
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Total',       value: bookings.length,                                          color: 'white'  },
            { label: 'Pending',     value: bookings.filter(b=>b.status==='pending').length,          color: 'yellow' },
            { label: 'Accepted',    value: bookings.filter(b=>b.status==='accepted').length,         color: 'blue'   },
            { label: 'In Progress', value: bookings.filter(b=>b.status==='in_progress').length,      color: 'orange' },
            { label: 'Completed',   value: bookings.filter(b=>b.status==='completed').length,        color: 'green'  },
          ].map(s => (
            <div key={s.label}
              className="bg-white/10 backdrop-blur-md border border-white/20
                         rounded-2xl p-4 text-center">
              <p className="text-white/50 text-xs">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 text-${s.color}-400`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all','pending','accepted','in_progress','completed','cancelled'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize
                          transition-all
                ${tab === t
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {loading ? (
          <div className="text-center py-12 text-white/50">
            Loading your bookings...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg mb-4">No bookings found.</p>
            <button onClick={() => navigate('/Services')}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                         rounded-xl text-sm font-semibold transition-all">
              Book Your First Service
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id}
                className="bg-white/10 backdrop-blur-md border border-white/20
                           rounded-2xl p-5">

                {/* Top row */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{b.service_type}</h3>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium
                                      border ${statusStyle[b.status]}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 shrink-0 ml-4">
                    {/* Emergency button — show for active bookings */}
                    {['accepted','in_progress'].includes(b.status) && (
                      <button
                        onClick={() => setEmergencyBookingId(b.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700
                                   text-white rounded-lg text-xs font-bold
                                   transition-all animate-pulse">
                        🚨 Emergency
                      </button>
                    )}
                    {/* Cancel button */}
                    {b.status === 'pending' && (
                      <button onClick={() => cancelBooking(b.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30
                                   text-red-400 border border-red-500/30 rounded-lg
                                   text-xs transition-all">
                        Cancel
                      </button>
                    )}
                    {/* Rate button */}
                    {b.status === 'completed' && !b.rating && (
                      <button onClick={() => setRatingBooking(b)}
                        className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30
                                   text-yellow-400 border border-yellow-500/30
                                   rounded-lg text-xs transition-all">
                        ⭐ Rate
                      </button>
                    )}
                    {/* Already rated */}
                    {b.status === 'completed' && b.rating && (
                      <div className="flex items-center gap-1">
                        <StarRating value={b.rating.stars} size="sm" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress tracker — only for active bookings */}
                {!['cancelled'].includes(b.status) && (
                  <ProgressTracker status={b.status} />
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
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
                    <p className="text-white mt-0.5 capitalize">
                      {b.payment_method}
                    </p>
                  </div>
                </div>

                {/* Worker card — show when accepted/in_progress/completed */}
                {b.worker && ['accepted','in_progress','completed'].includes(b.status) && (
                  <div className="mt-4 bg-white/5 border border-white/10
                                  rounded-xl px-4 py-3 flex justify-between
                                  items-center">
                    <div>
                      <p className="text-white/40 text-xs mb-1">Your Worker</p>
                      <p className="font-semibold text-white">
                        🔧 {b.worker.username}
                      </p>
                      <p className="text-teal-400 text-xs mt-0.5">
                        📞 {b.worker.phone || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => setWorkerProfileId(b.worker_id)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20
                                 rounded-xl text-xs font-medium transition-all">
                      View Profile
                    </button>
                  </div>
                )}

                {b.notes && (
                  <p className="text-white/40 text-xs mt-3 italic">
                    📝 {b.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {workerProfileId && (
        <WorkerProfileModal
          workerId={workerProfileId}
          token={token}
          onClose={() => setWorkerProfileId(null)}
        />
      )}

      {ratingBooking && (
        <RatingModal
          booking={ratingBooking}
          token={token}
          onClose={() => setRatingBooking(null)}
          onSubmit={() => {
            setRatingBooking(null)
            fetchBookings()
          }}
        />
      )}

      {emergencyBookingId !== null && (
        <EmergencyModal
          bookingId={emergencyBookingId}
          token={token}
          onClose={() => setEmergencyBookingId(null)}
        />
      )}
    </div>
  )
}

export default CustomerDashboard