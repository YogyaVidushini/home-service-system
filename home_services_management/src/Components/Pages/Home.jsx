import React from 'react'
import Navbar from '../Navbar'
import HeroVid from '../HeroVid'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="bg-gray-950 text-white">
      <Navbar />
      <HeroVid />

      {/* ── ABOUT — image background ── */}
      <section
        className="relative px-16 py-20 overflow-hidden min-h-screen flex flex-col justify-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/75" />
        <div className="relative z-10">

          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-2">
            About Us
          </p>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold leading-snug mb-4">
                Trusted Home Services <br /> You Can Rely On
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                We connect homeowners with skilled, verified professionals for every
                home need. From plumbing and electrical work to cleaning and landscaping
                — we make booking simple, fast, and stress-free.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {[
                  { num: '255+', label: 'Projects Done' },
                  { num: '180+', label: 'Happy Clients' },
                  { num: '50+', label: 'Expert Workers' },
                  { num: '5★', label: 'Average Rating' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-extrabold text-white">{s.num}</p>
                    <p className="text-white/50 text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <Link to="/Services"
                className="inline-block px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                           text-white text-sm font-semibold rounded-xl transition-all">
                Contact Us
              </Link>
            </div>

            <div className="md:w-1/2 grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
              ].map((src, i) => (
                <img key={i} src={src} alt="service"
                  className="rounded-xl object-cover w-full h-36 hover:scale-105
                             transition-transform duration-300" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — image background ── */}
      <section className="relative px-16 py-20 overflow-hidden min-h-screen flex flex-col justify-center">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/vid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />

        {/* ✅ FIX: increased gap from gap-12 to gap-20, added pl-16 to right column */}
        <div className="relative z-10 flex flex-col md:flex-row gap-20 items-center">

          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1484154218962-a197022b5858?w=700&q=80"
              alt="how it works"
              className="rounded-2xl object-cover w-full h-80"
            />
          </div>

          <div className="md:w-1/2 pl-16">
            <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-2">
              How It Works
            </p>
            <h2 className="text-3xl font-bold mb-8">Book a Service in 4 Easy Steps</h2>

            {[
              { step: '01', title: 'Choose a Service', desc: 'Browse our list of professional home services available in your area.' },
              { step: '02', title: 'Pick a Worker', desc: 'View profiles, ratings, and reviews to find your perfect match.' },
              { step: '03', title: 'Book & Confirm', desc: 'Select a time slot that works for you and confirm instantly.' },
              { step: '04', title: 'Get It Done', desc: 'Our verified professional arrives on time and completes the job.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 mb-6">
                <span className="text-teal-400 font-extrabold text-lg w-8 shrink-0">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

            <Link to="/Services"
              className="inline-block mt-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600
                         text-white text-sm font-semibold rounded-xl transition-all">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* ── RATINGS — vid2.mp4 background ── */}
      <section className="relative px-16 py-20 overflow-hidden min-h-screen flex flex-col justify-center">
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/vid2.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10">
          <div className="text-center mb-12">
            <p className="text-teal-400 text-md font-semibold uppercase tracking-widest mb-2">
              Ratings And Reviews
            </p>
            <h2 className="text-3xl font-bold">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah M.', role: 'Homeowner', rating: 5, review: 'Absolutely fantastic service! The plumber arrived on time and fixed everything perfectly.' },
              { name: 'James K.', role: 'Property Manager', rating: 5, review: 'Managing multiple properties is so much easier now. Workers are professional and reliable.' },
              { name: 'Priya R.', role: 'First-time User', rating: 4, review: 'Really impressed with how easy the booking was. The electrician was skilled and polite.' },
            ].map((t) => (
              <div key={t.name}
                className="bg-white/10 backdrop-blur-sm border border-white/20
                           rounded-2xl p-6 hover:border-teal-400/40 transition-all">
                <div className="flex mb-3">
                  {Array(t.rating).fill(0).map((_, i) => (
                    <span key={i} className="text-teal-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{t.review}"</p>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-white/40 text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 border-t border-white/10 px-16 py-8
                         flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white font-bold text-lg">
          Home<span className="text-teal-400">Service</span>
        </p>
       {/*<p className="text-white/40 text-xs">© 2025 HomeService. All rights reserved.</p>*/}
        <div className="flex space-x-6 text-xs text-white/50">
          <Link to="/Services" className="hover:text-teal-400">Services</Link>
          <Link to="/login" className="hover:text-teal-400">Login</Link>
          <Link to="/Register" className="hover:text-teal-400">Register</Link>
        </div>
      </footer>

    </div>
  )
}

export default Home