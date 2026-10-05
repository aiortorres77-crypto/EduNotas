import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { TeacherGradebook } from './TeacherGradebook';
import { TeacherInquiriesInbox } from './TeacherInquiriesInbox';
import { TeacherStudentsList } from './TeacherStudentsList';
import { TeacherSubjectsManager } from './TeacherSubjectsManager';
import { SpreadsheetImporter } from './SpreadsheetImporter';
import { ReportCardPrint } from '../common/ReportCardPrint';
import {
  Users,
  BookOpen,
  MessageSquareQuote,
  GraduationCap,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface TeacherDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const {
    currentUser,
    users,
    subjects,
    gradeItems,
    getPendingStudentInquiriesCount,
  } = useApp();

  const [studentForReport, setStudentForReport] = useState<User | null>(null);

  if (studentForReport) {
    return (
      <ReportCardPrint
        student={studentForReport}
        onBack={() => setStudentForReport(null)}
      />
    );
  }

  const students = users.filter((u) => u.role === 'student');
  const pendingInquiries = getPendingStudentInquiriesCount();

  // Calculate quick stats
  const gradedItems = gradeItems.filter(
    (g) => g.status === 'graded' && g.score !== null
  );
  const totalComments = gradeItems.reduce(
    (sum, g) => sum + (g.comments?.length || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Teacher Welcome & Overview Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Panel Docente de Administración
              </span>
              <span className="text-xs text-slate-300">
                {currentUser?.email}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenido, {currentUser?.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Gestiona notas con total privacidad: cada estudiante solo visualiza sus
              calificaciones particulares y puede dialogar contigo mediante comentarios.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <div className="text-[11px] uppercase font-bold text-slate-300">
                Alumnos
              </div>
              <div className="text-2xl font-black text-white">
                {students.length}
              </div>
              <div className="text-[10px] text-slate-300">Matriculados</div>
            </div>

            <div className="text-center px-2 border-l border-white/15">
              <div className="text-[11px] uppercase font-bold text-slate-300">
                Asignaturas
              </div>
              <div className="text-2xl font-black text-white">
                {subjects.length}
              </div>
              <div className="text-[10px] text-slate-300">En curso</div>
            </div>

            <div className="text-center px-2 border-l border-white/15 col-span-2 sm:col-span-1">
              <div className="text-[11px] uppercase font-bold text-slate-300">
                Consultas
              </div>
              <div
                className={`text-2xl font-black ${
                  pendingInquiries > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {pendingInquiries}
              </div>
              <div className="text-[10px] text-slate-300">
                {pendingInquiries > 0 ? 'Por responder' : 'Al día'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA Banner for Spreadsheet Loading */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 p-4 sm:p-5 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-300">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Alimentar Calificaciones desde Hoja de Cálculo</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Excel & Sheets
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              ¿Tienes un archivo Excel o Google Sheets con las notas de tus alumnos?
              Copia y pega las celdas o sube tu archivo .CSV para alimentar la plataforma en 1 clic.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('spreadsheet')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Cargar Planilla Ahora</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'gradebook' && (
          <TeacherGradebook
            onSelectStudentReport={(st) => setStudentForReport(st)}
          />
        )}

        {activeTab === 'spreadsheet' && <SpreadsheetImporter />}

        {activeTab === 'inquiries' && <TeacherInquiriesInbox />}

        {activeTab === 'students' && (
          <TeacherStudentsList
            onSelectStudentReport={(st) => setStudentForReport(st)}
          />
        )}

        {activeTab === 'subjects' && <TeacherSubjectsManager />}
      </div>
    </div>
  );
};
