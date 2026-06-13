import React from 'react';

export default function About() {
  return (
    <div className="w-full min-h-screen bg-black text-white pt-32 pb-20 px-6 md:px-12 lg:px-24 flex flex-col md:flex-row items-center gap-12 lg:gap-24 animate-[fadeIn_1s_ease-out] overflow-y-auto">
      <div className="md:w-1/2 flex flex-col justify-center">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-white/50 mb-4 uppercase">The Observer</p>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-none">BEHIND<br/>THE LENS</h1>
        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6 max-w-xl font-light">
          I am not great with words. That's why I take photos. For over a decade, I have been traversing the deepest jungles and the most arid landscapes to document the raw, unfiltered essence of the natural world.
        </p>
        <p className="text-white/70 text-base md:text-lg leading-relaxed mb-12 max-w-xl font-light">
          My work is less about capturing an animal and more about capturing a moment—a fleeting interaction between predator and prey, the dramatic play of light through a dense canopy, or the silent, powerful gaze of a tiger in the grass.
        </p>
        <div className="flex gap-12 border-t border-white/20 pt-8">
          <div>
            <h4 className="text-4xl font-light tracking-tight mb-2">10+</h4>
            <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">Years Exp</p>
          </div>
          <div>
            <h4 className="text-4xl font-light tracking-tight mb-2">15</h4>
            <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">Countries</p>
          </div>
          <div>
            <h4 className="text-4xl font-light tracking-tight mb-2">3</h4>
            <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">Awards</p>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 w-full h-[60vh] md:h-[80vh] relative overflow-hidden group border border-white/10">
        <img 
          src="https://images.unsplash.com/photo-1552168324-d612d77725e3?auto=format&fit=crop&q=80&w=1200" 
          alt="Photographer in the wild" 
          className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1500ms]"
        />
      </div>
    </div>
  );
}
