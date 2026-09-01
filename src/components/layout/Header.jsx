import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F3EC]/90 backdrop-blur-md border-b border-[#E5DFD3] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center">
        {/* Brand: Official Logo Icon + Full JANNAH GOLD Title */}
        <div className="flex items-center gap-2.5">
          <img 
            src="/logo.png" 
            alt="Jannah Gold" 
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-[#C59A3F]/40 shadow-xs"
          />
          <h1 className="text-base font-display font-extrabold tracking-wider text-[#1B1814] uppercase">
            Jannah Gold
          </h1>
        </div>
      </div>
    </header>
  );
}
