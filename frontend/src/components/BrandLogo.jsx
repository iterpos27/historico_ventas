import React from 'react';

export const BrandLogo = ({ compact = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <img
      src="/logo.svg"
      alt="El Centro del Ruliman"
      className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} shrink-0 rounded-full object-cover ring-4 ring-white/20`}
    />
    {!compact ? (
      <div>
        <h1 className="text-base font-semibold leading-tight">El Centro del Ruliman</h1>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Control comercial</p>
      </div>
    ) : null}
  </div>
);
