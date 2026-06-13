import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { motion, useScroll, useTransform } from 'framer-motion';

// Viewport entrance animation component using framer-motion
function ScrollReveal({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Parallax scrolling blur background component using framer-motion
function ParallaxBackground({ src, alt }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Transform scroll progress into vertical translation for the background
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <div 
      ref={ref}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none opacity-[0.15] filter blur-3xl scale-125"
    >
      <motion.img 
        src={src} 
        alt={alt} 
        style={{ y }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// Sticky Portrait Section for handling vertical images with Apple-like scrolling
function StickyPortraitSection({ photo, letter, index, setLightboxIndex, setLightboxOpen, handleImageLoad }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.85]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className="relative w-full h-[150vh] flex flex-col md:flex-row my-24 overflow-hidden">
      <ParallaxBackground src={photo.url} alt={photo.name} />
      
      {/* Sticky Image Side */}
      <div className="w-full md:w-1/2 relative z-10 pointer-events-none">
        <div className="sticky top-0 h-screen flex items-center justify-center p-8 pointer-events-auto">
          <motion.div 
            style={{ scale: imageScale, opacity: imageOpacity }}
            className="w-full h-[85vh] relative rounded-sm overflow-hidden cursor-zoom-in flex items-center justify-center"
            onClick={() => {
              setLightboxIndex(index + 1);
              setLightboxOpen(true);
            }}
          >
            <img 
              src={photo.url} 
              alt={photo.name} 
              onLoad={(e) => handleImageLoad(photo.url, e.target.naturalWidth, e.target.naturalHeight)}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Scrolling Text Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 md:px-16 pt-[50vh] pb-[50vh] z-20 pointer-events-none">
        <ScrollReveal className="relative border-l border-white/20 pl-8 max-w-md bg-black/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-lg pointer-events-auto">
          <div className="absolute -top-6 left-8 text-[10px] tracking-widest text-white/40">[ {letter} ]</div>
          <h3 className="text-3xl md:text-5xl font-light mb-6 text-white leading-tight">{photo.name}</h3>
          <p className="text-base md:text-lg text-white/60 leading-relaxed font-light">{photo.description}</p>
        </ScrollReveal>
      </div>
    </div>
  );
}

// Hero Section with dynamic scroll linked animations
function HeroSection({ album, setLightboxIndex, setLightboxOpen, handleImageLoad }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.3, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={ref} className="h-screen w-full relative flex flex-col justify-center items-center overflow-hidden">
      
      {/* Full Screen Background Image */}
      <div 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}
        className="absolute inset-0 w-full h-full z-0 cursor-zoom-in"
        onClick={() => {
          setLightboxIndex(0);
          setLightboxOpen(true);
        }}
      >
        <img 
          src={album.image || album.photos[0]?.url} 
          alt={album.title} 
          onLoad={(e) => handleImageLoad(album.image || album.photos[0]?.url, e.target.naturalWidth, e.target.naturalHeight)}
          className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Text Content Overlay */}
      <motion.div 
        style={{ y: textY, opacity }}
        className="relative z-10 w-full px-6 md:px-12 lg:px-24 flex flex-col items-center text-center mt-32 pointer-events-none"
      >
        <div className="mb-4 text-white/60 text-sm tracking-[0.3em] font-bold uppercase flex items-center gap-4">
          <span>{album.number}</span>
          <div className="w-8 h-[1px] bg-white/30"></div>
          <span>{album.year}</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-[130px] font-bold text-white tracking-tighter leading-none mb-6 drop-shadow-2xl">
          {album.title}
        </h1>
        
        <p className="text-xs md:text-sm text-white/60 uppercase tracking-[0.2em] mb-8 font-semibold">
          {album.genre}
        </p>
        
        <p className="text-sm md:text-lg text-white/80 font-light max-w-2xl leading-relaxed drop-shadow-md">
          {album.description}
        </p>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        style={{ opacity }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 pointer-events-none"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
      </motion.div>

    </div>
  );
}

export default function AlbumStory() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const { albums, loading } = useGallery();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [aspectRatios, setAspectRatios] = useState({});

  const handleImageLoad = (url, width, height) => {
    setAspectRatios(prev => ({
      ...prev,
      [url]: width / height
    }));
  };

  const currentIdx = albums.findIndex(a => a.id === albumId);
  const album = currentIdx !== -1 ? albums[currentIdx] : albums[0];

  const allImages = album ? [
    { url: album.image, name: album.title, description: album.description },
    ...(album.photos || [])
  ] : [];

  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setZoomScale(1.0);
        setLightboxIndex((prev) => (prev + 1) % (allImages.length || 1));
      } else if (e.key === 'ArrowLeft') {
        setZoomScale(1.0);
        setLightboxIndex((prev) => (prev - 1 + (allImages.length || 1)) % (allImages.length || 1));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  useEffect(() => {
    if (!lightboxOpen) {
      setZoomScale(1.0);
    }
  }, [lightboxOpen]);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black text-white flex justify-center items-center">
        <div className="text-[10px] tracking-[0.4em] uppercase text-white/40 animate-pulse">
          Loading Story
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center gap-6">
        <p className="text-sm tracking-widest text-white/50">Story not found.</p>
        <button 
          onClick={() => navigate('/portfolio')}
          className="border border-white/20 px-6 py-3 text-[10px] tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Back to Archive
        </button>
      </div>
    );
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevAlbum = albums[currentIdx - 1];
      navigate(`/portfolio/${prevAlbum.id}`);
    }
  };

  const handleNext = () => {
    if (currentIdx < albums.length - 1) {
      const nextAlbum = albums[currentIdx + 1];
      navigate(`/portfolio/${nextAlbum.id}`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white animate-[fadeIn_1s_ease-out] overflow-x-hidden relative">
      
      {/* Ambient Dynamic Gradient Background using Cover Image */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#050505] overflow-hidden">
        {/* Layer 1: Base blurred color, rotating slowly */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] md:w-[120vw] md:h-[150vh]">
            <img 
              src={album?.image || album?.photos?.[0]?.url} 
              alt="ambient base" 
              className="w-full h-full object-cover opacity-50 filter blur-[80px] md:blur-[120px] saturate-[2.0] animate-[spin_90s_linear_infinite]"
            />
        </div>
        {/* Layer 2: Counter-rotating vivid colors with overlay blend mode */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] md:w-[120vw] md:h-[150vh]">
            <img 
              src={album?.image || album?.photos?.[0]?.url} 
              alt="ambient highlight" 
              className="w-full h-full object-cover opacity-40 filter blur-[60px] md:blur-[100px] saturate-[3.0] mix-blend-overlay animate-[spin_120s_linear_infinite_reverse]"
            />
        </div>
        {/* Vignette to ensure edges stay dark and text remains readable */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#050505_100%)] opacity-90"></div>
      </div>

      {/* Editorial Header / Hero section */}
      <HeroSection 
        album={album} 
        setLightboxIndex={setLightboxIndex} 
        setLightboxOpen={setLightboxOpen} 
        handleImageLoad={handleImageLoad} 
      />

      {/* Narrative Flow Grid (Dynamic Story Photos) */}
      <div className="px-6 md:px-12 lg:px-24 py-20 bg-transparent relative z-10">

        {/* Asymmetric Image Blocks */}
        <div className="flex flex-col gap-32 md:gap-48 pb-32">
          {album.photos && album.photos.length > 0 ? (
            album.photos.map((photo, index) => {
              const number = String(index + 1).padStart(2, '0');
              const isEven = index % 2 === 0;

              return (
                <ScrollReveal key={photo.id || index} className="relative w-full px-4 md:px-8">
                  <div className={`relative z-10 flex flex-col md:flex-row gap-12 lg:gap-24 items-center justify-between ${isEven ? '' : 'md:flex-row-reverse'}`}>
                    
                    {/* Text Section */}
                    <div className="w-full md:w-5/12 relative z-20 flex flex-col justify-center">
                      {/* Large Background Number */}
                      <div className="absolute -top-16 -left-8 md:-top-24 md:-left-12 text-[140px] md:text-[220px] font-bold text-white/[0.03] select-none z-0 tracking-tighter">
                        {number}
                      </div>
                      
                      <div className="relative z-10">
                        {/* Subtitle with line */}
                        <div className="flex items-center gap-6 mb-6">
                          <span className="text-white/20 font-light text-5xl md:text-7xl">{number}</span>
                          <div className="w-12 h-[1px] bg-white/30"></div>
                          <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase font-bold">
                            Chapter {number}
                          </span>
                        </div>

                        {/* Heading */}
                        <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
                          {photo.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm md:text-base text-white/70 leading-relaxed font-light mb-8 max-w-md">
                          {photo.description}
                        </p>

                        {/* Action Link */}
                        <button 
                          onClick={() => {
                            setLightboxIndex(index + 1);
                            setLightboxOpen(true);
                          }}
                          className="flex items-center gap-2 text-white/60 text-[10px] tracking-widest uppercase hover:text-white transition-colors group"
                        >
                          read more <span className="transform group-hover:translate-x-1 transition-transform">-&gt;</span>
                        </button>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div 
                      onClick={() => {
                        setLightboxIndex(index + 1);
                        setLightboxOpen(true);
                      }}
                      className="w-full md:w-6/12 relative cursor-zoom-in group mt-12 md:mt-0 flex justify-center"
                    >
                      <div className={`relative shadow-2xl rounded-sm overflow-hidden ${isEven ? 'md:-mt-24' : 'md:mt-24'}`}>
                        <img 
                          src={photo.url} 
                          alt={photo.name} 
                          onLoad={(e) => handleImageLoad(photo.url, e.target.naturalWidth, e.target.naturalHeight)}
                          className="w-auto h-auto max-w-full max-h-[85vh] object-contain hover:scale-[1.03] transition-transform duration-1000 ease-out" 
                        />
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })
          ) : (
            <div className="text-center py-12 border border-white/10 rounded-lg">
              <p className="text-sm text-white/40 tracking-wider">No photos uploaded for this story yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="px-6 md:px-12 lg:px-24 py-12 border-t border-white/10 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-semibold relative z-10">
        <button 
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-4 hover:text-white/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Archive
        </button>
        <div className="flex gap-8">
           <button 
             disabled={currentIdx === 0}
             onClick={handlePrev}
             className={`cursor-pointer transition-colors ${currentIdx === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/40 hover:text-white'}`}
           >
             Prev
           </button>
           <span>/</span>
           <button 
             disabled={currentIdx === albums.length - 1}
             onClick={handleNext}
             className={`cursor-pointer transition-colors ${currentIdx === albums.length - 1 ? 'text-white/20 cursor-not-allowed' : 'text-white hover:text-white/60'}`}
           >
             Next
           </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 animate-[fadeIn_0.25s_ease-out] select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center text-white/70">
            <span className="text-xs tracking-widest font-mono">
              {String(lightboxIndex + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-light hidden md:inline-block">
              {allImages[lightboxIndex].name}
            </span>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale((prev) => Math.min(prev + 0.25, 3.0));
                }}
                className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomScale((prev) => Math.max(prev - 0.25, 1.0));
                }}
                className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <div className="w-[1px] h-4 bg-white/20"></div>
              <button 
                onClick={() => setLightboxOpen(false)}
                className="p-2 hover:text-white transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-center relative w-full my-4">
            {/* Prev Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(1.0);
                setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
              }}
              className="absolute left-2 md:left-6 p-3 bg-black/40 hover:bg-black/80 text-white/60 hover:text-white border border-white/10 rounded-full transition-all duration-300 z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Lightbox Image */}
            <div 
              className={`max-h-[70vh] max-w-[85vw] md:max-h-[75vh] md:max-w-[75vw] flex items-center justify-center ${zoomScale > 1 ? 'overflow-auto cursor-zoom-out [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]' : 'overflow-hidden cursor-zoom-in'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (zoomScale > 1) {
                  setZoomScale(1.0);
                } else {
                  setZoomScale(2.0);
                }
              }}
            >
              <img 
                src={allImages[lightboxIndex].url} 
                alt={allImages[lightboxIndex].name}
                style={{ transform: `scale(${zoomScale})` }}
                className="max-h-[70vh] max-w-[85vw] md:max-h-[75vh] md:max-w-[75vw] object-contain select-none transition-transform duration-300 ease-out origin-center" 
              />
            </div>

            {/* Next Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(1.0);
                setLightboxIndex((prev) => (prev + 1) % allImages.length);
              }}
              className="absolute right-2 md:right-6 p-3 bg-black/40 hover:bg-black/80 text-white/60 hover:text-white border border-white/10 rounded-full transition-all duration-300 z-10 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
