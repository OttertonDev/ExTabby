import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { signInWithGoogle } from './lib/auth';
import { AppLayout } from './components/layout/AppLayout';
import { TimetablePage } from './pages/TimetablePage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { TCASPage } from './pages/TCASPage';
import { SettingsPage } from './pages/SettingsPage';
import { Button } from './components/ui/button';
import { tabbyAssets } from './lib/tabby';

function AwaitingImplementationPage() {
  return (
    <div className="flex h-full min-h-full items-center justify-center px-6 text-center">
      <p className="font-display text-headline-medium font-black text-muted-foreground">
        Awaits Implementation
      </p>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 md:order-1">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-surface-variant px-4 py-2 text-sm font-bold text-primary">
            <img src={tabbyAssets.icon} alt="" className="size-8 rounded-full object-cover" />
            Extended Companion
          </div>
          <h1 className="font-display text-display-medium font-black leading-tight text-foreground md:text-display-large">
            Tabby
          </h1>
          <p className="mt-4 max-w-xl text-body-large text-muted-foreground">
            Your Web Tabby home for synced timetable, assignments, TCAS planning, and school context from the Android app.
          </p>
          <Button
            onClick={signInWithGoogle}
            size="lg"
            className="mt-8 h-12 rounded-full px-6 text-base shadow-elevation-1"
          >
            Sign in with Google
          </Button>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-[2rem] bg-tabby-mint shadow-elevation-3">
            <img
              src={tabbyAssets.welcome}
              alt="Tabby"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
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
        <Route path="/home" element={<AwaitingImplementationPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/tcas" element={<TCASPage />} />
        <Route path="/classroom" element={<AwaitingImplementationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
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
          <Route path="*" element={<LoginPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
