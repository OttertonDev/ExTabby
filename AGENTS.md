# ExTabby Project Setup

## Overview
ExTabby (public name: "Tabby") is a modern web application with the following architecture:

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components (to be installed)
- **Framer Motion** for animations
- Custom Material 3 Expressive design layer

### Backend & Services
- **Firebase Authentication** with Google Sign-In
- **Firestore** for database
- **Firebase Hosting** for deployment

### PWA
- **vite-plugin-pwa** for Progressive Web App capabilities

## Project Structure

```
src/
├── components/     # React components
├── config/         # Firebase and app configuration
│   └── firebase.ts # Firebase initialization
├── hooks/          # Custom React hooks
│   └── useAuth.ts  # Authentication hook
├── lib/            # Utility functions
│   └── auth.ts     # Auth helper functions
├── styles/         # Global styles and themes
├── types/          # TypeScript type definitions
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Environment Setup

Copy `.env.example` to `.env` and configure Firebase credentials:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## Path Aliases

The project uses `@/` as an alias for `src/`:
```typescript
import { useAuth } from '@/hooks/useAuth'
```

## Next Steps

1. Install shadcn/ui components as needed
2. Implement Material 3 Expressive design system
3. Add Framer Motion animations
4. Set up Firestore data models
5. Configure Firebase Hosting
6. Add PWA icons and manifest customization
