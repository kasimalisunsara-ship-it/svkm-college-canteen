import React from 'react';

export const SvkmLogo = ({ className = "h-10 w-auto", showText = true, lightMode = false, onClick }) => {
  return (
    <div 
      className={`flex items-center gap-2.5 shrink-0 align-middle select-none ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center p-1 bg-white rounded-lg shadow-sm border border-slate-100">
        <img
          src="/svkm-logo.png"
          alt="SVKM Official Logo"
          className={`${className} object-contain filter drop-shadow-sm transition-transform duration-200 hover:scale-105`}
        />
      </div>
      {showText && (
        <div className="flex flex-col text-left justify-center leading-none">
          <span className={`text-sm font-black tracking-widest uppercase ${lightMode ? 'text-white' : 'text-slate-900'}`}>
            SVKM
          </span>
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-tight mt-0.5">
            Canteen Portal
          </span>
        </div>
      )}
    </div>
  );
};

export default SvkmLogo;
