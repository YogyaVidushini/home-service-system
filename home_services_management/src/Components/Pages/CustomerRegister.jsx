import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../Navbar'
import HVid from "../../assets/HVid.mp4"
import axios from 'axios'

function CustomerRegister() {
  const [form, setForm] = useState({
    username: '', fullName: '', email: '', phone: '',
    address: '', password: '', confirmPassword: '',
    profilePhoto: null,
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    const { name, value, files } = e.target
    setForm((p) => ({ ...p, [name]: files ? files[0] : value }))
  }

  // ✅ Now sends data to Laravel API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.username || !form.fullName || !form.email ||
        !form.phone || !form.address || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('username',              form.username)
      data.append('fullName',              form.fullName)
      data.append('email',                 form.email)
      data.append('phone',                 form.phone)
      data.append('address',               form.address)
      data.append('password',              form.password)
      data.append('password_confirmation', form.confirmPassword)
      if (form.profilePhoto) data.append('profilePhoto', form.profilePhoto)

      await axios.post('http://localhost:8001/api/register/customer', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 rounded-xl bg-white/20
                      placeholder-white/40 focus:outline-none focus:ring-2
                      focus:ring-teal-400 text-sm`
  const labelClass = `text-xs text-white/60 mb-1 block`

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <Navbar />

      <div className="relative z-10 flex items-center justify-center
                      min-h-screen py-24 px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20
                        rounded-2xl p-8 w-full max-w-md text-white">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link to="/Register"
              className="text-white/50 hover:text-white text-sm transition-all">
              ← Back
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Customer Registration</h2>
              <p className="text-white/50 text-xs mt-0.5">
                Create your account to book home services
              </p>
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Account Created!</h3>
              <p className="text-white/60 text-sm mb-6">
                Welcome to HomeService. You can now book services.
              </p>
              <Link to="/login"
                className="inline-block px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                           rounded-xl text-sm font-semibold transition-all">
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ✅ NEW — Username */}
              <div>
                <label className={labelClass}>
                  Username <span className="text-red-400">*</span>
                </label>
                <input name="username" type="text" placeholder="e.g. john.perera"
                  value={form.username} onChange={handle} className={inputClass} />
                <p className="text-white/30 text-xs mt-1">Used to log in</p>
              </div>

              {/* Full Name */}
              <div>
                <label className={labelClass}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input name="fullName" type="text" placeholder="John Perera"
                  value={form.fullName} onChange={handle} className={inputClass} />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input name="email" type="email" placeholder="john@email.com"
                  value={form.email} onChange={handle} className={inputClass} />
              </div>

              {/* Phone */}
              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input name="phone" type="tel" placeholder="07X XXX XXXX"
                  value={form.phone} onChange={handle} className={inputClass} />
              </div>

              {/* Address */}
              <div>
                <label className={labelClass}>
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea name="address" placeholder="No. 12, Main Street, Colombo"
                  value={form.address} onChange={handle} rows={2}
                  className={`${inputClass} resize-none`} />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>
                  Password <span className="text-red-400">*</span>
                </label>
                <input name="password" type="password" placeholder="Min. 8 characters"
                  value={form.password} onChange={handle} className={inputClass} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClass}>
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input name="confirmPassword" type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={handle}
                  className={inputClass} />
              </div>

              {/* Profile Photo */}
              <div>
                <label className={labelClass}>Profile Photo (optional)</label>
                <input name="profilePhoto" type="file" accept="image/*"
                  onChange={handle}
                  className="w-full text-sm text-white/60 file:mr-3 file:py-1.5
                             file:px-4 file:rounded-lg file:border-0 file:text-xs
                             file:bg-white/20 file:text-white hover:file:bg-white/30
                             cursor-pointer" />
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600
                           rounded-xl font-semibold text-sm transition-all mt-2
                           disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-white/50 text-xs">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-300 hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerRegister