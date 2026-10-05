import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, SpreadsheetImportRow } from '../../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Copy,
  Table,
  Plus,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface ParsedColumn {
  index: number;
  originalHeader: string;
  type: 'name' | 'username' | 'password' | 'studentId' | 'score' | 'feedback' | 'subject' | 'ignore';
  evaluationTitle?: string;
  weightPercentage?: number;
}

export const SpreadsheetImporter: React.FC = () => {
  const { subjects, addSubject, bulkImportSpreadsheetData } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [showCreateSubject, setShowCreateSubject] = useState(false);

  // Input source: 'paste' or 'file'
  const [inputMode, setInputMode] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  // Parsed state
  const [delimiter, setDelimiter] = useState<'\t' | ',' | ';' | 'auto'>('auto');
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ParsedColumn[]>([]);
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [importSummary, setImportSummary] = useState<{
    studentsAdded: number;
    gradesUpdated: number;
    evaluationsAdded: number;
  } | null>(null);

  // Example pre-filled template text
  const sampleData = `Matrícula\tNombre del Alumno\tUsuario\tContraseña\tParcial 1 (40%)\tTrabajo Práctico (30%)\tExamen Final (30%)\tObservaciones
ALU-2026-501\tCamila Fernández Beltrán\tcamila.fernandez\talumno123\t8.5\t9.0\t8.8\tExcelente constancia y redacción
ALU-2026-502\tMateo Sebastián Ríos\tmateo.rios\talumno123\t7.0\t8.0\t6.5\tBuen esfuerzo, reforzar la segunda unidad
ALU-2026-503\tValeria Daniela Castro\tvaleria.castro\talumno123\t9.5\t10.0\t9.2\tSobresaliente desempeño analítico
ALU-2026-504\tNicolás Ignacio Paredes\tnicolas.paredes\talumno123\t6.0\t7.5\t6.0\tAprobado, participar más en debates`;

  // Download downloadable CSV sample template
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      'Matricula,Nombre del Alumno,Usuario,Contrasena,Parcial 1,Trabajo Practico,Examen Final,Observaciones\n' +
      'ALU-2026-501,Camila Fernandez,camila.fernandez,alumno123,8.5,9.0,8.8,Excelente rendimiento\n' +
      'ALU-2026-502,Mateo Rios,mateo.rios,alumno123,7.0,8.0,6.5,Buen esfuerzo en clases\n' +
      'ALU-2026-503,Valeria Castro,valeria.castro,alumno123,9.5,10.0,9.2,Sobresaliente participacion';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_calificaciones_edunotas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Detect delimiter
  const detectDelimiter = (text: string): '\t' | ',' | ';' => {
    const firstLine = text.trim().split('\n')[0] || '';
    const tabs = (firstLine.match(/\t/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const commas = (firstLine.match(/,/g) || []).length;

    if (tabs >= semicolons && tabs >= commas && tabs > 0) return '\t';
    if (semicolons >= commas && semicolons > 0) return ';';
    return ',';
  };

  // Handle parsing
  const handleParse = (textToParse: string) => {
    const trimmed = textToParse.trim();
    if (!trimmed) {
      alert('Por favor pega o carga los datos de tu hoja de cálculo.');
      return;
    }

    const effectiveDelimiter =
      delimiter === 'auto' ? detectDelimiter(trimmed) : delimiter;

    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      alert(
        'La hoja de cálculo debe contener al menos 1 fila de encabezados y 1 fila de alumnos con notas.'
      );
      return;
    }

    // Split headers
    const rawHeaders = splitLine(lines[0], effectiveDelimiter);
    const rows = lines.slice(1).map((line) => splitLine(line, effectiveDelimiter));

    // Guess column types
    const mappings: ParsedColumn[] = rawHeaders.map((header, idx) => {
      const h = header.toLowerCase();
      if (
        h.includes('nombre') ||
        h.includes('alumno') ||
        h.includes('estudiante')
      ) {
        return { index: idx, originalHeader: header, type: 'name' };
      }
      if (h.includes('usuario') || h.includes('user') || h.includes('login')) {
        return { index: idx, originalHeader: header, type: 'username' };
      }
      if (
        h.includes('contraseña') ||
        h.includes('contrasena') ||
        h.includes('clave') ||
        h.includes('password')
      ) {
        return { index: idx, originalHeader: header, type: 'password' };
      }
      if (
        h.includes('matr') ||
        h.includes('id') ||
        h.includes('cedula') ||
        h.includes('cédula') ||
        h.includes('dni') ||
        h.includes('legajo')
      ) {
        return { index: idx, originalHeader: header, type: 'studentId' };
      }
      if (
        h.includes('observac') ||
        h.includes('coment') ||
        h.includes('retroalim') ||
        h.includes('feedback')
      ) {
        return { index: idx, originalHeader: header, type: 'feedback' };
      }
      if (
        h.includes('asig') ||
        h.includes('materia') ||
        h.includes('curso') ||
        h.includes('subject')
      ) {
        return { index: idx, originalHeader: header, type: 'subject' };
      }
      // Default rest to scores (evaluations)
      return {
        index: idx,
        originalHeader: header,
        type: 'score',
        evaluationTitle: header,
        weightPercentage: 25,
      };
    });

    // Auto-adjust weights for score columns
    const scoreCols = mappings.filter((m) => m.type === 'score');
    if (scoreCols.length > 0) {
      const evenWeight = Math.round(100 / scoreCols.length);
      scoreCols.forEach((sc, i) => {
        sc.weightPercentage =
          i === scoreCols.length - 1
            ? 100 - evenWeight * (scoreCols.length - 1)
            : evenWeight;
      });
    }

    setParsedHeaders(rawHeaders);
    setParsedRows(rows);
    setColumnMappings(mappings);
    setStep('preview');
  };

  // Helper to split line supporting quoted CSV values
  const splitLine = (line: string, delim: string): string[] => {
    if (delim === '\t') {
      return line.split('\t').map((c) => c.trim().replace(/^"|"$/g, ''));
    }
    // Simple regex for CSV / Semicolon
    const regex = new RegExp(
      `(?:^|${delim})(?:"([^"]*(?:""[^"]*)*)"|([^"${delim}]*))`,
      'g'
    );
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      matches.push(val !== undefined ? val.trim() : '');
    }
    return matches;
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        handleParse(content);
      }
    };
    reader.readAsText(file);
  };

  // Create new subject inline if requested
  const handleCreateNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const created = addSubject({
      name: newSubjectName.trim(),
      code:
        newSubjectCode.trim().toUpperCase() ||
        `CAT-${Math.floor(100 + Math.random() * 900)}`,
      description: 'Asignatura creada mediante importación de planilla',
      teacherName: 'Prof. Aaron Isaac Ordoñez Torres',
      academicYear: '2026',
      minPassingScore: 6.0,
      maxScoreScale: 10,
      color: 'indigo',
    });

    setSelectedSubjectId(created.id);
    setShowCreateSubject(false);
    setNewSubjectName('');
    setNewSubjectCode('');
  };

  // Final execution of import
  const handleExecuteImport = () => {
    if (!selectedSubjectId) {
      alert('Por favor selecciona o crea una asignatura de destino.');
      return;
    }

    const nameCol = columnMappings.find((m) => m.type === 'name');
    if (!nameCol) {
      alert(
        'Debes asignar al menos una columna con el Tipo "Nombre del Alumno".'
      );
      return;
    }

    const usernameCol = columnMappings.find((m) => m.type === 'username');
    const passwordCol = columnMappings.find((m) => m.type === 'password');
    const studentIdCol = columnMappings.find((m) => m.type === 'studentId');
    const feedbackCol = columnMappings.find((m) => m.type === 'feedback');
    const subjectCol = columnMappings.find((m) => m.type === 'subject');
    const scoreCols = columnMappings.filter((m) => m.type === 'score');

    const evalConfigs = scoreCols.map((sc) => ({
      title: sc.evaluationTitle || sc.originalHeader,
      weightPercentage: sc.weightPercentage || 25,
      maxScore: 10,
    }));

    // If an Asignatura column is mapped, group rows by indicated subject!
    if (subjectCol) {
      const rowsBySubject: { [subName: string]: SpreadsheetImportRow[] } = {};
      const subjectEntities: { [subName: string]: Subject } = {};

      parsedRows
        .filter((r) => r[nameCol.index] && r[nameCol.index].trim().length > 0)
        .forEach((r) => {
          const rowSubName =
            r[subjectCol.index]?.trim() || activeSubject?.name || 'Asignatura General';

          if (!rowsBySubject[rowSubName]) {
            rowsBySubject[rowSubName] = [];
            let subObj = subjects.find(
              (s) => s.name.toLowerCase() === rowSubName.toLowerCase()
            );
            if (!subObj) {
              subObj = addSubject({
                name: rowSubName,
                code: `CAT-${Math.floor(100 + Math.random() * 900)}`,
                description: 'Asignatura indicada en planilla de cálculo',
                teacherName: 'Prof. Aaron Isaac Ordoñez Torres',
                academicYear: '2026',
                minPassingScore: 6.0,
                maxScoreScale: 10,
                color: 'indigo',
              });
            }
            subjectEntities[rowSubName] = subObj;
          }

          const studentName = r[nameCol.index].trim();
          const username = usernameCol ? r[usernameCol.index]?.trim() : undefined;
          const password = passwordCol ? r[passwordCol.index]?.trim() : undefined;
          const studentIdNumber = studentIdCol
            ? r[studentIdCol.index]?.trim()
            : undefined;
          const feedback = feedbackCol ? r[feedbackCol.index]?.trim() : undefined;

          const scores: { [evalTitle: string]: number | null } = {};
          scoreCols.forEach((sc) => {
            const rawVal = r[sc.index]?.trim().replace(',', '.');
            const parsedNum = parseFloat(rawVal);
            scores[sc.evaluationTitle || sc.originalHeader] =
              !isNaN(parsedNum) ? parsedNum : null;
          });

          rowsBySubject[rowSubName].push({
            studentName,
            username,
            password,
            studentIdNumber,
            scores,
            feedback,
          });
        });

      let totalStudents = 0;
      let totalGrades = 0;
      let totalEvals = 0;

      Object.entries(rowsBySubject).forEach(([sName, sRows]) => {
        const subId = subjectEntities[sName].id;
        const res = bulkImportSpreadsheetData(subId, evalConfigs, sRows);
        totalStudents += res.studentsAdded;
        totalGrades += res.gradesUpdated;
        totalEvals += res.evaluationsAdded;
      });

      setImportSummary({
        studentsAdded: totalStudents,
        gradesUpdated: totalGrades,
        evaluationsAdded: totalEvals,
      });
      setStep('success');
      return;
    }

    const formattedRows: SpreadsheetImportRow[] = parsedRows
      .filter((r) => r[nameCol.index] && r[nameCol.index].trim().length > 0)
      .map((r) => {
        const studentName = r[nameCol.index].trim();
        const username = usernameCol ? r[usernameCol.index]?.trim() : undefined;
        const password = passwordCol ? r[passwordCol.index]?.trim() : undefined;
        const studentIdNumber = studentIdCol
          ? r[studentIdCol.index]?.trim()
          : undefined;
        const feedback = feedbackCol ? r[feedbackCol.index]?.trim() : undefined;

        const scores: { [evalTitle: string]: number | null } = {};
        scoreCols.forEach((sc) => {
          const rawVal = r[sc.index]?.trim().replace(',', '.');
          const parsedNum = parseFloat(rawVal);
          scores[sc.evaluationTitle || sc.originalHeader] =
            !isNaN(parsedNum) ? parsedNum : null;
        });

        return {
          studentName,
          username,
          password,
          studentIdNumber,
          scores,
          feedback,
        };
      });

    const summary = bulkImportSpreadsheetData(
      selectedSubjectId,
      evalConfigs,
      formattedRows
    );

    setImportSummary(summary);
    setStep('success');
  };

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Alimentar Datos desde Hoja de Cálculo
              </h2>
              <p className="text-xs text-slate-500">
                Carga masiva para el <strong>Prof. Aaron Isaac Ordoñez Torres</strong>.
                Copia y pega desde Excel/Sheets o sube un archivo .CSV.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Descargar Plantilla CSV Modelo
        </button>
      </div>

      {/* Step 1: Input / Paste */}
      {step === 'input' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Target Subject Selector */}
          <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Paso 1: Indicar Asignatura
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  ¿A qué asignatura corresponden estas calificaciones?
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Docente a cargo: <strong>Prof. Aaron Isaac Ordoñez Torres</strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} — Código: {sub.code} ({sub.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateSubject(!showCreateSubject)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Indicar Nueva Asignatura</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              💡 Consejo: Si tu archivo ya contiene una columna llamada "Asignatura" o "Materia",
              podrás mapearla en el siguiente paso para que cada alumno se cargue en su asignatura correspondiente.
            </p>
          </div>

          {/* New Subject Quick Drawer */}
          {showCreateSubject && (
            <form
              onSubmit={handleCreateNewSubject}
              className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Asignatura
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Química Orgánica"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Código (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="QMC-301"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSubject(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Input Method Toggle */}
          <div className="flex border-b border-slate-200 pb-3 gap-4">
            <button
              onClick={() => setInputMode('paste')}
              className={`pb-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                inputMode === 'paste'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Copy className="w-4 h-4" />
              Opción A: Copiar y Pegar desde Excel / Sheets
            </button>

            <button
              onClick={() => setInputMode('file')}
              className={`pb-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                inputMode === 'file'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              Opción B: Subir Archivo (.csv / .txt)
            </button>
          </div>

          {/* Paste Area */}
          {inputMode === 'paste' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Copia las celdas directamente en tu Excel o Google Sheets (Ctrl+C) y
                  pégalas aquí abajo (Ctrl+V):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRawText(sampleData);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cargar datos de ejemplo en el cuadro
                </button>
              </div>

              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Pega aquí los datos copiados de tu planilla de cálculo..."
                className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-800 bg-slate-50/50"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Separador:</span>
                  <select
                    value={delimiter}
                    onChange={(e) =>
                      setDelimiter(
                        e.target.value as '\t' | ',' | ';' | 'auto'
                      )
                    }
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="auto">Automático (Detectar)</option>
                    <option value="	">Tabulación (Copiar de Excel/Sheets)</option>
                    <option value=",">Coma (CSV)</option>
                    <option value=";">Punto y coma (;)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleParse(rawText)}
                  disabled={!rawText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span>Continuar y Previsualizar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* File Upload Area */
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
                <Upload className="w-10 h-10 text-indigo-600 mb-2" />
                <span className="font-bold text-sm text-slate-800">
                  {fileName ? fileName : 'Selecciona o arrastra tu archivo CSV'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Formatos compatibles: .csv, .tsv, .txt delimitado
                </span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {rawText && (
                <div className="text-right">
                  <button
                    onClick={() => handleParse(rawText)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    <span>Continuar y Previsualizar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview & Column Mapping */}
      {step === 'preview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Paso 2: Previsualización y Mapeo
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Revisa las Columnas y Alumnos Detectados
              </h3>
              <p className="text-xs text-slate-500">
                Asignatura: <strong>{activeSubject?.name}</strong> • Se
                importarán <strong>{parsedRows.length}</strong> alumnos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep('input')}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Volver y Modificar
              </button>

              <button
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Guardar e Importar Ahora
              </button>
            </div>
          </div>

          {/* Column Type Selectors Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Configuración de Columnas:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {columnMappings.map((col, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2 rounded-xl border border-slate-200 text-xs"
                >
                  <div
                    className="font-bold text-slate-800 truncate mb-1"
                    title={col.originalHeader}
                  >
                    {col.originalHeader}
                  </div>
                  <select
                    value={col.type}
                    onChange={(e) => {
                      const newType = e.target.value as ParsedColumn['type'];
                      setColumnMappings((prev) =>
                        prev.map((c, i) =>
                          i === idx ? { ...c, type: newType } : c
                        )
                      );
                    }}
                    className="w-full text-[11px] p-1 rounded-md border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="name">👤 Nombre Alumno</option>
                    <option value="subject">📚 Asignatura (Cátedra)</option>
                    <option value="score">📝 Nota / Evaluación</option>
                    <option value="username">🔑 Usuario (Login)</option>
                    <option value="password">🔒 Contraseña</option>
                    <option value="studentId">🆔 Matrícula</option>
                    <option value="feedback">💬 Observación</option>
                    <option value="ignore">❌ Ignorar Columna</option>
                  </select>

                  {col.type === 'score' && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Ponderación:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={col.weightPercentage || 25}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setColumnMappings((prev) =>
                            prev.map((c, i) =>
                              i === idx ? { ...c, weightPercentage: val } : c
                            )
                          );
                        }}
                        className="w-12 text-center p-0.5 border border-slate-200 rounded-sm font-bold text-slate-800"
                      />
                      <span>%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Parsed Rows Table Preview */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  {columnMappings.map((col, idx) => (
                    <th
                      key={idx}
                      className={`py-2.5 px-3 ${
                        col.type === 'ignore'
                          ? 'opacity-40 line-through'
                          : col.type === 'score'
                          ? 'text-indigo-700 bg-indigo-50/50'
                          : ''
                      }`}
                    >
                      {col.originalHeader}
                      <span className="block text-[9px] font-normal lowercase text-slate-500">
                        ({col.type})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                      {rIdx + 1}
                    </td>
                    {row.map((cell, cIdx) => {
                      const colType = columnMappings[cIdx]?.type;
                      return (
                        <td
                          key={cIdx}
                          className={`py-2 px-3 ${
                            colType === 'ignore'
                              ? 'opacity-40'
                              : colType === 'name'
                              ? 'font-bold text-slate-900'
                              : colType === 'score'
                              ? 'font-bold text-emerald-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedRows.length > 10 && (
            <p className="text-xs text-slate-400 text-center italic">
              Mostrando las primeras 10 filas de {parsedRows.length} en total.
            </p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Los alumnos se crearán con sus accesos seguros para consultar sus
                notas en privado.
              </span>
            </div>

            <button
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar y Cargar a la Plataforma
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation */}
      {step === 'success' && importSummary && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl font-black text-slate-900">
            ¡Hoja de Cálculo Importada con Éxito!
          </h3>

          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Los datos han sido incorporados en la cátedra del{' '}
            <strong>Prof. Aaron Isaac Ordoñez Torres</strong>. Cada alumno ya
            puede ingresar con sus credenciales y consultar sus notas.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Nuevos Alumnos
              </span>
              <span className="text-xl font-black text-slate-900">
                {importSummary.studentsAdded}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Evaluaciones
              </span>
              <span className="text-xl font-black text-slate-900">
                {importSummary.evaluationsAdded}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Notas Grabadas
              </span>
              <span className="text-xl font-black text-emerald-600">
                {importSummary.gradesUpdated}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                setRawText('');
                setFileName(null);
                setStep('input');
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Cargar Otra Hoja de Cálculo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
