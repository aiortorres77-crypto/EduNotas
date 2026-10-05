import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Evaluation } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Award,
  AlertTriangle,
} from 'lucide-react';

export const TeacherSubjectsManager: React.FC = () => {
  const {
    subjects,
    evaluations,
    addSubject,
    updateSubject,
    deleteSubject,
    addEvaluation,
    deleteEvaluation,
  } = useApp();

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subMinPass, setSubMinPass] = useState(6.0);
  const [subMaxScale, setSubMaxScale] = useState(10);

  // New Eval Modal
  const [targetSubjectForEval, setTargetSubjectForEval] = useState<Subject | null>(null);
  const [evalTitle, setEvalTitle] = useState('');
  const [evalDesc, setEvalDesc] = useState('');
  const [evalWeight, setEvalWeight] = useState(25);
  const [evalDate, setEvalDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;

    addSubject({
      name: subName.trim(),
      code: subCode.trim().toUpperCase(),
      description: subDesc.trim(),
      teacherName: 'Prof. Aaron Isaac Ordoñez Torres',
      academicYear: '2026',
      minPassingScore: Number(subMinPass),
      maxScoreScale: Number(subMaxScale),
      color: 'indigo',
    });

    setSubName('');
    setSubCode('');
    setSubDesc('');
    setShowAddSubjectModal(false);
  };

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject || !subName.trim() || !subCode.trim()) return;

    updateSubject(editingSubject.id, {
      name: subName.trim(),
      code: subCode.trim().toUpperCase(),
      description: subDesc.trim(),
      minPassingScore: Number(subMinPass),
      maxScoreScale: Number(subMaxScale),
    });

    setEditingSubject(null);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setSubName(sub.name);
    setSubCode(sub.code);
    setSubDesc(sub.description);
    setSubMinPass(sub.minPassingScore);
    setSubMaxScale(sub.maxScoreScale);
  };

  const handleCreateEval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSubjectForEval || !evalTitle.trim()) return;

    addEvaluation({
      subjectId: targetSubjectForEval.id,
      title: evalTitle.trim(),
      description: evalDesc.trim(),
      date: evalDate,
      weightPercentage: Number(evalWeight),
      maxScore: targetSubjectForEval.maxScoreScale || 10,
      period: 'Primer Trimestre',
    });

    setEvalTitle('');
    setEvalDesc('');
    setTargetSubjectForEval(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Cátedras y Asignaturas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Administra las materias que dictas y sus respectivas instancias de
            evaluación y ponderaciones.
          </p>
        </div>

        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nueva Asignatura
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => {
          const subEvals = evaluations.filter((e) => e.subjectId === sub.id);
          const totalWeight = subEvals.reduce(
            (sum, e) => sum + e.weightPercentage,
            0
          );

          return (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {sub.code}
                      </span>
                      <span className="text-xs text-slate-400">
                        Escala 0 a {sub.maxScoreScale} (Aprueba con {sub.minPassingScore})
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sub)}
                      title="Editar nombre, código y criterios de esta materia"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `¿Eliminar la asignatura "${sub.name}" y todas sus evaluaciones?`
                          )
                        ) {
                          deleteSubject(sub.id);
                        }
                      }}
                      title="Eliminar materia"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mb-4">{sub.description}</p>

                {/* Evaluations Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 border-b border-slate-100">
                    <span>Evaluaciones Programadas ({subEvals.length})</span>
                    <span
                      className={`font-bold ${
                        totalWeight === 100
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }`}
                    >
                      Ponderación: {totalWeight}%
                    </span>
                  </div>

                  {subEvals.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Sin evaluaciones configuradas
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {subEvals.map((ev) => (
                        <div
                          key={ev.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {ev.title}
                            </span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>{ev.date}</span>
                              <span>•</span>
                              <span>Pesa {ev.weightPercentage}%</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `¿Eliminar evaluación "${ev.title}"?`
                                )
                              ) {
                                deleteEvaluation(ev.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Docente: {sub.teacherName}
                </span>

                <button
                  onClick={() => setTargetSubjectForEval(sub)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Evaluación
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Crear Nueva Asignatura
              </h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Ej: Biología Celular y Genética"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Cátedra
                  </label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="BIO-205"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nota Aprobación
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    required
                    value={subMinPass}
                    onChange={(e) => setSubMinPass(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del Programa
                </label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  placeholder="Objetivos de aprendizaje y temas principales..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Guardar Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Subject */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Editar Asignatura: {editingSubject.name}
              </h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Cátedra
                  </label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nota Aprobación
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    required
                    value={subMinPass}
                    onChange={(e) => setSubMinPass(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción del Programa
                </label>
                <textarea
                  rows={2}
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Actualizar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {targetSubjectForEval && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase">
                  {targetSubjectForEval.name}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Agregar Evaluación
                </h3>
              </div>
              <button
                onClick={() => setTargetSubjectForEval(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEval} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Evaluación
                </label>
                <input
                  type="text"
                  required
                  value={evalTitle}
                  onChange={(e) => setEvalTitle(e.target.value)}
                  placeholder="Ej: Trabajo Práctico Nº 3"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción o Criterios
                </label>
                <textarea
                  rows={2}
                  value={evalDesc}
                  onChange={(e) => setEvalDesc(e.target.value)}
                  placeholder="Pautas o temas incluidos"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ponderación (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={evalWeight}
                    onChange={(e) => setEvalWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={evalDate}
                    onChange={(e) => setEvalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetSubjectForEval(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
