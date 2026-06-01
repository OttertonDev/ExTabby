# ExTabby (Tabby)

A modern web application built with React, TypeScript, and Firebase.

## Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library (ready to install)
- **Framer Motion** - Animation library

### Backend & Services
- **Firebase Auth** - Authentication with Google Sign-In
- **Firestore** - NoSQL database
- **Firebase Hosting** - Static site hosting

### PWA
- **vite-plugin-pwa** - Progressive Web App support

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Google provider)
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase config values

4. Run the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/     # React components
├── config/         # Configuration files (Firebase, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and helpers
├── styles/         # Global styles and theme
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
└── main.tsx        # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Firebase Setup

1. Enable Google Authentication in Firebase Console
2. Add your domain to authorized domains
3. Set up Firestore security rules
4. Configure Firebase Hosting (optional)

## License

MIT
