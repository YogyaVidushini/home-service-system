import React from 'react';
import HVid from "../assets/HVid.mp4";
import { Link } from 'react-router-dom'
import Services from './Pages/Services'

export default function HeroVid() {
    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Bg Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
            >
                <source src={HVid} type="video/mp4" />
            </video>

            {/* Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center px-16">

                {/* Dark gradient overlay — left side only */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Content sits above the overlay */}
                <div className="relative z-10">
                    <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
                        Reliable Home Services <br /> at Your Fingertips
                    </h1>

                    <p className="text-white/80 text-base font-light mt-4 max-w-lg leading-relaxed">
                        From leaky pipes to spotless spaces! Find trusted plumbers, electricians,
                        cleaners, and landscapers in your area. Book in minutes and get the job done right.
                    </p>
<Link
  to="/Services"
  className="mt-8 inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700
             text-white font-semibold rounded-xl transition-all text-sm tracking-wide"
>
  Explore More
</Link>
                </div>

            </div>
            
        </div>

    )
}

