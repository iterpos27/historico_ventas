import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/50 sm:place-items-center sm:px-4 sm:py-6">
    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
        <h3 className="text-base font-semibold text-brandDark sm:text-lg">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  </div>
);
