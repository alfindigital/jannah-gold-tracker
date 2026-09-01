import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#F6F3EC]/90 backdrop-blur-md border-b border-[#E5DFD3] px-4 py-3.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <h1 className="text-base font-display font-black tracking-wider text-[#1B1814] uppercase">
          Jannah Gold
        </h1>
      </div>
    </header>
  );
}
