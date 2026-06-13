import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGallery } from '../hooks/useGallery';
import AlbumPanel from '../components/gallery/AlbumPanel';

export default function Home() {
  const { albums, loading } = useGallery();
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

  if (loading || albums.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
          Loading Archives
        </div>
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
