import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import HVid from '../../assets/HVid.mp4'
import { useApp } from '../../context/AppContext'
import axios from 'axios'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useApp()
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('http://localhost:8001/api/login', {
        username, password
      })

      login(res.data.user, res.data.token)

      // Redirect based on role
      if (res.data.role === 'admin')    navigate('/admin/dashboard')
      if (res.data.role === 'worker')   navigate('/worker/dashboard')
      if (res.data.role === 'customer') navigate('/customer/dashboard')

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-50"><Navbar /></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 
                        rounded-2xl p-8 w-80 text-white">

          <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-lg bg-white/20 
                         placeholder-white/60 focus:outline-none focus:ring-2 
                         focus:ring-blue-400" />

            <input type="password" placeholder="Password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-lg bg-white/20 
                         placeholder-white/60 focus:outline-none focus:ring-2 
                         focus:ring-blue-400" />

            {error && (
              <p className="text-red-400 text-xs text-center mb-4">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 
                         rounded-lg font-semibold transition-all disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/60 text-sm mt-4">
            No account?{' '}
            <Link to="/Register" className="text-blue-300 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login