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

// ── Card number formatter ────────────────────────────────────
function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

// ── Card brand detector ──────────────────────────────────────
function getCardBrand(num) {
  const n = num.replace(/\s/g, '')
  if (n.startsWith('4'))  return { brand: 'VISA',       color: 'from-blue-600 to-blue-800' }
  if (n.startsWith('5'))  return { brand: 'MASTERCARD', color: 'from-red-600 to-orange-600' }
  if (n.startsWith('37')) return { brand: 'AMEX',       color: 'from-green-600 to-teal-700' }
  return { brand: '', color: 'from-gray-700 to-gray-900' }
}

// ── Card Preview Component ───────────────────────────────────
function CardPreview({ card }) {
  const { brand, color } = getCardBrand(card.number)
  const displayNumber = card.number || '•••• •••• •••• ••••'
  const displayName   = card.name   || 'CARDHOLDER NAME'
  const displayExpiry = card.expiry || 'MM/YY'

  return (
    <div className={`relative w-full h-44 rounded-2xl bg-gradient-to-br
                     ${color} p-5 mb-4 overflow-hidden shadow-2xl`}>
      {/* Background circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full
                      bg-white/10" />
      <div className="absolute -bottom-10 -left-4 w-32 h-32 rounded-full
                      bg-white/5" />

      {/* Chip */}
      <div className="w-10 h-7 bg-yellow-400/80 rounded-md mb-4
                      flex items-center justify-center">
        <div className="w-8 h-5 rounded border border-yellow-600/40
                        grid grid-cols-2 gap-px p-0.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-yellow-500/60 rounded-sm" />
          ))}
        </div>
      </div>

      {/* Card number */}
      <p className="text-white font-mono text-lg tracking-widest mb-3">
        {displayNumber}
      </p>

      {/* Bottom row */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-white/50 text-xs uppercase">Card Holder</p>
          <p className="text-white text-sm font-semibold uppercase tracking-wide">
            {displayName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs uppercase">Expires</p>
          <p className="text-white text-sm font-semibold">{displayExpiry}</p>
        </div>
        {brand && (
          <p className="text-white font-bold text-sm tracking-wider">{brand}</p>
        )}
      </div>
    </div>
  )
}

// ── Payment Processing Animation ─────────────────────────────
function PaymentProcessing({ status }) {
  if (status === 'processing') return (
    <div className="text-center py-6">
      <div className="text-5xl mb-3 animate-spin">⚙️</div>
      <p className="text-white font-semibold">Processing Payment...</p>
      <p className="text-white/50 text-xs mt-1">Please wait</p>
      <div className="flex justify-center gap-1 mt-3">
        {[0,1,2].map(i => (
          <div key={i} className={`w-2 h-2 rounded-full bg-teal-400
                                   animate-bounce`}
            style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )

  if (status === 'success') return (
    <div className="text-center py-6">
      <div className="text-5xl mb-3">✅</div>
      <p className="text-green-400 font-bold text-lg">Payment Successful!</p>
      <p className="text-white/50 text-xs mt-1">Confirming your booking...</p>
    </div>
  )

  if (status === 'failed') return (
    <div className="text-center py-6">
      <div className="text-5xl mb-3">❌</div>
      <p className="text-red-400 font-bold text-lg">Payment Failed</p>
      <p className="text-white/50 text-xs mt-1">Please check your card details</p>
    </div>
  )

  return null
}

// ── Main BookingForm ─────────────────────────────────────────
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

  const [card, setCard] = useState({
    number: '', name: '', expiry: '', cvv: '',
  })
  const [showCvv, setShowCvv]       = useState(false)
  const [payStatus, setPayStatus]   = useState(null) // null | processing | success | failed
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [loading, setLoading]       = useState(false)

  const handle = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleCard = (e) => {
    const { name, value } = e.target
    if (name === 'number') {
      setCard(p => ({ ...p, number: formatCardNumber(value) }))
    } else if (name === 'expiry') {
      setCard(p => ({ ...p, expiry: formatExpiry(value) }))
    } else if (name === 'cvv') {
      setCard(p => ({ ...p, cvv: value.replace(/\D/g, '').slice(0, 4) }))
    } else {
      setCard(p => ({ ...p, [name]: value }))
    }
  }

  // Demo card validation
  const validateCard = () => {
    const num = card.number.replace(/\s/g, '')
    if (num.length < 16)         return 'Card number must be 16 digits.'
    if (!card.name.trim())       return 'Cardholder name is required.'
    if (card.expiry.length < 5)  return 'Enter a valid expiry date (MM/YY).'
    if (card.cvv.length < 3)     return 'CVV must be 3-4 digits.'
    // Demo: decline specific test card
    if (num === '4000000000000002') return 'Card declined. Please use a different card.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.service_type || !form.location || !form.phone ||
        !form.date || !form.time) {
      setError('Please fill in all required fields.')
      return
    }

    // Card payment flow
    if (form.payment_method === 'card') {
      const cardError = validateCard()
      if (cardError) { setError(cardError); return }

      setLoading(true)
      setPayStatus('processing')

      // Simulate payment processing (2 seconds)
      await new Promise(r => setTimeout(r, 2000))
      setPayStatus('success')
      await new Promise(r => setTimeout(r, 1000))
    } else {
      setLoading(true)
    }

    // Submit booking to backend
    try {
      await axios.post('http://localhost:8001/api/customer/bookings', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPayStatus(null)
      setSuccess(true)
    } catch (err) {
      setPayStatus('failed')
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Booking failed. Please try again.'
      setError(msg)
      await new Promise(r => setTimeout(r, 2000))
      setPayStatus(null)
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

          {/* ── Success screen ── */}
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
              {form.payment_method === 'card' && (
                <div className="bg-green-500/10 border border-green-500/30
                                rounded-xl px-4 py-3 mb-4 text-sm">
                  <p className="text-green-400 font-semibold">
                    💳 Payment of LKR 500.00 processed successfully
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Transaction ID: TXN{Date.now().toString().slice(-8)}
                  </p>
                </div>
              )}
              <p className="text-white/60 text-sm mb-2">
                Your booking request has been sent to available workers.
              </p>
              <p className="text-white/40 text-xs mb-8">
                You'll get a notification once a worker accepts.
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

          ) : payStatus ? (
            /* ── Payment processing screen ── */
            <PaymentProcessing status={payStatus} />

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

                {/* Payment Method — only Cash and Card */}
                <div>
                  <label className={labelClass}>
                    Payment Method <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'cash', label: '💵 Cash on Arrival' },
                      { value: 'card', label: '💳 Pay by Card'     },
                    ].map((p) => (
                      <button key={p.value} type="button"
                        onClick={() => setForm(f => ({
                          ...f, payment_method: p.value
                        }))}
                        className={`py-3 rounded-xl text-sm font-medium
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

                {/* ── Card Details — shown when card selected ── */}
                {form.payment_method === 'card' && (
                  <div className="space-y-3 pt-1">

                    <p className="text-teal-400 text-xs font-semibold
                                  uppercase tracking-widest">
                      💳 Card Details
                    </p>

                    {/* Live card preview */}
                    <CardPreview card={card} />

                    {/* Card Number */}
                    <div>
                      <label className={labelClass}>
                        Card Number <span className="text-red-400">*</span>
                      </label>
                      <input name="number" type="text"
                        placeholder="1234 5678 9012 3456"
                        value={card.number} onChange={handleCard}
                        maxLength={19}
                        className={`${inputClass} font-mono tracking-widest`} />
                    </div>

                    {/* Name */}
                    <div>
                      <label className={labelClass}>
                        Cardholder Name <span className="text-red-400">*</span>
                      </label>
                      <input name="name" type="text"
                        placeholder="As it appears on the card"
                        value={card.name} onChange={handleCard}
                        className={`${inputClass} uppercase`} />
                    </div>

                    {/* Expiry + CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Expiry Date <span className="text-red-400">*</span>
                        </label>
                        <input name="expiry" type="text"
                          placeholder="MM/YY"
                          value={card.expiry} onChange={handleCard}
                          maxLength={5}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>
                          CVV <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input name="cvv"
                            type={showCvv ? 'text' : 'password'}
                            placeholder="•••"
                            value={card.cvv} onChange={handleCard}
                            maxLength={4}
                            className={`${inputClass} pr-10`} />
                          <button type="button"
                            onClick={() => setShowCvv(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                                       text-white/40 hover:text-white text-xs">
                            {showCvv ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Demo hint */}
                    <div className="bg-blue-500/10 border border-blue-400/20
                                    rounded-xl px-3 py-2.5">
                      <p className="text-blue-300 text-xs font-semibold mb-1">
                        🧪 Demo Test Cards:
                      </p>
                      <p className="text-white/50 text-xs">
                        ✅ Success: <span className="font-mono">4111 1111 1111 1111</span>
                      </p>
                      <p className="text-white/50 text-xs">
                        ❌ Declined: <span className="font-mono">4000 0000 0000 0002</span>
                      </p>
                      <p className="text-white/40 text-xs mt-1">
                        Any name, future expiry, any CVV
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className={labelClass}>
                    Additional Notes (optional)
                  </label>
                  <textarea name="notes" rows={2}
                    placeholder="e.g. Please bring your own tools."
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
                  {loading
                    ? 'Processing...'
                    : form.payment_method === 'card'
                      ? '💳 Pay & Confirm Booking'
                      : '✅ Confirm Booking'}
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