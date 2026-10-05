import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Users,
  UserPlus,
  KeyRound,
  Printer,
  Search,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { ChangePasswordModal } from '../common/ChangePasswordModal';

interface TeacherStudentsListProps {
  onSelectStudentReport: (student: User) => void;
}

export const TeacherStudentsList: React.FC<TeacherStudentsListProps> = ({
  onSelectStudentReport,
}) => {
  const { users, addStudent, deleteStudent, getStudentOverallAverage } = useApp();

  const students = users.filter((u) => u.role === 'student');

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Student Form fields
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('alumno123');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('4to Año - División B');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentIdNumber &&
        s.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    // Check if username already taken
    const exists = users.some(
      (u) => u.username.toLowerCase() === newUsername.trim().toLowerCase()
    );
    if (exists) {
      alert('Ese nombre de usuario ya está en uso. Por favor elija otro.');
      return;
    }

    addStudent({
      name: newName.trim(),
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      email:
        newEmail.trim() ||
        `${newUsername.trim().toLowerCase()}@estudiante.edu`,
      studentIdNumber:
        newStudentId.trim() || `ALU-2026-${Math.floor(100 + Math.random() * 900)}`,
      gradeLevel: newGradeLevel.trim(),
    });

    setNewName('');
    setNewUsername('');
    setNewPassword('alumno123');
    setNewEmail('');
    setNewStudentId('');
    setShowAddModal(false);
  };

  const handleCopyCredentials = (s: User) => {
    const text = `Acceso al Portal de Calificaciones:\nUsuario: ${s.username}\nContraseña: ${s.password}\nEstudiante: ${s.name}`;
    navigator.clipboard.writeText(text);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Gestión de Alumnos y Credenciales
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {students.length} matriculados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cada estudiante ingresa con su usuario y contraseña para ver únicamente sus
            notas particulares y comunicarse contigo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            {showPasswords ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Ocultar Claves
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                Mostrar Claves
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Matricular Alumno
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <div className="text-xs text-slate-500">
            Total: <strong>{filteredStudents.length}</strong> estudiantes
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Alumno</th>
                <th className="py-3 px-4">Usuario (Login)</th>
                <th className="py-3 px-4">Contraseña</th>
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4 text-center">Promedio General</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => {
                const avg = getStudentOverallAverage(st.id);
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {st.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {st.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {st.username}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {showPasswords ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-900">
                          {st.password}
                        </span>
                      ) : (
                        '••••••••'
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {st.studentIdNumber || '—'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {avg !== null ? (
                        <span
                          className={`font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                            avg >= 8.5
                              ? 'bg-emerald-100 text-emerald-800'
                              : avg >= 6.0
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {avg.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">S/C</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyCredentials(st)}
                          title="Copiar credenciales de acceso para enviar al alumno"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                          {copiedId === st.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setResetTargetUser(st)}
                          title="Cambiar o restablecer contraseña"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onSelectStudentReport(st)}
                          title="Ver e imprimir boletín de calificaciones de este alumno"
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          Boletín
                        </button>

                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `¿Seguro que deseas eliminar a ${st.name}? Se borrarán también sus notas.`
                              )
                            ) {
                              deleteStudent(st.id);
                            }
                          }}
                          title="Eliminar alumno"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Matricular Nuevo Alumno
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo del Alumno
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Sofía Herrera Domínguez"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usuario de Acceso (Login)
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="sofia.herrera"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña Inicial
                  </label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="alumno123"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sofia.herrera@estudiante.edu"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° Matrícula
                  </label>
                  <input
                    type="text"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    placeholder="ALU-2026-300"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Curso / División
                  </label>
                  <input
                    type="text"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    placeholder="4to Año - B"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900">
                🔒 El alumno solo podrá ver sus notas individuales ingresando con este
                usuario y contraseña.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Crear y Matricular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <ChangePasswordModal
          onClose={() => setResetTargetUser(null)}
          targetUserId={resetTargetUser.id}
          targetUserName={resetTargetUser.name}
        />
      )}
    </div>
  );
};
