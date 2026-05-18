import React from 'react';

export const LoadingState = ({ label = 'Cargando' }) => (
  <div className="flex min-h-48 items-center justify-center text-sm font-medium text-slate-500">
    {label}...
  </div>
);
