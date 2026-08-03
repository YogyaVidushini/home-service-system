import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useApp } from '../../context/AppContext'
import Navbar from '../Navbar'
import HVid from '../../assets/HVid.mp4'

const SERVICE_LIST = [
  'Plumbing', 'Cleaning', 'Garden Maintaining',
  'Grocery Buying', 'Painting', 'Furniture Assembly',
  'Common Home Services'
]

function BookingForm() {
  const { user, token } = useApp()
  const navigate        = useNavigate()
  const { service }     = useParams()

  const [form, setForm] = useState({
    service_type:   service || '',
    location:       '',
    phone:          user?.phone || '',
    date:           '',
    time:           '',
    payment_method: 'cash',
    notes:          '',
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.service_type || !form.location || !form.phone ||
        !form.date || !form.time || !form.payment_method) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      await axios.post('http://localhost:8001/api/customer/bookings', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Booking failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 rounded-xl bg-white/20
                      placeholder-white/40 focus:outline-none focus:ring-2
                      focus:ring-teal-400 text-sm text-white`
  const labelClass = `text-xs text-white/60 mb-1 block`

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <Navbar />

      <div className="relative z-10 flex items-center justify-center
                      min-h-screen py-24 px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20
                        rounded-2xl p-8 w-full max-w-lg text-white">

          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-white/60 text-sm mb-2">
                Your booking request has been sent to available workers.
              </p>
              <p className="text-white/40 text-xs mb-8">
                You'll get a notification once a worker accepts your request.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => navigate('/customer/dashboard')}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                             rounded-xl text-sm font-semibold transition-all">
                  View My Bookings
                </button>
                <button onClick={() => navigate('/Services')}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20
                             rounded-xl text-sm transition-all">
                  Book Another
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Link to="/Services"
                  className="text-white/50 hover:text-white text-sm transition-all">
                  ← Back
                </Link>
                <div>
                  <h2 className="text-2xl font-bold">Book a Service</h2>
                  <p className="text-white/50 text-xs mt-0.5">
                    Fill in the details to place your booking
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Service Type */}
                <div>
                  <label className={labelClass}>
                    Service Type <span className="text-red-400">*</span>
                  </label>
                  <select name="service_type" value={form.service_type}
                    onChange={handle}
                    className={`${inputClass} bg-gray-800/60`}>
                    <option value="">Select a service...</option>
                    {SERVICE_LIST.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className={labelClass}>
                    Service Location <span className="text-red-400">*</span>
                  </label>
                  <input name="location" type="text"
                    placeholder="e.g. No. 15, Kandy Road, Colombo"
                    value={form.location} onChange={handle}
                    className={inputClass} />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelClass}>
                    Contact Number <span className="text-red-400">*</span>
                  </label>
                  <input name="phone" type="tel"
                    placeholder="07X XXX XXXX"
                    value={form.phone} onChange={handle}
                    className={inputClass} />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Date <span className="text-red-400">*</span>
                    </label>
                    <input name="date" type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.date} onChange={handle}
                      className={`${inputClass} [color-scheme:dark]`} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Time <span className="text-red-400">*</span>
                    </label>
                    <input name="time" type="time"
                      value={form.time} onChange={handle}
                      className={`${inputClass} [color-scheme:dark]`} />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className={labelClass}>
                    Payment Method <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'cash',   label: '💵 Cash',   },
                      { value: 'card',   label: '💳 Card',   },
                      { value: 'online', label: '📱 Online', },
                    ].map((p) => (
                      <button key={p.value} type="button"
                        onClick={() => setForm(f => ({...f, payment_method: p.value}))}
                        className={`py-2.5 rounded-xl text-sm font-medium
                                    transition-all border
                          ${form.payment_method === p.value
                            ? 'bg-teal-500 border-teal-400 text-white'
                            : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
                          }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelClass}>
                    Additional Notes (optional)
                  </label>
                  <textarea name="notes" rows={3}
                    placeholder="e.g. Please bring your own tools. Gate code is 1234."
                    value={form.notes} onChange={handle}
                    className={`${inputClass} resize-none`} />
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center">{error}</p>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600
                             rounded-xl font-semibold text-sm transition-all
                             disabled:opacity-50 mt-2">
                  {loading ? 'Placing Booking...' : '✅ Confirm Booking'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingForm