import React from "react";
import imgButton from "figma:asset/226049655f3871f3dac264b316138eae1882ff2f.png";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function PrimaryButton({ children, icon, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`relative h-8 px-4 rounded-xl inline-flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {/* Background layers */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-xl">
        <div className="absolute bg-gradient-to-b from-[#ff5700] inset-0 rounded-xl to-[#ef5200]" />
        <div 
          className="absolute inset-0 mix-blend-plus-lighter opacity-40 rounded-xl bg-repeat" 
          style={{ 
            backgroundImage: `url('${imgButton}')`,
            backgroundSize: '307.2px 307.2px',
            backgroundPosition: 'top left'
          }} 
        />
      </div>
      
      {/* Border and shadow */}
      <div 
        aria-hidden="true" 
        className="absolute border border-solid border-white inset-0 pointer-events-none rounded-xl shadow-[0px_8px_16px_0px_rgba(255,88,0,0.25),0px_4px_8px_0px_rgba(255,88,0,0.15),0px_0px_0px_2px_#f1e7e0,0px_0px_0px_3px_white]"
      />
      
      {/* Content */}
      {icon && <span className="relative z-10 text-white">{icon}</span>}
      <span className="relative z-10 text-white text-sm font-normal leading-5">{children}</span>
      
      {/* Inner glow */}
      <div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0px_1px_18px_2px_#ffeddb,inset_0px_1px_4px_2px_#ffeddb]" />
    </button>
  );
}