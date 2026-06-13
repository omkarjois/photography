import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';

export default function Portfolio() {
  const { albums, loading } = useGallery();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
          Loading Portfolio
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white pt-32 pb-20 px-6 md:px-12 lg:px-24 animate-[fadeIn_1s_ease-out] overflow-y-auto">
      <div className="flex justify-between items-end mb-24 border-b border-white/20 pb-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">THE ARCHIVE</h1>
        <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase hidden md:block">Complete Collection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
        {albums.map((album) => (
          <div
            key={album.id}
            className="group cursor-pointer flex flex-col"
            onClick={() => navigate(`/portfolio/${album.id}`)}
          >
            <div className="relative aspect-[3/4] overflow-hidden mb-6 border border-white/10">
              <img
                src={album.image}
                alt={album.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[1200ms]"
              />
              <div className="absolute top-4 right-4 bg-black/80 px-3 py-1 text-[10px] tracking-[0.2em]">
                {album.year}
              </div>

              {/* View Project Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-white px-6 py-3 flex items-center gap-2">
                  View Story <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-white/50 mb-2 uppercase">{album.genre}</p>
                <h3 className="text-2xl font-light tracking-tight group-hover:text-white/80 transition-colors">{album.title}</h3>
              </div>
              <p className="text-3xl font-light text-white/20">{album.number}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
