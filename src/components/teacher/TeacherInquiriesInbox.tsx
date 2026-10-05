import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeItem, Subject, Evaluation, User } from '../../types';
import {
  MessageSquare,
  Send,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
  BookOpen,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { GradeCommentModal } from '../student/GradeCommentModal';

export const TeacherInquiriesInbox: React.FC = () => {
  const {
    gradeItems,
    evaluations,
    subjects,
    users,
    addComment,
    getPendingStudentInquiriesCount,
  } = useApp();

  const [filterMode, setFilterMode] = useState<'pending' | 'all'>('pending');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [replyTextMap, setReplyTextMap] = useState<{ [gradeItemId: string]: string }>({});
  const [activeModalItem, setActiveModalItem] = useState<{
    evaluation: Evaluation;
    subject: Subject;
    studentId: string;
  } | null>(null);

  // Collect all grade items that have comments
  const itemsWithComments = gradeItems.filter(
    (g) => g.comments && g.comments.length > 0
  );

  const inboxData = itemsWithComments
    .map((item) => {
      const evaluation = evaluations.find((e) => e.id === item.evaluationId);
      const subject = evaluation
        ? subjects.find((s) => s.id === evaluation.subjectId)
        : undefined;
      const student = users.find((u) => u.id === item.studentId);
      const lastComment = item.comments[item.comments.length - 1];
      const isPending = lastComment?.authorRole === 'student';

      return {
        item,
        evaluation,
        subject,
        student,
        lastComment,
        isPending,
      };
    })
    .filter((entry) => entry.evaluation && entry.subject && entry.student);

  // Apply filters
  const filteredInbox = inboxData
    .filter((entry) => {
      if (filterMode === 'pending') return entry.isPending;
      return true;
    })
    .filter((entry) => {
      if (selectedSubjectId === 'all') return true;
      return entry.subject?.id === selectedSubjectId;
    })
    .sort((a, b) => {
      // Pending first, then newest
      if (a.isPending && !b.isPending) return -1;
      if (!a.isPending && b.isPending) return 1;
      const dateA = new Date(a.lastComment?.createdAt || 0).getTime();
      const dateB = new Date(b.lastComment?.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const pendingCount = getPendingStudentInquiriesCount();

  const handleSendReply = (gradeItemId: string) => {
    const text = replyTextMap[gradeItemId];
    if (!text || !text.trim()) return;

    addComment(gradeItemId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [gradeItemId]: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              Bandeja de Consultas de Alumnos
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse">
                {pendingCount} por responder
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Los alumnos pueden realizar preguntas o solicitar aclaraciones privadas sobre
            sus notas. Respóndeles aquí directamente.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'pending'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({inboxData.length})
            </button>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="all">Todas las Asignaturas</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inbox List */}
      {filteredInbox.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {filterMode === 'pending'
              ? '¡No tienes consultas pendientes!'
              : 'No hay mensajes registrados.'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {filterMode === 'pending'
              ? 'Todas las dudas y comentarios de los estudiantes han sido respondidos satisfactoriamente.'
              : 'Cuando un alumno comente alguna calificación, aparecerá aquí organizada cronológicamente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInbox.map(
            ({ item, evaluation, subject, student, lastComment, isPending }) => {
              if (!evaluation || !subject || !student) return null;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border transition-all p-5 shadow-xs ${
                    isPending
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar of Inquiry Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {student.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {student.studentIdNumber || student.username}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-indigo-700">
                            {subject.name}
                          </span>
                          <span>•</span>
                          <span>{evaluation.title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Score Badge */}
                      <div className="bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-400 mr-1 text-[10px] uppercase font-bold">
                          Nota:
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {item.score !== null ? `${item.score.toFixed(1)} / ${evaluation.maxScore}` : 'S/C'}
                        </span>
                      </div>

                      {/* Pending vs Answered Status */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isPending ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Requiere Respuesta
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Respondido
                          </>
                        )}
                      </span>

                      {/* Open Full Thread Button */}
                      <button
                        onClick={() =>
                          setActiveModalItem({
                            evaluation,
                            subject,
                            studentId: student.id,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Abrir historial completo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Previous Thread Snippet */}
                  <div className="my-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {item.comments.map((c) => (
                      <div
                        key={c.id}
                        className={`p-3 rounded-2xl text-xs ${
                          c.authorRole === 'teacher'
                            ? 'bg-indigo-50/70 border border-indigo-100 text-indigo-950 ml-6'
                            : 'bg-slate-50 border border-slate-200 text-slate-800 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                          <span
                            className={
                              c.authorRole === 'teacher'
                                ? 'text-indigo-700'
                                : 'text-slate-700'
                            }
                          >
                            {c.authorName} ({c.authorRole === 'teacher' ? 'Docente' : 'Alumno'})
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(c.createdAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Reply Form */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Escribir respuesta para ${student.name}...`}
                      value={replyTextMap[item.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({
                          ...replyTextMap,
                          [item.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendReply(item.id);
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      onClick={() => handleSendReply(item.id)}
                      disabled={!(replyTextMap[item.id] || '').trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Responder
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* Full Comment Modal */}
      {activeModalItem && (
        <GradeCommentModal
          evaluation={activeModalItem.evaluation}
          subject={activeModalItem.subject}
          studentId={activeModalItem.studentId}
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </div>
  );
};
