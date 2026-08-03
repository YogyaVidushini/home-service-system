import React, { useState } from 'react'
import Navbar from '../Navbar'
import HVid from '../../assets/HVid.mp4'
import axios from 'axios'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('http://localhost:8001/api/contact', form)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <Navbar />

      <div className="relative z-10 px-8 pt-32 pb-16 max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="text-white/50 text-sm mt-2">
            Questions, feedback, or partnership requests — we'd like to hear from you.
          </p>
        </div>

        {/* Emergency callout — routes urgent cases to the right place */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 mb-8
                        flex items-center justify-between flex-wrap gap-3">
          <p className="text-red-300 text-sm">
            🚨 Have an active booking emergency? This form isn't monitored in real time —
            use the <span className="font-semibold">Emergency</span> button on your
            booking in the dashboard instead for immediate admin alert.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Contact info */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20
                          rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-lg mb-2">Contact Information</h3>

            <div>
              <p className="text-white/40 text-xs">📧 Email</p>
              <p className="text-white text-sm mt-1">support@homeservice.lk</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">📞 Phone</p>
              <p className="text-white text-sm mt-1">+94 11 234 5678</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">📍 Address</p>
              <p className="text-white text-sm mt-1">
                42 Galle Road, Colombo 03, Sri Lanka
              </p>
            </div>
            <div>
              <p className="text-white/40 text-xs">🕐 Hours</p>
              <p className="text-white text-sm mt-1">
                Mon – Sat, 8:00 AM – 8:00 PM
              </p>
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20
                          rounded-2xl p-6">
            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h4 className="text-lg font-bold mb-1">Message sent</h4>
                <p className="text-white/50 text-sm mb-5">
                  Thanks for reaching out — we'll get back to you soon.
                </p>
                <button onClick={() => setSent(false)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20
                             rounded-xl text-sm transition-all">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Your name" required
                  value={form.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                             border-white/20 text-sm focus:outline-none
                             focus:ring-2 focus:ring-teal-400 placeholder-white/30" />

                <input name="email" type="email" placeholder="Your email" required
                  value={form.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                             border-white/20 text-sm focus:outline-none
                             focus:ring-2 focus:ring-teal-400 placeholder-white/30" />

                <input name="subject" placeholder="Subject" required
                  value={form.subject} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                             border-white/20 text-sm focus:outline-none
                             focus:ring-2 focus:ring-teal-400 placeholder-white/30" />

                <textarea name="message" placeholder="Your message" required rows={4}
                  value={form.message} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border
                             border-white/20 text-sm resize-none focus:outline-none
                             focus:ring-2 focus:ring-teal-400 placeholder-white/30" />

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button type="submit" disabled={loading}
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-600
                             rounded-xl font-semibold text-sm transition-all
                             disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact