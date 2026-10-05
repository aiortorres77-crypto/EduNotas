import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  onClose: () => void;
  targetUserId?: string; // If teacher is resetting another student's pass
  targetUserName?: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
  targetUserId,
  targetUserName,
}) => {
  const { currentUser, updateUserPassword } = useApp();
  const userId = targetUserId || currentUser?.id;
  const displayName = targetUserName || currentUser?.name;

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isTeacherOverridingStudent = Boolean(
    targetUserId && currentUser?.role === 'teacher' && targetUserId !== currentUser.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If student changing own pass, check current pass
    if (!isTeacherOverridingStudent && currentUser?.password !== currentPass) {
      setError('La contraseña actual es incorrecta.');
      return;
    }

    if (newPass.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (userId) {
      updateUserPassword(userId, newPass);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isTeacherOverridingStudent
              ? `Reasignar clave: ${displayName}`
              : 'Cambiar mi Contraseña'}
          </h3>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          {isTeacherOverridingStudent
            ? 'Establece una nueva clave temporal para que el alumno pueda ingresar.'
            : 'Por seguridad, ingresa tu clave actual y define una nueva.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-center gap-2 font-medium">
            <Check className="w-5 h-5 text-emerald-600" />
            ¡Contraseña actualizada con éxito!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isTeacherOverridingStudent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña Actual
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
              >
                Guardar Contraseña
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
