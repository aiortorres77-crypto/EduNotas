import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

const MainLayout: React.FC = () => {
  const { currentUser } = useApp();
  const [activeTeacherTab, setActiveTeacherTab] = useState<string>('gradebook');

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        activeTab={activeTeacherTab}
        setActiveTab={setActiveTeacherTab}
      />

      <main className="flex-1 pb-16">
        {currentUser.role === 'teacher' ? (
          <TeacherDashboard
            activeTab={activeTeacherTab}
            setActiveTab={setActiveTeacherTab}
          />
        ) : (
          <StudentDashboard />
        )}
      </main>

      {/* Discreet footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 no-print">
        <p>
          EduNotas AIOT • Cátedra del Prof. Aaron Isaac Ordoñez Torres • Sistema
          Privado de Calificaciones y Diálogo Académico
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
