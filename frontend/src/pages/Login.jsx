import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo.jsx';
import { ErrorMessage } from '../components/ErrorMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-brandDark px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg border border-white/20 bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <BrandLogo className="text-brandDark [&_p]:text-slate-500" />
        </div>
        <h2 className="text-2xl font-semibold text-ink">Iniciar sesión</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Usuario o correo</span>
            <input
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <div className="mt-1 flex rounded-md border border-slate-300 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="min-w-0 flex-1 rounded-l-md px-3 py-2 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="grid w-11 place-items-center rounded-r-md text-slate-500 hover:bg-slate-50"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <ErrorMessage message={error} />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </main>
  );
};
