import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login, users } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message || 'Error de acceso.');
      }
      setLoading(false);
    }, 200);
  };

  const handleQuickLogin = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setError(null);
    login(demoUser, demoPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-xl shadow-indigo-500/20 mb-3">
          <GraduationCap className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          EduNotas AIOT
        </h1>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Cátedra del Prof. Aaron Isaac Ordoñez Torres
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-slate-200/60 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Iniciar Sesión</h2>
              <p className="text-xs text-slate-500">Ingresa tus credenciales personales</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Acceso Seguro
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Usuario o Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: aaron.ordonez, maria.gonzalez"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                'Verificando...'
              ) : (
                <>
                  <span>Ingresar a mi Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accesos Rápidos de Prueba (1 Clic):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('aaron.ordonez', 'admin123')}
                className="p-2.5 text-left rounded-xl border border-indigo-200/80 bg-indigo-50/50 hover:bg-indigo-100/70 transition-colors group cursor-pointer"
              >
                <div className="font-bold text-indigo-900 flex items-center justify-between">
                  <span className="truncate">Prof. Aaron Isaac Ordoñez</span>
                  <span className="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-sm shrink-0">
                    Docente
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700/80 mt-0.5">
                  Califica, importa planillas y responde
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('maria.gonzalez', 'alumno123')}
                className="p-2.5 text-left rounded-xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors group cursor-pointer"
              >
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>María González</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                    Alumna
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700/80 mt-0.5">
                  Consulta notas y envía dudas
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('carlos.ruiz', 'alumno123')}
                className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Carlos Ruiz</div>
                <div className="text-[11px] text-slate-500">
                  Ver notas particulares y diálogo
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alejandro.vega', 'alumno123')}
                className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="font-bold text-slate-800">Alejandro Vega</div>
                <div className="text-[11px] text-slate-500">
                  Ver notas y caso de recuperación
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Features highlight card */}
        <div className="mt-6 bg-white/70 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/60 shadow-xs text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ¿Cómo se garantiza la privacidad?
          </div>
          <ul className="space-y-1.5 text-slate-600 pl-1">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Aislamiento total:</strong> Los alumnos solo pueden consultar sus propias notas y observaciones. Jamás ven las de sus compañeros.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Diálogo y consultas:</strong> Puedes enviar preguntas o aclaraciones directamente en cada nota calificada y recibir respuesta del profesor.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Gestión docente:</strong> El profesor califica, añade retroalimentación detallada y responde las dudas de cada alumno.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
