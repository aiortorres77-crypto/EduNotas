import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  KeyRound,
  Users,
  ShieldCheck,
  MessageSquareQuote,
  RefreshCcw,
  Download,
  Upload,
  FileText,
} from 'lucide-react';
import { ChangePasswordModal } from './common/ChangePasswordModal';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenReportCard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportCard,
}) => {
  const {
    currentUser,
    users,
    logout,
    switchUserById,
    getPendingStudentInquiriesCount,
    resetAllData,
    exportDatabaseJson,
    importDatabaseJson,
  } = useApp();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const pendingCount = isTeacher ? getPendingStudentInquiriesCount() : 0;

  const handleExport = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respaldo_calificaciones_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowToolsMenu(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJson(content);
        if (success) {
          alert('Datos importados exitosamente.');
        } else {
          alert('Error al leer el archivo de respaldo. Formato inválido.');
        }
      }
    };
    reader.readAsText(file);
    setShowToolsMenu(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & School Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">
                    EduNotas AIOT
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Privacidad Protegida
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden md:block">
                  Cátedra del Prof. Aaron Isaac Ordoñez Torres
                </p>
              </div>
            </div>

            {/* Navigation Tabs (if teacher) */}
            {isTeacher && setActiveTab && (
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('gradebook')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'gradebook'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Libro de Notas
                </button>
                <button
                  onClick={() => setActiveTab('spreadsheet')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'spreadsheet'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Cargar Hoja de Cálculo
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === 'inquiries'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquareQuote className="w-4 h-4" />
                  Consultas
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500 text-white">
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'students'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Alumnos & Claves
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'subjects'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Asignaturas
                </button>
              </nav>
            )}

            {/* User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick switch button for demo testing */}
              <button
                onClick={() => setShowSwitchModal(true)}
                title="Cambiar entre cuenta de profesor y estudiantes para probar"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Simular Usuario</span>
              </button>

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    isTeacher
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300/60'
                      : 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300/60'
                  }`}
                >
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        isTeacher ? 'bg-indigo-600' : 'bg-emerald-500'
                      }`}
                    />
                    {isTeacher ? 'Docente / Calificador' : 'Estudiante'}
                  </div>
                </div>
              </div>

              {/* Password change */}
              <button
                onClick={() => setShowPasswordModal(true)}
                title="Cambiar contraseña"
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </button>

              {/* Extra tools (export/import/reset) */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  title="Opciones de datos y respaldo"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                </button>

                {showToolsMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs">
                    <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Gestión de Datos
                    </div>
                    <button
                      onClick={handleExport}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      Descargar respaldo (JSON)
                    </button>
                    <label className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      Importar datos de respaldo
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            '¿Restablecer todos los datos a la demostración inicial? Se borrarán los cambios locales.'
                          )
                        ) {
                          resetAllData();
                          setShowToolsMenu(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-red-50 text-red-600"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                      Restablecer datos demo
                    </button>
                  </div>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Submenu for Teacher */}
        {isTeacher && setActiveTab && (
          <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/90 px-2 py-1.5 text-xs">
            <button
              onClick={() => setActiveTab('gradebook')}
              className={`px-2 py-1 rounded-md font-medium ${
                activeTab === 'gradebook'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Calificaciones
            </button>
            <button
              onClick={() => setActiveTab('spreadsheet')}
              className={`px-2 py-1 rounded-md font-medium ${
                activeTab === 'spreadsheet'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Planilla Excel
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-2 py-1 rounded-md font-medium relative ${
                activeTab === 'inquiries'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Consultas
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-2 py-1 rounded-md font-medium ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Alumnos
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`px-2 py-1 rounded-md font-medium ${
                activeTab === 'subjects'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-600'
              }`}
            >
              Asignaturas
            </button>
          </div>
        )}
      </header>

      {/* Switch User Modal for immediate testing */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Simular Vista de Usuario
                </h3>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Comprueba de inmediato cómo experimenta cada alumno su privacidad y
              cómo el docente gestiona las notas y responde comentarios.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Docente
              </div>
              {users
                .filter((u) => u.role === 'teacher')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      setShowSwitchModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      currentUser.id === u.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Usuario: <span className="font-mono text-slate-700">{u.username}</span> • Rol: Docente
                        </div>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                        Activo
                      </span>
                    )}
                  </button>
                ))}

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                Alumnos (Cada uno ve únicamente sus calificaciones)
              </div>
              {users
                .filter((u) => u.role === 'student')
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUserById(u.id);
                      setShowSwitchModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      currentUser.id === u.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          Usuario: <span className="font-mono text-slate-700">{u.username}</span> • Matrícula: {u.studentIdNumber}
                        </div>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Activo
                      </span>
                    )}
                  </button>
                ))}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};
