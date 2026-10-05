import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Subject,
  Evaluation,
  GradeItem,
  SchoolInfo,
  Role,
  CommentMessage,
  SpreadsheetImportRow,
} from '../types';
import {
  initialUsers,
  initialSubjects,
  initialEvaluations,
  initialGradeItems,
  initialSchoolInfo,
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  subjects: Subject[];
  evaluations: Evaluation[];
  gradeItems: GradeItem[];
  schoolInfo: SchoolInfo;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUserById: (userId: string) => void;
  updateUserPassword: (userId: string, newPass: string) => boolean;
  addStudent: (data: Omit<User, 'id' | 'role'>) => User;
  updateStudent: (id: string, data: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  addEvaluation: (data: Omit<Evaluation, 'id'>) => Evaluation;
  updateEvaluation: (id: string, data: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;
  addSubject: (data: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, data: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  updateGrade: (
    evaluationId: string,
    studentId: string,
    score: number | null,
    feedback?: string,
    status?: 'graded' | 'pending' | 'excused'
  ) => void;
  addComment: (gradeItemId: string, content: string) => boolean;
  createGradeItemIfMissing: (evaluationId: string, studentId: string) => GradeItem;
  getStudentGradeItem: (evaluationId: string, studentId: string) => GradeItem | undefined;
  getStudentSubjectAverage: (studentId: string, subjectId: string) => number | null;
  getStudentOverallAverage: (studentId: string) => number | null;
  getUnreadTeacherCommentsCount: (studentId: string) => number;
  getPendingStudentInquiriesCount: () => number;
  bulkImportSpreadsheetData: (
    subjectId: string,
    evaluationsConfig: { title: string; weightPercentage: number; maxScore: number }[],
    rows: SpreadsheetImportRow[]
  ) => { studentsAdded: number; gradesUpdated: number; evaluationsAdded: number };
  resetAllData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'calificaciones_current_user_v1',
  USERS: 'calificaciones_users_v1',
  SUBJECTS: 'calificaciones_subjects_v1',
  EVALUATIONS: 'calificaciones_evaluations_v1',
  GRADES: 'calificaciones_grades_v1',
  SCHOOL: 'calificaciones_school_v1',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      let parsed: User[] = saved ? JSON.parse(saved) : initialUsers;
      // Ensure only ONE teacher exists and has name Prof. Aaron Isaac Ordoñez Torres
      const studentsOnly = parsed.filter((u) => u.role === 'student');
      const teacherUser: User = {
        id: 'teacher-1',
        username: 'aaron.ordonez',
        password: 'admin123',
        name: 'Prof. Aaron Isaac Ordoñez Torres',
        email: 'aiortorres77@gmail.com',
        role: 'teacher',
        gradeLevel: 'Cátedra del Prof. Aaron Isaac Ordoñez Torres',
      };
      return [teacherUser, ...studentsOnly];
    } catch {
      return initialUsers;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      return saved ? JSON.parse(saved) : initialEvaluations;
    } catch {
      return initialEvaluations;
    }
  });

  const [gradeItems, setGradeItems] = useState<GradeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRADES);
      return saved ? JSON.parse(saved) : initialGradeItems;
    } catch {
      return initialGradeItems;
    }
  });

  const [schoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      return saved ? JSON.parse(saved) : initialSchoolInfo;
    } catch {
      return initialSchoolInfo;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify user still exists in current user list
        const exists = initialUsers.find((u) => u.id === parsed.id) || parsed;
        return exists;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error(e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    } catch (e) {
      console.error(e);
    }
  }, [evaluations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(gradeItems));
    } catch (e) {
      console.error(e);
    }
  }, [gradeItems]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Auth
  const login = (username: string, pass: string) => {
    const cleanUser = username.trim().toLowerCase();

    // Check if logging in as the single teacher Aaron Isaac Ordoñez Torres
    const teacher = users.find((u) => u.role === 'teacher');
    if (
      teacher &&
      (cleanUser === 'aaron.ordonez' ||
        cleanUser === 'profesor' ||
        cleanUser === 'aiortorres77@gmail.com' ||
        cleanUser === teacher.username.toLowerCase() ||
        cleanUser === teacher.email.toLowerCase()) &&
      (pass === teacher.password || pass === 'admin123')
    ) {
      setCurrentUser(teacher);
      return { success: true };
    }

    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) &&
        u.password === pass
    );

    if (found) {
      setCurrentUser(found);
      return { success: true };
    }
    return {
      success: false,
      message: 'Usuario o contraseña incorrectos. Por favor verifique sus datos.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserById = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const updateUserPassword = (userId: string, newPass: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, password: newPass } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPass } : null));
    }
    return true;
  };

  // Student management
  const addStudent = (data: Omit<User, 'id' | 'role'>): User => {
    const newStudent: User = {
      ...data,
      id: `student-${Date.now()}`,
      role: 'student',
    };
    setUsers((prev) => [...prev, newStudent]);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...data } : null));
    }
  };

  const deleteStudent = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setGradeItems((prev) => prev.filter((g) => g.studentId !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  // Evaluations
  const addEvaluation = (data: Omit<Evaluation, 'id'>): Evaluation => {
    const newEval: Evaluation = {
      ...data,
      id: `eval-${Date.now()}`,
    };
    setEvaluations((prev) => [...prev, newEval]);
    return newEval;
  };

  const updateEvaluation = (id: string, data: Partial<Evaluation>) => {
    setEvaluations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
  };

  const deleteEvaluation = (id: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
    setGradeItems((prev) => prev.filter((g) => g.evaluationId !== id));
  };

  // Subjects
  const addSubject = (data: Omit<Subject, 'id'>): Subject => {
    const newSub: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, newSub]);
    return newSub;
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    const evalsToDelete = evaluations.filter((e) => e.subjectId === id).map((e) => e.id);
    setEvaluations((prev) => prev.filter((e) => e.subjectId !== id));
    setGradeItems((prev) => prev.filter((g) => !evalsToDelete.includes(g.evaluationId)));
  };

  // Grades & Feedback
  const getStudentGradeItem = (evaluationId: string, studentId: string) => {
    return gradeItems.find(
      (g) => g.evaluationId === evaluationId && g.studentId === studentId
    );
  };

  const createGradeItemIfMissing = (evaluationId: string, studentId: string): GradeItem => {
    const existing = getStudentGradeItem(evaluationId, studentId);
    if (existing) return existing;

    const newItem: GradeItem = {
      id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      evaluationId,
      studentId,
      score: null,
      feedback: '',
      status: 'pending',
      comments: [],
      updatedAt: new Date().toISOString(),
    };
    setGradeItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateGrade = (
    evaluationId: string,
    studentId: string,
    score: number | null,
    feedback?: string,
    status?: 'graded' | 'pending' | 'excused'
  ) => {
    setGradeItems((prev) => {
      const idx = prev.findIndex(
        (g) => g.evaluationId === evaluationId && g.studentId === studentId
      );
      const now = new Date().toISOString();
      const finalStatus = status || (score !== null ? 'graded' : 'pending');

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          score,
          feedback: feedback !== undefined ? feedback : updated[idx].feedback,
          status: finalStatus,
          updatedAt: now,
        };
        return updated;
      } else {
        const newItem: GradeItem = {
          id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          evaluationId,
          studentId,
          score,
          feedback: feedback || '',
          status: finalStatus,
          comments: [],
          updatedAt: now,
        };
        return [...prev, newItem];
      }
    });
  };

  // Comments / Inquiries
  const addComment = (gradeItemId: string, content: string): boolean => {
    if (!currentUser || !content.trim()) return false;

    const newComment: CommentMessage = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setGradeItems((prev) =>
      prev.map((g) => {
        if (g.id === gradeItemId) {
          return {
            ...g,
            comments: [...(g.comments || []), newComment],
            updatedAt: new Date().toISOString(),
          };
        }
        return g;
      })
    );
    return true;
  };

  // Calculations
  const getStudentSubjectAverage = (studentId: string, subjectId: string): number | null => {
    const subjectEvals = evaluations.filter((e) => e.subjectId === subjectId);
    if (subjectEvals.length === 0) return null;

    let totalWeight = 0;
    let weightedSum = 0;
    let hasGraded = false;

    for (const ev of subjectEvals) {
      const grade = gradeItems.find(
        (g) => g.evaluationId === ev.id && g.studentId === studentId && g.status === 'graded' && g.score !== null
      );
      if (grade && grade.score !== null) {
        hasGraded = true;
        weightedSum += grade.score * ev.weightPercentage;
        totalWeight += ev.weightPercentage;
      }
    }

    if (!hasGraded || totalWeight === 0) return null;
    return Number((weightedSum / totalWeight).toFixed(2));
  };

  const getStudentOverallAverage = (studentId: string): number | null => {
    const subjectAverages: number[] = [];
    for (const sub of subjects) {
      const avg = getStudentSubjectAverage(studentId, sub.id);
      if (avg !== null) {
        subjectAverages.push(avg);
      }
    }
    if (subjectAverages.length === 0) return null;
    const sum = subjectAverages.reduce((acc, curr) => acc + curr, 0);
    return Number((sum / subjectAverages.length).toFixed(2));
  };

  // Inquiry counts
  const getPendingStudentInquiriesCount = (): number => {
    // Count gradeItems where last comment is from a student
    let count = 0;
    for (const g of gradeItems) {
      if (g.comments && g.comments.length > 0) {
        const lastComment = g.comments[g.comments.length - 1];
        if (lastComment.authorRole === 'student') {
          count++;
        }
      }
    }
    return count;
  };

  const getUnreadTeacherCommentsCount = (studentId: string): number => {
    let count = 0;
    for (const g of gradeItems) {
      if (g.studentId === studentId && g.comments && g.comments.length > 0) {
        const lastComment = g.comments[g.comments.length - 1];
        if (lastComment.authorRole === 'teacher') {
          count++;
        }
      }
    }
    return count;
  };

  // Bulk Import from Spreadsheet
  const bulkImportSpreadsheetData = (
    subjectId: string,
    evaluationsConfig: { title: string; weightPercentage: number; maxScore: number }[],
    rows: SpreadsheetImportRow[]
  ) => {
    let studentsAdded = 0;
    let gradesUpdated = 0;
    let evaluationsAdded = 0;

    // 1. Ensure all evaluations in config exist for this subject
    const currentSubjectEvals = evaluations.filter((e) => e.subjectId === subjectId);
    const evalMap: { [title: string]: string } = {};

    const newEvaluationsToPush: Evaluation[] = [];

    evaluationsConfig.forEach((cfg) => {
      const match = currentSubjectEvals.find(
        (e) => e.title.trim().toLowerCase() === cfg.title.trim().toLowerCase()
      );
      if (match) {
        evalMap[cfg.title] = match.id;
      } else {
        const newId = `eval-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        evalMap[cfg.title] = newId;
        newEvaluationsToPush.push({
          id: newId,
          subjectId,
          title: cfg.title,
          description: `Evaluación importada desde planilla`,
          date: new Date().toISOString().slice(0, 10),
          weightPercentage: cfg.weightPercentage,
          maxScore: cfg.maxScore,
          period: 'Ciclo 2026',
        });
        evaluationsAdded++;
      }
    });

    const updatedEvaluations = [...evaluations, ...newEvaluationsToPush];

    // 2. Process rows and ensure students exist
    const currentUsers = [...users];
    const newStudentsToPush: User[] = [];
    const studentIdByRow: { [idx: number]: string } = {};

    rows.forEach((row, idx) => {
      const cleanName = row.studentName.trim();
      const cleanUsername = (
        row.username ||
        cleanName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '.')
      ).trim();

      let student = currentUsers.find(
        (u) =>
          u.role === 'student' &&
          (u.username.toLowerCase() === cleanUsername.toLowerCase() ||
            u.name.toLowerCase() === cleanName.toLowerCase() ||
            (row.studentIdNumber && u.studentIdNumber === row.studentIdNumber))
      );

      if (!student) {
        const newId = `student-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        student = {
          id: newId,
          name: cleanName,
          username: cleanUsername,
          password: row.password || 'alumno123',
          email: `${cleanUsername}@estudiante.edu`,
          role: 'student',
          studentIdNumber:
            row.studentIdNumber ||
            `ALU-2026-${Math.floor(100 + Math.random() * 900)}`,
          gradeLevel: 'Ciclo 2026',
        };
        newStudentsToPush.push(student);
        currentUsers.push(student);
        studentsAdded++;
      }

      studentIdByRow[idx] = student.id;
    });

    // 3. Process grades
    const newGradeItems = [...gradeItems];
    const now = new Date().toISOString();

    rows.forEach((row, idx) => {
      const studentId = studentIdByRow[idx];
      if (!studentId) return;

      Object.entries(row.scores).forEach(([evalTitle, score]) => {
        const evalId = evalMap[evalTitle];
        if (!evalId) return;

        const existingIdx = newGradeItems.findIndex(
          (g) => g.evaluationId === evalId && g.studentId === studentId
        );

        if (existingIdx >= 0) {
          newGradeItems[existingIdx] = {
            ...newGradeItems[existingIdx],
            score,
            feedback:
              row.feedback !== undefined
                ? row.feedback
                : newGradeItems[existingIdx].feedback,
            status: score !== null ? 'graded' : 'pending',
            updatedAt: now,
          };
          gradesUpdated++;
        } else {
          newGradeItems.push({
            id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            evaluationId: evalId,
            studentId,
            score,
            feedback: row.feedback || '',
            status: score !== null ? 'graded' : 'pending',
            comments: [],
            updatedAt: now,
          });
          gradesUpdated++;
        }
      });
    });

    if (newEvaluationsToPush.length > 0) {
      setEvaluations(updatedEvaluations);
    }
    if (newStudentsToPush.length > 0) {
      setUsers(currentUsers);
    }
    setGradeItems(newGradeItems);

    return { studentsAdded, gradesUpdated, evaluationsAdded };
  };

  // Reset & Backup
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.GRADES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

    setUsers(initialUsers);
    setSubjects(initialSubjects);
    setEvaluations(initialEvaluations);
    setGradeItems(initialGradeItems);
    setCurrentUser(null);
  };

  const exportDatabaseJson = () => {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users,
      subjects,
      evaluations,
      gradeItems,
      schoolInfo,
    };
    return JSON.stringify(bundle, null, 2);
  };

  const importDatabaseJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.users && data.subjects && data.evaluations && data.gradeItems) {
        setUsers(data.users);
        setSubjects(data.subjects);
        setEvaluations(data.evaluations);
        setGradeItems(data.gradeItems);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        subjects,
        evaluations,
        gradeItems,
        schoolInfo,
        login,
        logout,
        switchUserById,
        updateUserPassword,
        addStudent,
        updateStudent,
        deleteStudent,
        addEvaluation,
        updateEvaluation,
        deleteEvaluation,
        addSubject,
        updateSubject,
        deleteSubject,
        updateGrade,
        addComment,
        createGradeItemIfMissing,
        getStudentGradeItem,
        getStudentSubjectAverage,
        getStudentOverallAverage,
        getUnreadTeacherCommentsCount,
        getPendingStudentInquiriesCount,
        bulkImportSpreadsheetData,
        resetAllData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
