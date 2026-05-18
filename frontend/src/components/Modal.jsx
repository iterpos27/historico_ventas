import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-lg font-semibold text-brandDark">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);
