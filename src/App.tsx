import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { tabbyAssets } from './lib/tabby';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { TimetablePage } from './pages/TimetablePage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { TCASPage as TCASSearchPage } from './pages/tcas/TCASSearchPage';
import { UniversityDetailPage } from './pages/tcas/UniversityDetailPage';
import { FacultyDetailPage } from './pages/tcas/FacultyDetailPage';
import { FieldDetailPage } from './pages/tcas/FieldDetailPage';
import { ProgramDetailPage } from './pages/tcas/ProgramDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';

function AwaitingImplementationPage() {
  return (
    <div className="flex h-full min-h-full items-center justify-center px-6 text-center">
      <p className="font-display text-headline-medium font-black text-muted-foreground">
        Awaits Implementation
      </p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex h-full min-h-full items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-headline-medium font-black text-foreground">
          Page not found
        </p>
        <p className="mt-2 text-body-medium text-muted-foreground">
          This Tabby route does not exist yet.
        </p>
      </div>
    </div>
  );
}


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/timetable" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/tcas" element={<TCASSearchPage />} />
        <Route path="/tcas/university/:universityId" element={<UniversityDetailPage />} />
        <Route path="/tcas/university/:universityId/faculty/:facultyId" element={<FacultyDetailPage />} />
        <Route path="/tcas/university/:universityId/faculty/:facultyId/field/:fieldId" element={<FieldDetailPage />} />
        <Route path="/tcas/program/:programId" element={<ProgramDetailPage />} />
        <Route path="/classroom" element={<AwaitingImplementationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-full bg-surface-variant px-5 py-3 text-sm font-bold text-muted-foreground">
          <img src={tabbyAssets.icon} alt="" className="size-8 rounded-full object-cover" />
          Loading Tabby...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user ? (
        <AppLayout>
          <AnimatedRoutes />
        </AppLayout>
      ) : (
        <Routes>
          <Route path="*" element={<LandingPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
