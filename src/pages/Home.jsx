import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGallery } from '../hooks/useGallery';
import AlbumPanel from '../components/gallery/AlbumPanel';

export default function Home() {
  const { albums, loading, error } = useGallery();
  const [activeId, setActiveId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (albums.length > 0) {
      // If no active ID, or the current active ID is no longer in the albums list
      if (!activeId || !albums.some(a => a.id === activeId)) {
        setActiveId(albums[0].id);
      }
    }
  }, [albums, activeId]);

  const handleViewAlbum = (id) => {
    navigate(`/portfolio/${id}`);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
          Loading Archives
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex flex-col justify-center items-center px-6 text-center">
        <div className="text-sm font-bold text-red-500 tracking-wider mb-2">
          ERROR LOADING ARCHIVES
        </div>
        <div className="text-xs text-white/60 max-w-md leading-relaxed mb-6">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs tracking-widest uppercase transition-all duration-300 rounded cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col justify-center items-center px-6 text-center">
        <div className="text-sm font-bold text-white/80 tracking-wider mb-2">
          NO ARCHIVES FOUND
        </div>
        <div className="text-xs text-white/50 max-w-md leading-relaxed mb-6">
          The database is connected but contains no collections. Go to the dashboard to seed default data or create a new album.
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs tracking-widest uppercase transition-all duration-300 rounded cursor-pointer"
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  const currentActiveId = activeId || albums[0].id;
  const activeIndex = albums.findIndex(a => a.id === currentActiveId);

  return (
    <main className="w-full h-screen flex flex-col md:flex-row animate-[fadeIn_1s_ease-out]">
      {albums.map((album) => (
        <AlbumPanel
          key={album.id}
          album={album}
          isActive={currentActiveId === album.id}
          onClick={() => setActiveId(album.id)}
          onViewAlbum={() => handleViewAlbum(album.id)}
        />
      ))}
      {/* Global Pagination/Indicator (Bottom Left) */}
      <div className="absolute bottom-4 md:bottom-6 left-6 md:left-14 z-40 text-xs font-bold tracking-widest mix-blend-difference text-white pointer-events-none">
         {activeIndex + 1 > 0 
            ? `0${activeIndex + 1}`
            : '00'
         }
         <span className="opacity-40"> / 0{albums.length}</span>
      </div>
    </main>
  );
}
