import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function AlbumPanel({ album, isActive, onClick, onViewAlbum }) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer group
        transition-[flex-grow,flex-basis] duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)]
        border-b md:border-b-0 md:border-r border-white/10 last:border-none
        ${isActive
          ? 'flex-[6] md:flex-[5] lg:flex-[6]'
          : 'flex-[1] hover:flex-[2] md:hover:flex-[2]'
        }
      `}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms] ease-out
          ${isActive ? 'scale-105' : 'scale-100 group-hover:scale-[1.02]'}
        `}
        style={{ backgroundImage: `url(${album.image})` }}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-700
          ${isActive
            ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/40'
            : 'bg-black/60 group-hover:bg-black/40'
          }
        `}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 lg:p-14">
        <div className={`flex justify-between items-start transition-all duration-700 delay-100
          ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 md:opacity-100 md:translate-y-0'}
        `}>
          {isActive && (
            <div className="hidden md:block">
              <div className="w-[1px] h-24 bg-white/30 mb-4"></div>
            </div>
          )}

          <div className={`text-right transition-all duration-700 ${isActive ? 'scale-100' : 'scale-75 md:scale-100 origin-top-right'}`}>
            <h1 className="text-5xl md:text-8xl lg:text-[120px] font-bold text-white leading-none tracking-tighter opacity-90">
              {album.number}
            </h1>
            {isActive && <p className="text-white/60 text-sm tracking-widest mt-2">[{album.year}]</p>}
          </div>
        </div>

        <div className="flex flex-col justify-end items-start gap-6 w-full z-10">
          <div>
            <p className="text-xs md:text-sm font-semibold tracking-[0.2em] text-white/60 mb-2 uppercase">
              {album.genre}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-2 flex items-center gap-4">
              {album.title}
              {!isActive && <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity md:hidden" />}
            </h2>

            <div className={`h-[2px] bg-white transition-all duration-700 mt-4
              ${isActive ? 'w-0 opacity-0' : 'w-12 opacity-100'}
            `}></div>
          </div>

          <div className={`
              max-w-xl transition-all duration-[800ms] delay-200
              ${isActive
              ? 'opacity-100 translate-y-0 max-h-[500px]'
              : 'opacity-0 translate-y-4 max-h-0 overflow-hidden pointer-events-none'
            }
            `}
          >
            <p className="text-sm text-white/85 leading-relaxed font-light mb-6">
              {album.description}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewAlbum();
              }}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white border border-white/30 px-6 py-4 hover:bg-white hover:text-black transition-colors w-fit flex gap-6 items-center group/btn"
            >
              Explore Story
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
