export type Role = 'teacher' | 'student';

export interface User {
  id: string;
  username: string; // Used for login
  password: string; // Plain/hashed for client-side demo persistence
  name: string;
  email: string;
  role: Role;
  studentIdNumber?: string; // e.g. "MAT-2026-081"
  avatarUrl?: string;
  gradeLevel?: string; // e.g. "4to Año Secundaria - Grupo B"
}

export interface CommentMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string; // ISO string
}

export interface GradeItem {
  id: string;
  evaluationId: string;
  studentId: string;
  score: number | null; // e.g., 8.5 (null if not graded yet)
  feedback?: string; // Private comment from teacher to this student
  submittedAt?: string;
  status: 'graded' | 'pending' | 'excused';
  comments: CommentMessage[]; // Thread of comments between student and teacher
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  date: string;
  weightPercentage: number; // e.g., 25%
  maxScore: number; // default 10 or 100
  period: string; // e.g. "1er Trimestre" | "2do Trimestre" | "Parcial 1"
}

export interface Subject {
  id: string;
  name: string;
  code: string; // e.g. "MAT-101"
  teacherName: string;
  description: string;
  academicYear: string; // e.g. "Ciclo 2026"
  minPassingScore: number; // e.g. 6.0 or 60
  maxScoreScale: number; // e.g. 10 or 100
  color: string; // Tailwind color class or hex
}

export interface SchoolInfo {
  schoolName: string;
  academicTerm: string;
  teacherTitle: string;
  gradingScaleNote: string;
}

export interface SpreadsheetImportRow {
  studentName: string;
  username?: string;
  password?: string;
  studentIdNumber?: string;
  scores: { [evalTitle: string]: number | null };
  feedback?: string;
}

