import React, { useMemo, useState } from 'react';
import { BarChart3, Building2, LogOut, Target, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const menuByRole = {
  admin: [
    { id: 'ventas', label: 'Ventas', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'almacenes', label: 'Almacenes', icon: Building2 },
    { id: 'metas', label: 'Metas', icon: Target }
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
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-brandDark px-4 py-6 text-white shadow-xl lg:block">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-sm font-black text-brandDark ring-4 ring-white/20">
              CR
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">El Centro del Rulimán</h1>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Control comercial</p>
            </div>
          </div>
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
        <header className="border-b border-blue-100 bg-white px-5 py-4 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{user.rol.replace('_', ' ')}</p>
              <h2 className="text-xl font-semibold text-brandDark">{activeItem?.label || 'Dashboard'}</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto lg:hidden">
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
        <div className="p-5 lg:p-8">{enhancedChildren}</div>
      </main>
    </div>
  );
};
