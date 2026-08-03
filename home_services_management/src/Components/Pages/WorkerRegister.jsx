import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../Navbar'
import HVid from "../../assets/HVid.mp4"
import axios from 'axios'

const SERVICE_CATEGORIES = [
  'Plumber', 'Electrician', 'Cleaner', 'Landscaper / Gardener',
  'Painter', 'Carpenter', 'AC Technician', 'Pest Control', 'Other',
]

function WorkerRegister() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    username: '', fullName: '', email: '', phone: '', nic: '',
    address: '', serviceCategory: '', experience: '',
    password: '', confirmPassword: '',
    nicFront: null, nicBack: null,
    policeReport: null, otherDocs: null,
    bankName: '', accountNumber: '', accountHolder: '', branch: '',
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    const { name, value, files } = e.target
    setForm((p) => ({ ...p, [name]: files ? files[0] : value }))
  }

  const handleStep1 = (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.fullName || !form.email || !form.phone ||
        !form.nic || !form.address || !form.serviceCategory || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.nicFront || !form.nicBack || !form.policeReport) {
      setError('Please upload NIC (front & back) and Police Report.')
      return
    }
    if (!form.bankName || !form.accountNumber || !form.accountHolder || !form.branch) {
      setError('Please fill in all bank details.')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('username',              form.username)
      data.append('fullName',              form.fullName)
      data.append('email',                 form.email)
      data.append('phone',                 form.phone)
      data.append('nic',                   form.nic)
      data.append('address',               form.address)
      data.append('serviceCategory',       form.serviceCategory)
      data.append('experience',            form.experience || 0)
      data.append('password',              form.password)
      data.append('password_confirmation', form.confirmPassword)
      data.append('nicFront',              form.nicFront)
      data.append('nicBack',               form.nicBack)
      data.append('policeReport',          form.policeReport)
      if (form.otherDocs) data.append('otherDocs', form.otherDocs)
      data.append('bankName',              form.bankName)
      data.append('accountNumber',         form.accountNumber)
      data.append('accountHolder',         form.accountHolder)
      data.append('branch',                form.branch)

      await axios.post('http://localhost:8001/api/register/worker', data, {
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
                      focus:ring-blue-400 text-sm`
  const labelClass = `text-xs text-white/60 mb-1 block`
  const fileClass  = `w-full text-sm text-white/60 file:mr-3 file:py-1.5
                      file:px-4 file:rounded-lg file:border-0 file:text-xs
                      file:bg-white/20 file:text-white hover:file:bg-white/30 cursor-pointer`

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-50"><Navbar /></div>

      <div className="relative z-10 flex items-center justify-center
                      min-h-screen py-24 px-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20
                        rounded-2xl p-8 w-full max-w-lg text-white">

          <div className="flex items-center gap-3 mb-2">
            {step === 2 ? (
              <button onClick={() => setStep(1)}
                className="text-white/50 hover:text-white text-sm transition-all">
                ← Back
              </button>
            ) : (
              <Link to="/Register"
                className="text-white/50 hover:text-white text-sm transition-all">
                ← Back
              </Link>
            )}
            <div>
              <h2 className="text-2xl font-bold">Worker Registration</h2>
              <p className="text-white/50 text-xs mt-0.5">
                Join HomeService as a verified professional
              </p>
            </div>
          </div>

          {!success && (
            <div className="flex items-center gap-2 mb-6 mt-4">
              <div className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 1 ? 'bg-blue-500' : 'bg-white/20'}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 2 ? 'bg-blue-500' : 'bg-white/20'}`} />
              <span className="text-white/50 text-xs ml-1">Step {step}/2</span>
            </div>
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Application Submitted!</h3>
              <p className="text-white/60 text-sm mb-2">Your account is under review.</p>
              <p className="text-white/40 text-xs mb-6">
                We'll notify you within 2–3 business days.
              </p>
              <Link to="/login"
                className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700
                           rounded-xl text-sm font-semibold transition-all">
                Go to Login
              </Link>
            </div>

          ) : step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">

              <div>
                <label className={labelClass}>
                  Username <span className="text-red-400">*</span>
                </label>
                <input name="username" type="text" placeholder="e.g. kamal.bandara"
                  value={form.username} onChange={handle} className={inputClass} />
                <p className="text-white/30 text-xs mt-1">Used to log in</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input name="fullName" type="text" placeholder="Kamal Perera"
                    value={form.fullName} onChange={handle} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    NIC Number <span className="text-red-400">*</span>
                  </label>
                  <input name="nic" type="text" placeholder="XXXXXXXXXV"
                    value={form.nic} onChange={handle} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input name="email" type="email" placeholder="kamal@email.com"
                    value={form.email} onChange={handle} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input name="phone" type="tel" placeholder="07X XXX XXXX"
                    value={form.phone} onChange={handle} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea name="address" placeholder="No. 5, Galle Road, Kandy"
                  value={form.address} onChange={handle} rows={2}
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Service Category <span className="text-red-400">*</span>
                  </label>
                  <select name="serviceCategory" value={form.serviceCategory}
                    onChange={handle} className={`${inputClass} bg-gray-800/60`}>
                    <option value="">Select...</option>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input name="experience" type="number" placeholder="e.g. 3"
                    min="0" max="50" value={form.experience} onChange={handle}
                    className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Password <span className="text-red-400">*</span>
                  </label>
                  <input name="password" type="password" placeholder="Min. 8 chars"
                    value={form.password} onChange={handle} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input name="confirmPassword" type="password" placeholder="Re-enter"
                    value={form.confirmPassword} onChange={handle} className={inputClass} />
                </div>
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                           rounded-xl font-semibold text-sm transition-all">
                Continue to Documents →
              </button>

              <p className="text-center text-white/50 text-xs">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-300 hover:underline">Sign In</Link>
              </p>
            </form>

          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-white/60 text-xs bg-blue-500/10 border border-blue-400/20
                            rounded-xl px-4 py-2.5 leading-relaxed">
                📋 All documents must be clear, valid JPG/PNG/PDF format.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    NIC — Front <span className="text-red-400">*</span>
                  </label>
                  <input name="nicFront" type="file" accept="image/*,.pdf"
                    onChange={handle} className={fileClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    NIC — Back <span className="text-red-400">*</span>
                  </label>
                  <input name="nicBack" type="file" accept="image/*,.pdf"
                    onChange={handle} className={fileClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Police Clearance Report <span className="text-red-400">*</span>
                </label>
                <input name="policeReport" type="file" accept="image/*,.pdf"
                  onChange={handle} className={fileClass} />
              </div>

              <div>
                <label className={labelClass}>Other Documents (optional)</label>
                <input name="otherDocs" type="file" accept="image/*,.pdf"
                  onChange={handle} className={fileClass} />
                <p className="text-white/30 text-xs mt-1">e.g. Skill certificates</p>
              </div>

              <hr className="border-white/10" />

              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                Bank Account Details
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Bank Name <span className="text-red-400">*</span>
                  </label>
                  <input name="bankName" type="text" placeholder="e.g. BOC"
                    value={form.bankName} onChange={handle} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>
                    Branch <span className="text-red-400">*</span>
                  </label>
                  <input name="branch" type="text" placeholder="e.g. Kandy"
                    value={form.branch} onChange={handle} className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Account Holder Name <span className="text-red-400">*</span>
                </label>
                <input name="accountHolder" type="text" placeholder="As per bank records"
                  value={form.accountHolder} onChange={handle} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>
                  Account Number <span className="text-red-400">*</span>
                </label>
                <input name="accountNumber" type="text" placeholder="XXXX XXXX XXXX"
                  value={form.accountNumber} onChange={handle} className={inputClass} />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                           rounded-xl font-semibold text-sm transition-all
                           disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkerRegister