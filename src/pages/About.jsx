import React from 'react';
import profileImg from '../assets/Omkar.jpg';

export default function About() {
  return (
    <div className="relative w-full min-h-screen text-white flex flex-col justify-end overflow-hidden animate-[fadeIn_1s_ease-out]">

      {/* Dynamic Background Gradients: Heavily blurred version of the image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        <img
          src={profileImg}
          alt=""
          className="w-full h-full object-cover blur-[120px] opacity-70 scale-125 transform"
        />
        {/* Subtle dark wash */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero Image properly masked to blend flawlessly */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none mt-12">
        {/* Increased size to fill the screen better */}
        <div className="relative w-[100vw] h-[100vh]">
          <img
            src={profileImg}
            alt="Omkar Jois"
            className="w-full h-full object-cover object-top md:object-center"
            style={{
              maskImage: 'radial-gradient(ellipse at center, black 80%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 90%)'
            }}
          />
        </div>
      </div>

      {/* Content Overlay with Upward Dark Gradient */}
      <div className="relative z-10 w-full mt-auto">
        {/* Gradient background fading upwards to protect text */}
        <div className="w-full pt-64 pb-12 md:pb-20 px-6 md:px-12 lg:px-24 bg-gradient-to-t from-[#020402] via-[#020402]/50 to-transparent flex items-center justify-center">
          <div className="max-w-3xl text-center">
            <p className="text-white/95 text-sm md:text-base lg:text-lg leading-relaxed mb-6 font-regular drop-shadow-md">
              I am not great with words. That's why I take photos. For over a decade, I have been traversing the deepest jungles and the most arid landscapes to document the raw, unfiltered essence of the natural world.  My work is less about capturing an animal and more about capturing a moment—a fleeting interaction between predator and prey, the dramatic play of light through a dense canopy, or the silent, powerful gaze of a tiger in the grass.
            </p>

            {/* Stats Section */}
            <div className="flex gap-8 md:gap-16 justify-center border-t border-white/20 pt-8">
              <div>
                <h4 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-lg">10+</h4>
                <p className="text-[10px] tracking-[0.2em] text-white/70 uppercase drop-shadow-md">Years Exp</p>
              </div>
              <div>
                <h4 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-lg">15</h4>
                <p className="text-[10px] tracking-[0.2em] text-white/70 uppercase drop-shadow-md">Countries</p>
              </div>
              <div>
                <h4 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 drop-shadow-lg">3</h4>
                <p className="text-[10px] tracking-[0.2em] text-white/70 uppercase drop-shadow-md">Awards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}





