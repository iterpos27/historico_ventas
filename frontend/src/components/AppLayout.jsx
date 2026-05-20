import React, { useMemo, useState } from 'react';
import { Activity, BarChart3, Building2, LogOut, Target, Users } from 'lucide-react';
import { BrandLogo } from './BrandLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const menuByRole = {
  admin: [
    { id: 'ventas', label: 'Ventas', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'almacenes', label: 'Almacenes', icon: Building2 },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'estado', label: 'Estado', icon: Activity }
  ],
  jefe_comercial: [
    { id: 'ventas', label: 'Ventas globales', icon: BarChart3 }
  ],
  almacen: [
    { id: 'mi-almacen', label: 'Mi almacén', icon: Building2 }
  ]
};

export const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const menu = menuByRole[user.rol] || [];
  const [activeSection, setActiveSection] = useState(menu[0]?.id || 'ventas');
  const activeItem = useMemo(
    () => menu.find((item) => item.id === activeSection) || menu[0],
    [activeSection, menu]
  );

  const enhancedChildren = React.isValidElement(children)
    ? React.cloneElement(children, { activeSection, setActiveSection })
    : children;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-brandDark px-4 py-6 text-white shadow-xl lg:block">
        <div>
          <BrandLogo />
          <div className="mt-6 rounded-lg border border-white/10 bg-white/10 px-3 py-3">
            <p className="text-sm font-semibold">{user.nombre}</p>
            <p className="mt-1 text-xs text-blue-100">{user.rol.replace('_', ' ')}</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                  active ? 'bg-white text-brandDark shadow-sm' : 'text-blue-50 hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 left-4 right-4 flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          <LogOut size={18} />
          Salir
        </button>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 px-4 py-3 backdrop-blur lg:px-8 lg:py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <BrandLogo compact className="lg:hidden" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">{user.rol.replace('_', ' ')}</p>
                  <h2 className="truncate text-lg font-semibold leading-tight text-brandDark sm:text-xl">{activeItem?.label || 'Dashboard'}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-accent lg:hidden"
                aria-label="Salir"
                title="Salir"
              >
                <LogOut size={18} />
              </button>
            </div>
            <div className="hidden gap-2 overflow-x-auto pb-1 lg:hidden">
              {menu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${
                    item.id === activeSection ? 'bg-brand text-white' : 'bg-softBlue text-brandDark'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-5 lg:p-8">{enhancedChildren}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-blue-100 bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] lg:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(menu.length, 1)}, minmax(0, 1fr))` }}>
          {menu.map((item) => {
            const Icon = item.icon;
            const active = item.id === activeSection;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold leading-tight ${
                  active ? 'bg-brand text-white' : 'text-brandDark'
                }`}
              >
                <Icon size={18} />
                <span className="line-clamp-2">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
