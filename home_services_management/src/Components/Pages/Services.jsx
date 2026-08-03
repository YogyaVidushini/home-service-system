import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../Navbar'
import HVid from '../../assets/HVid.mp4'
import { useApp } from '../../context/AppContext'

const services = [
  { id: 1, title: 'Plumbing',             icon: '🔧', color: 'from-blue-500 to-blue-700',
    description: 'Fix leaks, unclog drains, repair pipes, and handle all your plumbing needs.' },
  { id: 2, title: 'Cleaning',             icon: '🧹', color: 'from-green-500 to-green-700',
    description: 'Professional deep cleaning, regular housekeeping for any space.' },
  { id: 3, title: 'Garden Maintaining',   icon: '🌿', color: 'from-emerald-500 to-emerald-700',
    description: 'Lawn mowing, pruning, weeding, planting, and full garden upkeep.' },
  { id: 4, title: 'Grocery Buying',       icon: '🛒', color: 'from-yellow-500 to-yellow-600',
    description: 'We shop and deliver your groceries fresh to your door!' },
  { id: 5, title: 'Painting',             icon: '🖌️', color: 'from-orange-400 to-orange-600',
    description: 'Interior and exterior painting with clean finishes.' },
  { id: 6, title: 'Furniture Assembly',   icon: '🪑', color: 'from-amber-500 to-amber-700',
    description: 'Our experts assemble any flat-pack furniture quickly.' },
  { id: 7, title: 'Common Home Services', icon: '🏠', color: 'from-purple-500 to-purple-700',
    description: 'Handyman repairs and everyday home tasks by trusted professionals.' },
]

function Services() {
  const { user } = useApp()
  const navigate = useNavigate()

  const handleBook = (serviceTitle) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'customer') {
      alert('Only customers can book services.')
      return
    }
    navigate(`/booking/${encodeURIComponent(serviceTitle)}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0">
        <video src={HVid} autoPlay loop muted playsInline
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-24">
        <div className="py-12 px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Our Services
          </h1>
          <p className="text-white/70 mt-3 text-base max-w-xl mx-auto leading-relaxed">
            Trusted professionals for every corner of your home.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-14
                        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id}
              className="bg-white/10 backdrop-blur-md border border-white/20
                         rounded-2xl overflow-hidden hover:border-white/40
                         hover:scale-105 transition-all duration-300">
              <div className={`bg-gradient-to-r ${service.color} p-6
                               flex items-center gap-4`}>
                <span className="text-4xl">{service.icon}</span>
                <h2 className="text-xl font-bold text-white">{service.title}</h2>
              </div>
              <div className="p-6">
                <p className="text-white/70 text-sm leading-relaxed">
                  {service.description}
                </p>
                <button
                  onClick={() => handleBook(service.title)}
                  className="mt-6 block text-center w-full py-2.5 bg-teal-500
                             hover:bg-teal-600 text-white text-sm font-semibold
                             rounded-xl transition-all">
                  {user?.role === 'customer' ? 'Book Now' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Services