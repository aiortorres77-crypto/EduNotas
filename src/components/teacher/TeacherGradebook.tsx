import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Evaluation, User } from '../../types';
import {
  Plus,
  Save,
  MessageSquare,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Download,
  Calendar,
  Layers,
  HelpCircle,
  Sparkles,
  Edit2,
  BookOpen,
} from 'lucide-react';
import { GradeCommentModal } from '../student/GradeCommentModal';

interface TeacherGradebookProps {
  onSelectStudentReport?: (student: User) => void;
}

export const TeacherGradebook: React.FC<TeacherGradebookProps> = ({
  onSelectStudentReport,
}) => {
  const {
    subjects,
    evaluations,
    gradeItems,
    users,
    updateGrade,
    addEvaluation,
    addSubject,
    updateSubject,
    getStudentSubjectAverage,
  } = useApp();

  const students = users.filter((u) => u.role === 'student');

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvalForComment, setSelectedEvalForComment] = useState<{
    evaluation: Evaluation;
    studentId: string;
  } | null>(null);

  // Subject modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showEditSubjectModal, setShowEditSubjectModal] = useState(false);
  const [subNameInput, setSubNameInput] = useState('');
  const [subCodeInput, setSubCodeInput] = useState('');
  const [subDescInput, setSubDescInput] = useState('');
  const [subMinPassInput, setSubMinPassInput] = useState(6.0);

  // Modal for editing grade & feedback
  const [editingGrade, setEditingGrade] = useState<{
    evaluation: Evaluation;
    student: User;
    score: string;
    feedback: string;
  } | null>(null);

  // Modal for adding new evaluation
  const [showAddEvalModal, setShowAddEvalModal] = useState(false);
  const [newEvalTitle, setNewEvalTitle] = useState('');
  const [newEvalDesc, setNewEvalDesc] = useState('');
  const [newEvalWeight, setNewEvalWeight] = useState(20);
  const [newEvalDate, setNewEvalDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [newEvalPeriod, setNewEvalPeriod] = useState('Primer Trimestre');

  const activeSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectEvals = evaluations.filter(
    (e) => e.subjectId === selectedSubjectId
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentIdNumber &&
        s.studentIdNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalWeight = subjectEvals.reduce(
    (sum, e) => sum + e.weightPercentage,
    0
  );

  const handleSaveGradeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const parsedScore =
      editingGrade.score.trim() === '' ? null : parseFloat(editingGrade.score);

    updateGrade(
      editingGrade.evaluation.id,
      editingGrade.student.id,
      parsedScore,
      editingGrade.feedback.trim()
    );

    setEditingGrade(null);
  };

  const handleCreateEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalTitle.trim() || !activeSubject) return;

    addEvaluation({
      subjectId: activeSubject.id,
      title: newEvalTitle.trim(),
      description: newEvalDesc.trim(),
      date: newEvalDate,
      weightPercentage: Number(newEvalWeight),
      maxScore: activeSubject.maxScoreScale || 10,
      period: newEvalPeriod,
    });

    setNewEvalTitle('');
    setNewEvalDesc('');
    setShowAddEvalModal(false);
  };

  // Subject handlers
  const handleCreateSubjectFromGradebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subNameInput.trim()) return;
    const created = addSubject({
      name: subNameInput.trim(),
      code:
        subCodeInput.trim().toUpperCase() ||
        `CAT-${Math.floor(100 + Math.random() * 900)}`,
      description:
        subDescInput.trim() || 'Cátedra del Prof. Aaron Isaac Ordoñez Torres',
      teacherName: 'Prof. Aaron Isaac Ordoñez Torres',
      academicYear: '2026',
      minPassingScore: Number(subMinPassInput),
      maxScoreScale: 10,
      color: 'indigo',
    });
    setSelectedSubjectId(created.id);
    setShowAddSubjectModal(false);
    setSubNameInput('');
    setSubCodeInput('');
    setSubDescInput('');
  };

  const handleEditSubjectFromGradebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubject || !subNameInput.trim()) return;
    updateSubject(activeSubject.id, {
      name: subNameInput.trim(),
      code: subCodeInput.trim().toUpperCase() || activeSubject.code,
      description: subDescInput.trim(),
      minPassingScore: Number(subMinPassInput),
    });
    setShowEditSubjectModal(false);
  };

  const handleExportCsv = () => {
    if (!activeSubject) return;
    const header = [
      'Matricula',
      'Alumno',
      ...subjectEvals.map((e) => `"${e.title} (${e.weightPercentage}%)"`),
      'Promedio Final',
      'Observaciones',
    ];

    const rows = filteredStudents.map((st) => {
      const avg = getStudentSubjectAverage(st.id, activeSubject.id);
      const evalScores = subjectEvals.map((e) => {
        const item = gradeItems.find(
          (g) => g.evaluationId === e.id && g.studentId === st.id
        );
        return item?.score !== null && item?.score !== undefined
          ? item.score
          : '';
      });
      return [
        st.studentIdNumber || '',
        `"${st.name}"`,
        ...evalScores,
        avg !== null ? avg.toFixed(2) : '',
        '',
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [header.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `calificaciones_${activeSubject.code}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Subject Selector & Actions */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subject Selector Buttons */}
        <div className="space-y-1.5 flex-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Seleccionar Asignatura para Calificar:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSubjectId === sub.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {sub.name} ({sub.code})
              </button>
            ))}

            <button
              onClick={() => {
                setSubNameInput('');
                setSubCodeInput('');
                setSubDescInput('');
                setSubMinPassInput(6.0);
                setShowAddSubjectModal(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              title="Indicar o agregar una nueva asignatura a tu cátedra"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Indicar Asignatura</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddEvalModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Evaluación
          </button>

          <button
            onClick={handleExportCsv}
            title="Exportar planilla a Excel / CSV"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Subject Information Banner */}
      {activeSubject && (
        <div className="bg-gradient-to-r from-indigo-50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">
                {activeSubject.name}
              </span>
              <span className="font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-indigo-700">
                {activeSubject.code}
              </span>
              <span className="text-slate-500 font-medium">
                • {activeSubject.academicYear}
              </span>

              <button
                onClick={() => {
                  setSubNameInput(activeSubject.name);
                  setSubCodeInput(activeSubject.code);
                  setSubDescInput(activeSubject.description);
                  setSubMinPassInput(activeSubject.minPassingScore);
                  setShowEditSubjectModal(true);
                }}
                title="Modificar nombre, código o detalles de esta asignatura"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer ml-1"
              >
                <Edit2 className="w-3 h-3" />
                <span>Editar Asignatura</span>
              </button>
            </div>
            <p className="text-slate-600 mt-1 max-w-xl">
              {activeSubject.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Evaluaciones
              </div>
              <div className="text-sm font-bold text-slate-800">
                {subjectEvals.length} instancias
              </div>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Ponderación Total
              </div>
              <div
                className={`text-sm font-bold ${
                  totalWeight === 100
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {totalWeight}% {totalWeight === 100 ? '✓' : '(ajustar a 100%)'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="text-xs text-slate-500">
          Mostrando <strong>{filteredStudents.length}</strong> alumnos
        </div>
      </div>

      {/* Main Gradebook Spreadsheet Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 w-64 shadow-xs">
                  Estudiante
                </th>
                {subjectEvals.map((ev) => (
                  <th
                    key={ev.id}
                    className="py-3.5 px-3 min-w-[130px] text-center border-l border-slate-200"
                  >
                    <div className="text-slate-900 truncate" title={ev.title}>
                      {ev.title}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-0.5">
                      {ev.weightPercentage}% • Máx {ev.maxScore}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center bg-indigo-50/70 border-l border-indigo-100 text-indigo-900">
                  Promedio
                </th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((st) => {
                const subAvg = activeSubject
                  ? getStudentSubjectAverage(st.id, activeSubject.id)
                  : null;
                const isPassed =
                  subAvg !== null &&
                  subAvg >= (activeSubject?.minPassingScore || 6.0);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Column */}
                    <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-100">
                      <div className="font-bold text-slate-900 text-xs">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {st.studentIdNumber || st.username}
                      </div>
                    </td>

                    {/* Evaluations Grades Columns */}
                    {subjectEvals.map((ev) => {
                      const grade = gradeItems.find(
                        (g) => g.evaluationId === ev.id && g.studentId === st.id
                      );
                      const score = grade?.score;
                      const hasFeedback = Boolean(grade?.feedback);
                      const commentsCount = grade?.comments?.length || 0;
                      const hasPendingStudentQuery =
                        commentsCount > 0 &&
                        grade?.comments[grade.comments.length - 1].authorRole ===
                          'student';

                      return (
                        <td
                          key={ev.id}
                          className="py-2 px-2 text-center border-l border-slate-100 relative group"
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                setEditingGrade({
                                  evaluation: ev,
                                  student: st,
                                  score:
                                    score !== null && score !== undefined
                                      ? String(score)
                                      : '',
                                  feedback: grade?.feedback || '',
                                })
                              }
                              className={`w-14 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                score !== null && score !== undefined
                                  ? score >= (activeSubject?.minPassingScore || 6.0)
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  : 'bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
                              }`}
                              title="Haz clic para modificar nota y retroalimentación"
                            >
                              {score !== null && score !== undefined
                                ? score.toFixed(1)
                                : '+ Nota'}
                            </button>

                            {/* Indicators below grade button: feedback & student comments */}
                            <div className="flex items-center gap-1">
                              {hasFeedback && (
                                <span
                                  title={`Retroalimentación: ${grade?.feedback}`}
                                  className="w-2 h-2 rounded-full bg-indigo-500"
                                />
                              )}

                              {commentsCount > 0 && (
                                <button
                                  onClick={() =>
                                    setSelectedEvalForComment({
                                      evaluation: ev,
                                      studentId: st.id,
                                    })
                                  }
                                  title={`${commentsCount} comentario(s). ${
                                    hasPendingStudentQuery
                                      ? '¡Consulta pendiente del alumno!'
                                      : ''
                                  }`}
                                  className={`inline-flex items-center gap-0.5 px-1 py-0.2 rounded-sm text-[10px] font-bold ${
                                    hasPendingStudentQuery
                                      ? 'bg-amber-500 text-white animate-pulse'
                                      : 'bg-slate-200 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700'
                                  }`}
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  <span>{commentsCount}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Final Average Column */}
                    <td className="py-3 px-4 text-center border-l border-indigo-100 bg-indigo-50/30">
                      <div className="font-extrabold text-sm">
                        {subAvg !== null ? (
                          <span
                            className={
                              isPassed ? 'text-emerald-700' : 'text-amber-700'
                            }
                          >
                            {subAvg.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs font-normal">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-center">
                      {onSelectStudentReport && (
                        <button
                          onClick={() => onSelectStudentReport(st)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                          Ver Boletín
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade and Feedback Edit Modal */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                  {editingGrade.evaluation.title}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Calificar a {editingGrade.student.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Matrícula: {editingGrade.student.studentIdNumber || 'N/A'} •
                  Ponderación: {editingGrade.evaluation.weightPercentage}%
                </p>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGradeModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota Numérica (0 a {editingGrade.evaluation.maxScore})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={editingGrade.evaluation.maxScore}
                    value={editingGrade.score}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        score: e.target.value,
                      })
                    }
                    placeholder="Ej: 8.5"
                    className="w-full px-3.5 py-2.5 text-base font-bold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800"
                    autoFocus
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-semibold">
                    / {editingGrade.evaluation.maxScore}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Retroalimentación y Observaciones Privadas
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Visible exclusivamente para este alumno
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingGrade.feedback}
                  onChange={(e) =>
                    setEditingGrade({
                      ...editingGrade,
                      feedback: e.target.value,
                    })
                  }
                  placeholder="Escribe comentarios formativos, felicitaciones o puntos a reforzar en el recuperatorio..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder-slate-400 text-slate-800 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Guardar Calificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Evaluation Modal */}
      {showAddEvalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Crear Nueva Evaluación en {activeSubject.name}
              </h3>
              <button
                onClick={() => setShowAddEvalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEvaluation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título de la Evaluación
                </label>
                <input
                  type="text"
                  required
                  value={newEvalTitle}
                  onChange={(e) => setNewEvalTitle(e.target.value)}
                  placeholder="Ej: Examen Parcial II o Trabajo de Investigación"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción o Criterios
                </label>
                <textarea
                  rows={2}
                  value={newEvalDesc}
                  onChange={(e) => setNewEvalDesc(e.target.value)}
                  placeholder="Temas evaluados, pautas de corrección, etc."
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
                    value={newEvalWeight}
                    onChange={(e) => setNewEvalWeight(Number(e.target.value))}
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
                    value={newEvalDate}
                    onChange={(e) => setNewEvalDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Período / Trimestre
                </label>
                <select
                  value={newEvalPeriod}
                  onChange={(e) => setNewEvalPeriod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                >
                  <option value="Primer Trimestre">Primer Trimestre</option>
                  <option value="Segundo Trimestre">Segundo Trimestre</option>
                  <option value="Tercer Trimestre">Tercer Trimestre</option>
                  <option value="Examen Final">Examen Final</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEvalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Crear Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Indicar Nueva Asignatura
                </h3>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubjectFromGradebook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Álgebra Lineal o Historia Universal"
                  value={subNameInput}
                  onChange={(e) => setSubNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Cátedra
                  </label>
                  <input
                    type="text"
                    placeholder="MAT-301"
                    value={subCodeInput}
                    onChange={(e) => setSubCodeInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nota Mínima de Aprobación
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    required
                    value={subMinPassInput}
                    onChange={(e) => setSubMinPassInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción u Objetivos
                </label>
                <textarea
                  rows={2}
                  placeholder="Temas principales o pautas de la materia..."
                  value={subDescInput}
                  onChange={(e) => setSubDescInput(e.target.value)}
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
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Active Subject */}
      {showEditSubjectModal && activeSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Modificar Asignatura
                </h3>
              </div>
              <button
                onClick={() => setShowEditSubjectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditSubjectFromGradebook} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  value={subNameInput}
                  onChange={(e) => setSubNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Cátedra
                  </label>
                  <input
                    type="text"
                    value={subCodeInput}
                    onChange={(e) => setSubCodeInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nota Mínima Aprobación
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    required
                    value={subMinPassInput}
                    onChange={(e) => setSubMinPassInput(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción u Objetivos
                </label>
                <textarea
                  rows={2}
                  value={subDescInput}
                  onChange={(e) => setSubDescInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditSubjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussion Drawer when clicking comment badge */}
      {selectedEvalForComment && activeSubject && (
        <GradeCommentModal
          evaluation={selectedEvalForComment.evaluation}
          subject={activeSubject}
          studentId={selectedEvalForComment.studentId}
          onClose={() => setSelectedEvalForComment(null)}
        />
      )}
    </div>
  );
};
