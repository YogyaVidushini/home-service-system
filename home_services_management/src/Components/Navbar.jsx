import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4
                    bg-black/40 backdrop-blur-md fixed top-0 left-0 w-full z-50">

      {/* Logo */}
      <h1 className="text-xl font-bold text-white tracking-wide">
        Home<span className="text-teal-400">Service</span>
      </h1>

      {/* Nav Links */}
      <div className="hidden md:flex space-x-8 text-sm text-white/80">
        <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
        <Link to="/Services" className="hover:text-teal-400 transition-colors">Services</Link>
        {!user && (
          <Link to="/register/worker" className="hover:text-teal-400 transition-colors">
            Join as a Worker
          </Link>
        )}
        <Link to="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
      </div>

      {/* Right side — show based on login state */}
      <div className="hidden md:flex items-center space-x-3">

        {user ? (
          // ✅ User is logged in — show welcome + dashboard + logout
          <>
            <span className="text-white/60 text-sm">
              👤 <span className="text-teal-400 font-medium">{user.username}</span>
            </span>

            {/* Link to their dashboard based on role */}
            <Link
              to={
                user.role === 'admin' ? '/admin/dashboard' :
                  user.role === 'worker' ? '/worker/dashboard' :
                    '/customer/dashboard'
              }
              className="px-4 py-1.5 text-sm text-white border border-white/30
                         rounded-full hover:border-teal-400 hover:text-teal-400
                         transition-all">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30
                         text-red-400 border border-red-500/30 rounded-full
                         transition-all">
              Logout
            </button>
          </>
        ) : (
          // ✅ Not logged in — show Sign Up + Login
          <>
            <Link to="/Register"
              className="px-4 py-1.5 text-sm text-white border border-white/40
                         rounded-full hover:border-teal-400 hover:text-teal-400
                         transition-all">
              Sign Up
            </Link>
            <Link to="/login"
              className="px-4 py-1.5 text-sm bg-teal-500 hover:bg-teal-600
                         text-white rounded-full transition-all font-medium">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar