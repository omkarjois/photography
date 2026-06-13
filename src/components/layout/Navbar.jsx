import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNav = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Portfolio', path: '/portfolio', isActive: (path) => path === '/portfolio' || path.startsWith('/portfolio/') },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const checkActive = (item) => {
    if (item.isActive) {
      return item.isActive(currentPath);
    }
    return currentPath === item.path;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 md:px-12 flex justify-between items-center text-white pointer-events-none mix-blend-difference">
        <Link 
          to="/"
          className="flex items-center gap-3 cursor-pointer group pointer-events-auto"
          onClick={handleNav}
        >
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <span className="font-refular tracking-[0.2em] uppercase text-xs">Omkar jois photography</span>
        </Link>
        
        <div className="hidden md:flex gap-10 text-[10px] font-semibold tracking-[0.2em] uppercase pointer-events-auto">
          {navItems.map((item) => {
            const active = checkActive(item);
            return (
              <Link 
                key={item.label} 
                to={item.path}
                className={`transition-colors relative overflow-hidden group py-1 ${active ? 'text-white' : 'text-white/40 hover:text-white'}`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 h-[1px] bg-white transition-transform duration-300 ${active ? 'translate-x-0' : '-translate-x-[101%] group-hover:translate-x-0'} w-full`}></span>
              </Link>
            );
          })}
        </div>

        <button className="md:hidden pointer-events-auto text-white/70 hover:text-white transition-colors cursor-pointer" onClick={() => setIsMobileMenuOpen(true)}>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Menu</span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#050505] z-[60] flex flex-col justify-center items-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button className="absolute top-8 right-6 text-white/50 hover:text-white transition-colors cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Close</span>
        </button>
        <div className="flex flex-col gap-8 text-xl font-light tracking-[0.3em] uppercase items-center">
          {navItems.map((item) => {
            const active = checkActive(item);
            return (
              <Link 
                key={item.label} 
                to={item.path}
                onClick={handleNav}
                className={`transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${active ? 'text-white' : 'text-white/30 hover:text-white'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
