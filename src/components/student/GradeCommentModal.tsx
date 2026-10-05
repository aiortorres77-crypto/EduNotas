import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Evaluation, Subject, GradeItem } from '../../types';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  GraduationCap,
  ShieldCheck,
  Calendar,
  Award,
  FileText,
  Clock,
} from 'lucide-react';

interface GradeCommentModalProps {
  evaluation: Evaluation;
  subject: Subject;
  studentId: string;
  onClose: () => void;
}

export const GradeCommentModal: React.FC<GradeCommentModalProps> = ({
  evaluation,
  subject,
  studentId,
  onClose,
}) => {
  const {
    currentUser,
    getStudentGradeItem,
    createGradeItemIfMissing,
    addComment,
    users,
  } = useApp();

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get or initialize gradeItem
  let gradeItem = getStudentGradeItem(evaluation.id, studentId);
  if (!gradeItem) {
    gradeItem = createGradeItemIfMissing(evaluation.id, studentId);
  }

  const studentUser = users.find((u) => u.id === studentId);
  const isTeacher = currentUser?.role === 'teacher';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting || !gradeItem) return;

    setSubmitting(true);
    addComment(gradeItem.id, message.trim());
    setMessage('');
    setSubmitting(false);
  };

  const comments = gradeItem?.comments || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  {subject.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {evaluation.period}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {evaluation.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {evaluation.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Quick Grade Summary Banner */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Calificación
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {gradeItem.score !== null ? (
                  <span
                    className={
                      gradeItem.score >= subject.minPassingScore
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }
                  >
                    {gradeItem.score.toFixed(1)}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      / {evaluation.maxScore}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium text-xs">
                    Pendiente
                  </span>
                )}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Ponderación
              </span>
              <span className="text-sm font-bold text-slate-800">
                {evaluation.weightPercentage}% de la nota
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Fecha Evaluación
              </span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {evaluation.date}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Alumno
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {studentUser?.name || 'Estudiante'}
              </span>
            </div>
          </div>

          {/* Teacher's formal observation/feedback */}
          {gradeItem.feedback && (
            <div className="mt-3.5 p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block mb-0.5">
                  Retroalimentación del Docente ({subject.teacherName}):
                </span>
                <p className="text-indigo-950 font-normal leading-relaxed">
                  "{gradeItem.feedback}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Comment Thread (Chat / Doubts history) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Hilo de Diálogo y Aclaraciones</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Solo visible entre profesor y alumno</span>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">
                No hay comentarios aún
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {isTeacher
                  ? 'El alumno aún no ha enviado consultas sobre esta calificación.'
                  : '¿Tienes alguna duda sobre tu corrección o examen? Escribe aquí tu comentario para consultar directamente con el profesor.'}
              </p>
            </div>
          ) : (
            comments.map((comm) => {
              const isMyComment = comm.authorId === currentUser?.id;
              const isTeacherComment = comm.authorRole === 'teacher';

              return (
                <div
                  key={comm.id}
                  className={`flex gap-3 ${
                    isMyComment ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white shadow-xs ${
                      isTeacherComment ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  >
                    {isTeacherComment ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : (
                      comm.authorName.charAt(0)
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs ${
                      isMyComment
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : isTeacherComment
                        ? 'bg-white border border-indigo-200/70 text-slate-800 rounded-tl-none shadow-indigo-100/50'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={`font-bold ${
                          isMyComment
                            ? 'text-indigo-100'
                            : isTeacherComment
                            ? 'text-indigo-900'
                            : 'text-slate-900'
                        }`}
                      >
                        {comm.authorName}{' '}
                        {isTeacherComment && (
                          <span className="text-[10px] font-semibold opacity-80">
                            (Docente)
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isMyComment ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {new Date(comm.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        •{' '}
                        {new Date(comm.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {comm.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder={
                  isTeacher
                    ? 'Escribe tu respuesta o comentario al alumno...'
                    : 'Escribe tu consulta o duda sobre esta nota...'
                }
                className="w-full p-3 pr-12 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none transition-all placeholder-slate-400 text-slate-800"
              />
              <button
                type="submit"
                disabled={!message.trim() || submitting}
                className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-all cursor-pointer shadow-xs"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Presiona enviar para notificar y guardar en el registro privado.</span>
              <span>{message.length} car.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
