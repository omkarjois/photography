import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! This portfolio is in demo mode.');
  };

  return (
    <div className="w-full min-h-screen bg-black text-white pt-32 pb-20 px-6 md:px-12 lg:px-24 flex flex-col md:flex-row gap-16 lg:gap-32 animate-[fadeIn_1s_ease-out] overflow-y-auto">
      <div className="md:w-1/3 flex flex-col justify-start pt-12">
        <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-6 uppercase">Inquiries</h1>
        <p className="text-white/50 text-sm font-light leading-relaxed mb-12">
          For print sales, commissions, or licensing, please reach out via email or the contact form. Let's create something meaningful.
        </p>
        <div className="space-y-4 text-[10px] tracking-[0.2em] uppercase text-white/50">
          <a href="mailto:hello@wildlens.com" className="block hover:text-white transition-colors w-max">hello@wildlens.com</a>
          <a href="#" className="block hover:text-white transition-colors w-max">Instagram</a>
          <a href="#" className="block hover:text-white transition-colors w-max">Twitter</a>
        </div>
      </div>

      <div className="md:w-2/3 md:pl-16 lg:pl-32 pt-12 border-t md:border-t-0 md:border-l border-white/10">
        <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-10">
            <input type="text" placeholder="Name" required className="w-full bg-transparent border-b border-white/20 pb-4 text-sm font-light focus:outline-none focus:border-white transition-colors placeholder-white/30" />
            <input type="email" placeholder="Email" required className="w-full bg-transparent border-b border-white/20 pb-4 text-sm font-light focus:outline-none focus:border-white transition-colors placeholder-white/30" />
          </div>
          <input type="text" placeholder="Subject" required className="w-full bg-transparent border-b border-white/20 pb-4 text-sm font-light focus:outline-none focus:border-white transition-colors placeholder-white/30" />
          <textarea placeholder="Message" required rows="4" className="w-full bg-transparent border-b border-white/20 pb-4 text-sm font-light focus:outline-none focus:border-white transition-colors placeholder-white/30 resize-none"></textarea>
          
          <button type="submit" className="self-start mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white border-b border-white/30 pb-2 hover:border-white hover:pr-4 transition-all flex items-center gap-2 group cursor-pointer">
            Submit
            <ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-2 transition-all" />
          </button>
        </form>
      </div>
    </div>
  );
}
