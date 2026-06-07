# TCAS Feature Implementation Plan

## Executive Summary
Mirror the complete TCAS (Thai University Central Admission System) functionality from Android Tabby to ExTabby web app, replacing the current mock data page with a fully functional university program browser using real public data.

## Current State Analysis

### Android App (Reference Implementation)
- **Data Source:** Public S3 API (`my-tcas.s3.ap-southeast-1.amazonaws.com`)
- **Architecture:** Standalone feature, no Firebase integration
- **Features:**
  - University browser with logos
  - Search & filter (text + multi-criteria)
  - Hierarchical navigation (University → Faculty → Field → Program)
  - Program detail pages with admission rounds (รอบ 1-4)
  - Offline caching with IndexedDB-like storage
  - Bilingual Thai/English display

### ExTabby Web (Current State)
- **Status:** Mock data placeholder at `/tcas` route
- **Tech Stack:** React 19, TypeScript, React Router, Tailwind CSS, Framer Motion
- **Patterns:** 
  - Page layout: `TabbyPageHeader` + `TabbySection` components
  - Data fetching: Custom hooks (see `useFirestoreSync.ts`)
  - Motion: Framer Motion with Material 3 Expressive transitions
  - Styling: Tailwind + custom Material 3 tokens
- **Dependencies Available:**
  - `fuse.js` for fuzzy search
  - `@tanstack/react-table` (for advanced tables if needed)
  - React Router 7 for routing

## Implementation Strategy

### Phase 1: Data Layer (Priority: HIGH)

#### 1.1 TypeScript Types
**File:** `src/types/tcas.ts`

Define exact type mappings from Android Kotlin data classes:
```typescript
// Core entities
- TcasUniversity
- TcasFaculty
- TcasField
- TcasProgram
- TcasRoundProject
- TcasRoundGroup

// API response types
- UniversityApiResponse[]
- ProgramApiResponse[]
- RoundProjectApiResponse[]

// UI helper types
- TcasFilterOption
- TcasSearchState
```

#### 1.2 API Client
**File:** `src/lib/tcas/tcasClient.ts`

Implement fetching with browser-native caching:
- Base URL: `https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas`
- Endpoints:
  - `/universities.json`
  - `/courses.json`
  - `/rounds/{programId}.json`
- Use **Cache API** (native browser cache) for offline support
- Fallback to localStorage for metadata
- Implement exponential backoff for failed requests
- Logo fetching with fallback icon support

**Key Functions:**
```typescript
- fetchUniversities(): Promise<TcasUniversity[]>
- fetchPrograms(): Promise<TcasProgram[]>
- fetchRoundsForProgram(programId: string): Promise<TcasRoundProject[]>
- prefetchLogo(universityId: string): Promise<void>
- clearCache(): Promise<void>
```

#### 1.3 Data Parser
**File:** `src/lib/tcas/tcasParser.ts`

Transform API JSON to TypeScript types:
- Parse university data with logo URL construction
- Parse program data with all bilingual fields
- Parse round projects with round number extraction from `type` field
- Handle missing/null fields gracefully

#### 1.4 Search & Filter Logic
**File:** `src/lib/tcas/tcasSearch.ts`

Port Android search algorithms:
- **Text search:** Use `fuse.js` for fuzzy matching across all program fields
- **Multi-criteria filters:** University + Field combination
- **Hierarchical extraction:** Build university → faculty → field hierarchy
- **Sort:** University name → Faculty name → Program name
- **Limit:** 80 results max (performance)
- **Round grouping:** Group projects by round number (1-4 only)

**Key Functions:**
```typescript
- filterPrograms(programs, query, filters): TcasProgram[]
- getUniversityOptions(programs): TcasFilterOption[]
- getFieldOptions(programs): TcasFilterOption[]
- getFacultiesForUniversity(programs, universityId): TcasFaculty[]
- getFieldsForFaculty(programs, facultyId): TcasField[]
- getProgramsForField(programs, fieldId): TcasProgram[]
- groupRoundsByNumber(rounds): TcasRoundGroup[]
```

### Phase 2: State Management (Priority: HIGH)

#### 2.1 Custom Hooks
**File:** `src/hooks/useTcas.ts`

Main data hook with caching:
```typescript
export function useTcasData() {
  // Fetch universities & programs on mount
  // Cache in React state + browser Cache API
  // Return: { universities, programs, loading, error, refresh }
}

export function useTcasSearch(programs: TcasProgram[]) {
  // Search state management
  // Debounced query updates
  // Return: { query, setQuery, filters, setFilters, results }
}

export function useTcasProgramDetail(programId: string) {
  // Fetch rounds for specific program
  // Cache per-program to avoid re-fetching
  // Return: { program, rounds, loading, error }
}
```

Pattern: Follow `useFirestoreSync.ts` structure but adapted for HTTP + caching.

### Phase 3: UI Components (Priority: HIGH)

#### 3.1 Reusable TCAS Components
**Directory:** `src/components/tcas/`

**TcasListSkeleton.tsx** - Loading state with pulsing animation
**TcasEmptyState.tsx** - No results / error states
**TcasSearchBar.tsx** - Search input with icon
**TcasFilterChips.tsx** - University/Field filter chips (removable)
**UniversityLogo.tsx** - Logo with loading + fallback icon
**TcasRoundBadge.tsx** - Colored round indicator (1-4)
**TcasInfoRow.tsx** - Key-value pair display

#### 3.2 Page Components
**Directory:** `src/pages/tcas/`

**TCASSearchPage.tsx** (replaces current `TCASPage.tsx`)
- Search bar at top
- University list (when no query)
- Program results (when query exists)
- Filter chips for active filters
- Infinite scroll or pagination for 80+ results

**UniversityDetailPage.tsx**
- University header with logo
- List of faculties

**FacultyDetailPage.tsx**
- Faculty header
- List of fields/majors

**FieldDetailPage.tsx**
- Field header
- List of programs

**ProgramDetailPage.tsx**
- Program header with university logo + full hierarchy
- Tabs: "Info" + "รอบ 1" + "รอบ 2" + "รอบ 3" + "รอบ 4"
- Info tab: Cost, graduation rate, employment rate, median salary
- Round tabs: Project details with seats, GPAX, score conditions

### Phase 4: Routing (Priority: MEDIUM)

#### 4.1 Route Structure
**File:** `src/App.tsx` (update)

```typescript
// Top-level search
/tcas → TCASSearchPage

// Hierarchical navigation
/tcas/university/:universityId → UniversityDetailPage
/tcas/university/:universityId/faculty/:facultyId → FacultyDetailPage
/tcas/university/:universityId/faculty/:facultyId/field/:fieldId → FieldDetailPage

// Direct program access (for deep linking)
/tcas/program/:programId → ProgramDetailPage
```

Use React Router's nested routes + `<Outlet />` for smooth transitions.

### Phase 5: Styling & Motion (Priority: MEDIUM)

#### 5.1 Material 3 Expressive Patterns
- **Colors:** Round badges use Android color scheme:
  - Round 1: `#FFB600` (Orange/Gold)
  - Round 2: `#F26B55` (Red/Coral)  
  - Round 3: `#00A0A9` (Teal)
  - Round 4: `#00709A` (Blue)
- **Motion:** Framer Motion with `expressiveTransition` (stiffness: 260, damping: 26)
- **Layout:** Follow existing `TabbySection` + card patterns
- **Typography:** Match Android hierarchy (headline, title, body, label)

#### 5.2 Responsive Design
- Desktop: Side-by-side layout (logo + content)
- Mobile: Stacked layout with bottom navigation
- Logos: 48x48 on mobile, 64x64 on desktop

### Phase 6: Offline Support (Priority: LOW)

#### 6.1 Cache Strategy
- **Cache API** for JSON responses (universities, programs, rounds)
- **IndexedDB** for logos (binary blobs)
- Cache key: URL + timestamp
- TTL: 7 days for data, 30 days for logos
- Clear cache button in Settings page (future)

#### 6.2 Service Worker (Optional)
- Already have `vite-plugin-pwa` configured
- Add TCAS API URLs to runtime caching rules
- Network-first strategy with cache fallback

### Phase 7: Localization (Priority: LOW)

#### 7.1 Thai/English Toggle
- Store preference in localStorage
- Default: Thai primary, English secondary
- Toggle in Settings page (future)
- Display both in UI: Thai (bold) + English (muted)

## Implementation Order (Recommended)

1. **Day 1: Data Foundation**
   - Create types (`tcas.ts`)
   - Build API client (`tcasClient.ts`)
   - Build parser (`tcasParser.ts`)
   - Test data fetching in console

2. **Day 2: Search & State**
   - Implement search logic (`tcasSearch.ts`)
   - Build custom hooks (`useTcas.ts`)
   - Test search/filter in React DevTools

3. **Day 3: Core UI**
   - Build reusable components (logos, badges, skeletons)
   - Create search page (university list + program results)
   - Test with real data

4. **Day 4: Detail Pages**
   - Build hierarchical navigation pages
   - Build program detail page with rounds
   - Add routing

5. **Day 5: Polish**
   - Add animations
   - Optimize performance
   - Add error boundaries
   - Test offline mode

## Technical Decisions & Tradeoffs

### ✅ Use Cache API (not React Query)
**Why:** 
- Native browser caching works offline
- Simpler than adding new dependency
- Matches Android's file-based caching approach
- React Query would be overkill for 3 static endpoints

### ✅ Use fuse.js for search (already installed)
**Why:**
- Already in dependencies
- Fuzzy search better UX than exact match
- Handles Thai + English text well

### ✅ Separate pages for hierarchy (not modal overlays)
**Why:**
- Better for deep linking
- Browser back button works naturally
- Matches Android navigation pattern
- Easier to implement with React Router

### ✅ No user-specific data storage
**Why:**
- TCAS in Android is read-only public data
- No "save favorites" or "track applications" features yet
- If we add personalization later, use Firestore like assignments/timetable

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| S3 API changes format | Add schema validation, graceful fallback to cached data |
| Large JSON files (slow load) | Progressive loading: universities first, programs on-demand |
| Thai character rendering issues | Test on multiple browsers, use proper UTF-8 encoding |
| Logo loading delays | Preload logos after initial data fetch, use fallback icons |
| Memory issues with 1000+ programs | Virtual scrolling with `react-window` if needed (add later) |

## Success Criteria

- [ ] All universities load and display correctly
- [ ] Search returns relevant results in <500ms
- [ ] Filters work in combination (University + Field)
- [ ] Hierarchical navigation works smoothly
- [ ] Program details show all rounds with correct data
- [ ] Logos load and cache properly
- [ ] Offline mode works (cached data accessible)
- [ ] Mobile responsive (tested on 375px width)
- [ ] No TypeScript errors
- [ ] Matches Android UI/UX fidelity (80%+)

## Files to Create

```
src/
├── types/
│   └── tcas.ts                    # TypeScript types
├── lib/
│   └── tcas/
│       ├── tcasClient.ts          # API + caching
│       ├── tcasParser.ts          # JSON parsing
│       └── tcasSearch.ts          # Search/filter logic
├── hooks/
│   └── useTcas.ts                 # Data hooks
├── components/
│   └── tcas/
│       ├── TcasListSkeleton.tsx
│       ├── TcasEmptyState.tsx
│       ├── TcasSearchBar.tsx
│       ├── TcasFilterChips.tsx
│       ├── UniversityLogo.tsx
│       ├── TcasRoundBadge.tsx
│       └── TcasInfoRow.tsx
└── pages/
    └── tcas/
        ├── TCASSearchPage.tsx     # Main search page (replace TCASPage.tsx)
        ├── UniversityDetailPage.tsx
        ├── FacultyDetailPage.tsx
        ├── FieldDetailPage.tsx
        └── ProgramDetailPage.tsx
```

## Files to Modify

```
src/
├── App.tsx                        # Add new TCAS routes
└── pages/
    └── TCASPage.tsx               # REPLACE with new implementation
```

## Estimated Effort

- **Total:** ~16-20 hours
- **Phase 1 (Data):** 4-5 hours
- **Phase 2 (State):** 2-3 hours
- **Phase 3 (UI):** 6-8 hours
- **Phase 4 (Routes):** 2 hours
- **Phase 5 (Polish):** 2-3 hours

## Open Questions

1. **Should we add user-specific features?**
   - Save favorite programs?
   - Track application status?
   - Notes per program?
   - **Decision:** No for MVP. Focus on read-only browser first.

2. **Should we cache logos in IndexedDB or just rely on browser HTTP cache?**
   - **Decision:** Start with HTTP cache, add IndexedDB later if needed.

3. **Should we show all rounds or only active rounds (based on current date)?**
   - **Decision:** Show all rounds like Android app. Date-based filtering is future enhancement.

4. **Should we support English-first display mode?**
   - **Decision:** No for MVP. Thai primary is standard for Thai users.

## Next Steps After Approval

1. Create TypeScript types file
2. Implement API client with basic fetch
3. Test data retrieval in browser console
4. Build search hook
5. Create simple search page with results
6. Iterate from there based on user feedback

---

**Plan Status:** Ready for approval
**Last Updated:** 2026-06-05
