import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../Navbar'
import HVid from "../../assets/HVid.mp4"

function Register() {
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Choice cards */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">

        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Create an Account
        </h2>
        <p className="text-white/60 text-sm mb-10 text-center">
          Choose how you want to join HomeService
        </p>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">

          {/* Customer card */}
          <Link to="/register/customer"
            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                       border border-white/20 hover:border-teal-400 rounded-2xl 
                       p-8 text-white text-center transition-all group">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">I'm a Customer</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Looking for reliable home services? Create an account to book
              trusted professionals in your area.
            </p>
            <div className="mt-6 px-4 py-2 bg-teal-500 group-hover:bg-teal-600 
                            rounded-xl text-sm font-semibold transition-all">
              Register as Customer
            </div>
          </Link>

          {/* Worker card */}
          <Link to="/register/worker"
            className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md 
                       border border-white/20 hover:border-blue-400 rounded-2xl 
                       p-8 text-white text-center transition-all group">
            <div className="text-5xl mb-4">🔧</div>
            <h3 className="text-xl font-bold mb-2">I'm a Worker</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Skilled professional? Join our platform to find work, manage
              bookings, and grow your business.
            </p>
            <div className="mt-6 px-4 py-2 bg-blue-600 group-hover:bg-blue-700 
                            rounded-xl text-sm font-semibold transition-all">
              Register as Worker
            </div>
          </Link>

        </div>

        <p className="text-white/50 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-300 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Register