import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (passcode === 'admin') {
      sessionStorage.setItem('wildlens_authenticated', 'true');
      setAuthError('');
      navigate('/upload');
    } else {
      setAuthError('Access Denied. Invalid passcode.');
      setPasscode('');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center mb-4 text-white/70">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white mb-1">WildLens Admin</h1>
          <p className="text-xs text-white/40 tracking-wider">Content Management Portal</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] tracking-widest text-white/50 uppercase mb-2 font-semibold">
              Secret Passcode
            </label>
            <input
              type="password"
              placeholder="Enter passcode (hint: admin)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-black border border-white/15 focus:border-white/40 rounded-lg px-4 py-3 text-sm tracking-widest text-white placeholder-white/25 outline-none transition-colors"
              autoFocus
            />
          </div>

          {authError && (
            <p className="text-xs text-red-400 font-light tracking-wide text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded">
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-lg hover:bg-white/95 active:scale-[0.98] transition-all cursor-pointer"
          >
            Access Portal
          </button>
        </form>

        <button 
          onClick={() => navigate('/')} 
          className="w-full mt-6 text-center text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Website
        </button>
      </div>
    </div>
  );
}
