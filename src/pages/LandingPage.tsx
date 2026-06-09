import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { tabbyAssets } from '@/lib/tabby';
import { signInWithGoogle, DEMO_MODE_STORAGE_KEY, notifyAuthChanged } from '@/lib/auth';

const FEATURES = [
  { icon: '📅', title: 'Timetable', desc: 'See your weekly schedule at a glance, synced directly from the Android app.' },
  { icon: '✅', title: 'Assignments', desc: 'Track homework and deadlines. Never miss a submission again.' },
  { icon: '🎓', title: 'TCAS Planning', desc: 'Browse universities, faculties, and programs — all in one place.' },
  { icon: '🏫', title: 'School Context', desc: 'Classroom info and school calendar pulled straight from your Android Tabby.' },
];

const NAV_LINKS = [
  { label: 'FAQ', href: '#faq' },
  { label: 'Get Android App', href: 'https://github.com/OttertonDev/Tabby-Schedule', external: true },
];

const FOOTER_LINKS = [
  { label: 'Download Android', href: 'https://github.com/OttertonDev/Tabby-Schedule', external: true },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy', href: '#privacy' },
];

const ease = [0.2, 0, 0, 1] as const;

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDemo = () => {
    localStorage.setItem(
      DEMO_MODE_STORAGE_KEY,
      JSON.stringify({ uid: 'demo-user', email: 'demo@tabby.app', displayName: 'Demo User', photoURL: tabbyAssets.icon })
    );
    notifyAuthChanged();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src={tabbyAssets.icon} alt="Tabby" className="size-8 rounded-full object-cover" />
            <span className="font-display text-title-large font-black" style={{ fontVariationSettings: '"wght" 1000' }}>
              Tabby
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, href, external }) => (
              <a key={label} href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-variant hover:text-foreground"
              >
                {label}
              </a>
            ))}
            <Button size="sm" className="ml-2 rounded-full px-5" onClick={signInWithGoogle}>
              Sign in
            </Button>
          </nav>

          {/* Mobile: Sign in + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Button size="sm" className="rounded-full px-4" onClick={signInWithGoogle}>
              Sign in
            </Button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-variant hover:text-foreground"
            >
              {/* Animated hamburger → X */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="17" y2="6" />
                    <line x1="3" y1="10" x2="17" y2="10" />
                    <line x1="3" y1="14" x2="17" y2="14" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease }}
              className="overflow-hidden border-t border-border/50 bg-background/95 px-6 md:hidden"
            >
              <div className="flex flex-col py-3">
                {NAV_LINKS.map(({ label, href, external }) => (
                  <a key={label} href={href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          <h1
            className="font-display text-display-small font-black leading-tight sm:text-display-medium md:text-display-large"
            style={{ fontVariationSettings: '"wght" 1000, "ROND" 50' }}
          >
            Your school life,<br />on the web.
          </h1>
          <p className="mt-4 max-w-lg text-body-large text-muted-foreground">
            Tabby Web syncs with your Android app to bring your timetable, assignments, and TCAS planning to any browser.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="h-12 rounded-full px-7 text-base shadow-elevation-1" onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full px-7 text-base" onClick={handleDemo}>
              Try Demo
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: 0.08 }}
          className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md"
        >
          <div className="aspect-square overflow-hidden rounded-[2.5rem] bg-tabby-mint shadow-elevation-3">
            <img src={tabbyAssets.welcome} alt="Tabby mascot" className="h-full w-full object-cover" />
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="bg-surface-variant/50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, ease }}
            className="mb-8 font-display text-headline-medium font-black"
            style={{ fontVariationSettings: '"wght" 1000' }}
          >
            Everything in one place
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, ease, delay: i * 0.07 }}
                className="rounded-[1.375rem] bg-background p-5 ring-1 ring-border/20 shadow-elevation-1"
              >
                <span className="text-3xl">{icon}</span>
                <h3 className="mt-3 font-display text-title-medium font-black" style={{ fontVariationSettings: '"wght" 1000' }}>{title}</h3>
                <p className="mt-1 text-body-medium text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 font-display text-headline-medium font-black" style={{ fontVariationSettings: '"wght" 1000' }}>FAQ</h2>
        {[
          { q: 'Do I need the Android app?', a: 'Yes — Tabby Web is a companion to the Android app. Your data syncs from the app.' },
          { q: 'Is Tabby Web free?', a: 'Yes, Tabby Web is completely free to use.' },
          { q: 'Which browsers are supported?', a: 'Any modern browser — Chrome, Firefox, Safari, Edge. Tabby Web is also installable as a PWA.' },
          { q: 'Where is my data stored?', a: 'Your data is synced from the Android app and lives entirely in your own account. Tabby Web has no separate backend.' },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-border py-5">
            <p className="font-display font-bold text-foreground" style={{ fontVariationSettings: '"wght" 700' }}>{q}</p>
            <p className="mt-1.5 text-body-medium text-muted-foreground">{a}</p>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={tabbyAssets.icon} alt="" className="size-6 rounded-full object-cover" />
            <span className="text-sm font-bold text-muted-foreground">Tabby Web</span>
          </div>
          <nav className="flex flex-wrap gap-5">
            {FOOTER_LINKS.map(({ label, href, external }) => (
              <a key={label} href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  );
}
