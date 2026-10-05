import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, Evaluation } from '../../types';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Printer,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { GradeCommentModal } from './GradeCommentModal';
import { ReportCardPrint } from '../common/ReportCardPrint';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    subjects,
    evaluations,
    gradeItems,
    schoolInfo,
    getStudentSubjectAverage,
    getStudentOverallAverage,
    getUnreadTeacherCommentsCount,
  } = useApp();

  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [showReportCard, setShowReportCard] = useState(false);

  if (!currentUser) return null;

  if (showReportCard) {
    return (
      <ReportCardPrint
        student={currentUser}
        onBack={() => setShowReportCard(false)}
      />
    );
  }

  const overallAvg = getStudentOverallAverage(currentUser.id);
  const unreadTeacherMsgs = getUnreadTeacherCommentsCount(currentUser.id);

  const filteredSubjects =
    activeSubjectFilter === 'all'
      ? subjects
      : subjects.filter((s) => s.id === activeSubjectFilter);

  const openCommentModal = (evaluation: Evaluation, subject: Subject) => {
    setSelectedEvaluation(evaluation);
    setSelectedSubject(subject);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Welcome Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Espacio Privado y Confidencial
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                {currentUser.studentIdNumber || 'ALU-2026'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hola, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Aquí puedes revisar tus calificaciones individuales, leer la
              retroalimentación personalizada del docente y hacer preguntas o
              aclaraciones de forma 100% privada.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-xs uppercase font-bold text-slate-300">
                Promedio General
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {overallAvg !== null ? overallAvg.toFixed(2) : '—'}
                <span className="text-xs text-slate-300 font-normal"> / 10</span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                {overallAvg !== null && overallAvg >= 8.5
                  ? 'Sobresaliente 🌟'
                  : overallAvg !== null && overallAvg >= 6.0
                  ? 'Aprobado general ✅'
                  : 'En curso'}
              </div>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="text-center px-2">
              <div className="text-xs uppercase font-bold text-slate-300">
                Asignaturas
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {subjects.length}
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                Matriculadas
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Action / Notification Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800">
              Canal de Comunicación con Docentes
            </div>
            <div className="text-xs text-slate-500">
              {unreadTeacherMsgs > 0 ? (
                <span className="font-semibold text-indigo-600">
                  Tienes {unreadTeacherMsgs} respuesta(s) del profesor en tus
                  evaluaciones.
                </span>
              ) : (
                'Haz clic en "Hacer comentario o duda" en cualquier nota para hablar con el profesor.'
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowReportCard(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          Ver e Imprimir Boletín de Notas
        </button>
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubjectFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubjectFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas las Asignaturas ({subjects.length})
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubjectFilter(sub.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeSubjectFilter === sub.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Subjects & Grades Cards Grid */}
      <div className="space-y-6">
        {filteredSubjects.map((subject) => {
          const subjectEvals = evaluations.filter((e) => e.subjectId === subject.id);
          const subAvg = getStudentSubjectAverage(currentUser.id, subject.id);
          const isPassed = subAvg !== null && subAvg >= subject.minPassingScore;

          return (
            <div
              key={subject.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Subject Header */}
              <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {subject.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Profesor: <strong className="text-slate-800">{subject.teacherName}</strong>
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {subject.description}
                  </p>
                </div>

                {/* Subject Average Score Box */}
                <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Promedio Ponderado
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {subAvg !== null ? (
                        <span
                          className={
                            isPassed ? 'text-emerald-600' : 'text-amber-600'
                          }
                        >
                          {subAvg.toFixed(2)}
                          <span className="text-xs text-slate-400 font-normal">
                            {' '}
                            / {subject.maxScoreScale}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">
                          Sin calificaciones
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pl-3 border-l border-slate-200">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        subAvg !== null
                          ? isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {subAvg !== null ? (
                        isPassed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Aprobado
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Recuperación
                          </>
                        )
                      ) : (
                        'En curso'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Evaluations List */}
              <div className="p-5 sm:p-6 divide-y divide-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Detalle de Evaluaciones ({subjectEvals.length})
                </div>

                {subjectEvals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No hay evaluaciones programadas para esta asignatura todavía.
                  </p>
                ) : (
                  subjectEvals.map((evaluation) => {
                    const grade = gradeItems.find(
                      (g) =>
                        g.evaluationId === evaluation.id &&
                        g.studentId === currentUser.id
                    );
                    const commentsCount = grade?.comments?.length || 0;
                    const hasTeacherResponse =
                      grade?.comments &&
                      grade.comments.length > 0 &&
                      grade.comments[grade.comments.length - 1].authorRole ===
                        'teacher';

                    return (
                      <div
                        key={evaluation.id}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        {/* Evaluation Info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {evaluation.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Ponderación: {evaluation.weightPercentage}%
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {evaluation.date}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {evaluation.description}
                          </p>

                          {/* Teacher's Feedback Snippet if any */}
                          {grade?.feedback && (
                            <div className="mt-2 text-xs bg-indigo-50/70 text-indigo-900 p-2.5 rounded-xl border border-indigo-100/80 flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-indigo-950">
                                  Observación del docente:
                                </span>{' '}
                                <span className="italic">"{grade.feedback}"</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Grade Score and Discussion Trigger */}
                        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                          {/* Score Badge */}
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Tu Calificación
                            </span>
                            {grade?.score !== null && grade?.score !== undefined ? (
                              <div
                                className={`text-xl font-black ${
                                  grade.score >= subject.minPassingScore
                                    ? 'text-emerald-600'
                                    : 'text-amber-600'
                                }`}
                              >
                                {grade.score.toFixed(1)}{' '}
                                <span className="text-xs text-slate-400 font-normal">
                                  / {evaluation.maxScore}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                                Pendiente
                              </span>
                            )}
                          </div>

                          {/* Action Button: Comment or Appeal */}
                          <button
                            onClick={() => openCommentModal(evaluation, subject)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              commentsCount > 0
                                ? hasTeacherResponse
                                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {commentsCount > 0
                                ? `${commentsCount} mensaje${
                                    commentsCount > 1 ? 's' : ''
                                  }`
                                : 'Hacer comentario'}
                            </span>
                            {hasTeacherResponse && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade Comment / Discussion Modal */}
      {selectedEvaluation && selectedSubject && (
        <GradeCommentModal
          evaluation={selectedEvaluation}
          subject={selectedSubject}
          studentId={currentUser.id}
          onClose={() => {
            setSelectedEvaluation(null);
            setSelectedSubject(null);
          }}
        />
      )}
    </div>
  );
};
