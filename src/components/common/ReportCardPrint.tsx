import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Subject } from '../../types';
import { Printer, ArrowLeft, ShieldCheck, Award, GraduationCap } from 'lucide-react';

interface ReportCardPrintProps {
  student: User;
  onBack: () => void;
}

export const ReportCardPrint: React.FC<ReportCardPrintProps> = ({ student, onBack }) => {
  const {
    subjects,
    evaluations,
    gradeItems,
    schoolInfo,
    getStudentSubjectAverage,
    getStudentOverallAverage,
  } = useApp();

  const overallAvg = getStudentOverallAverage(student.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      {/* Action buttons (hidden when printing) */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis notas
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar en PDF
        </button>
      </div>

      {/* Official Report Card Sheet */}
      <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:border-black print:p-0">
        {/* Header Institution */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold text-2xl print:border print:border-black">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {schoolInfo.schoolName}
              </h1>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Boletín Oficial de Calificaciones y Rendimiento Académico
              </p>
              <p className="text-xs text-slate-500">{schoolInfo.academicTerm}</p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              Fecha de Emisión
            </div>
            <div className="text-xs font-bold text-slate-900">
              {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 justify-end mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Documento Verificado
            </div>
          </div>
        </div>

        {/* Student Data Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">
              Estudiante
            </span>
            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">
              Matrícula / ID
            </span>
            <span className="font-mono font-bold text-slate-800">
              {student.studentIdNumber || 'ALU-REG-2026'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">
              Nivel / División
            </span>
            <span className="font-bold text-slate-800">
              {student.gradeLevel || 'Ciclo Superior'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">
              Promedio General
            </span>
            <span className="font-extrabold text-indigo-700 text-base">
              {overallAvg !== null ? overallAvg.toFixed(2) : '—'} / 10
            </span>
          </div>
        </div>

        {/* Subjects & Detailed Evaluations Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">Código</th>
                <th className="py-2.5 px-3">Asignatura</th>
                <th className="py-2.5 px-3">Profesor a Cargo</th>
                <th className="py-2.5 px-3 text-center">Evaluaciones</th>
                <th className="py-2.5 px-3 text-center">Promedio</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjects.map((sub) => {
                const subAvg = getStudentSubjectAverage(student.id, sub.id);
                const subEvals = evaluations.filter((e) => e.subjectId === sub.id);
                const passed = subAvg !== null && subAvg >= sub.minPassingScore;

                return (
                  <React.Fragment key={sub.id}>
                    <tr className="bg-slate-50/60 font-semibold">
                      <td className="py-3 px-3 font-mono text-slate-500">{sub.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 text-sm">
                        {sub.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{sub.teacherName}</td>
                      <td className="py-3 px-3 text-center text-slate-600">
                        {subEvals.length} instancias
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-sm">
                        {subAvg !== null ? (
                          <span
                            className={
                              passed ? 'text-emerald-700' : 'text-amber-700'
                            }
                          >
                            {subAvg.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">S/C</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {subAvg !== null ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {passed ? 'APROBADO' : 'RECUPERACIÓN'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 text-slate-600">
                            EN CURSO
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Breakdown subrows */}
                    {subEvals.map((ev) => {
                      const grade = gradeItems.find(
                        (g) => g.evaluationId === ev.id && g.studentId === student.id
                      );
                      return (
                        <tr
                          key={ev.id}
                          className="bg-white hover:bg-slate-50/50 text-[11px] text-slate-600"
                        >
                          <td className="py-1.5 px-3 pl-6 text-slate-400" colSpan={2}>
                            ↳ {ev.title} ({ev.weightPercentage}%)
                          </td>
                          <td className="py-1.5 px-3 text-slate-400">{ev.date}</td>
                          <td className="py-1.5 px-3 text-center" colSpan={2}>
                            <span className="font-bold text-slate-800">
                              {grade?.score !== null && grade?.score !== undefined
                                ? grade.score.toFixed(1)
                                : 'Pendiente'}{' '}
                              / {ev.maxScore}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-slate-500 italic truncate max-w-xs">
                            {grade?.feedback ? `"${grade.feedback}"` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Grading scale & Signature block */}
        <div className="border-t border-slate-200 pt-5 mt-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-end gap-8">
          <div className="max-w-md">
            <span className="font-bold text-slate-700 block mb-1">
              Escala de Calificación y Criterios Institucionales:
            </span>
            <p className="text-[11px] leading-relaxed">
              {schoolInfo.gradingScaleNote}. Las calificaciones ponderadas reflejan
              exámenes parciales, controles periódicos, trabajos prácticos y
              participación en aula. Las consultas o aclaraciones fueron resueltas por
              el canal privado del portal.
            </p>
          </div>

          <div className="text-center w-56">
            <div className="border-b-2 border-slate-800 pb-1 mb-1 font-signature text-sm font-semibold text-slate-800">
              Prof. Aaron Isaac Ordoñez Torres
            </div>
            <div className="text-[11px] font-bold text-slate-700">
              Firma y Sello de Cátedra
            </div>
            <div className="text-[10px] text-slate-400">
              Titular Académico
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
