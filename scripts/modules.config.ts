export interface ModuleConfig {
  /** Zero-padded number: '00', '01', … '19' */
  number: string;
  /** Kebab-case slug used in branch names and directory names */
  slug: string;
  /** Human-readable title shown in success comments */
  title: string;
  /**
   * Git tag on main that marks the Lumio snapshot for this lesson.
   * The generation script checks out this tag before creating the branch,
   * so Lumio is at the right state of growth.
   * Null means "use the full Lumio from main" (Lumio is fully built by
   * Lesson 08 onward).
   */
  lumioSnapshot: string | null;
  /**
   * Whether this lesson has an exercise.spec.ts (or .tsx).
   * All 20 lessons have at least one exercise file — the two former
   * awareness-only modules (M01, M73) are folded in as non-exercise Parts
   * inside Lesson 00 and Lesson 15, which both also contain exercised Parts.
   */
  hasExercise: boolean;
}

export const MODULES: ModuleConfig[] = [
  { number: '00', slug: 'foundations', title: 'Foundations: Environment, Locators, Actions & Navigation', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },
  { number: '01', slug: 'test-runner-organization', title: 'Test Runner & Organization', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '02', slug: 'network-and-apis', title: 'Network & API Testing', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },
  { number: '03', slug: 'auth-and-sessions', title: 'Authentication & Session Management', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },
  { number: '04', slug: 'forms-and-interactions', title: 'Forms, Dialogs & Advanced Interactions', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '05', slug: 'visual-a11y-performance', title: 'Visual, Accessibility & Performance Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '06', slug: 'realtime-and-user-flows', title: 'Multi-Tab, Real-Time & Complex User Flows', lumioSnapshot: 'lumio-snapshot-m31', hasExercise: true },
  { number: '07', slug: 'cross-browser-and-mobile', title: 'Cross-Browser & Mobile Testing', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },
  { number: '08', slug: 'scale-and-cicd', title: 'Scale, Parallelism & CI/CD', lumioSnapshot: null, hasExercise: true },
  { number: '09', slug: 'debugging-and-reporting', title: 'Debugging, Tracing & Reporting', lumioSnapshot: null, hasExercise: true },
  { number: '10', slug: 'architecture-and-patterns', title: 'Test Architecture & Design Patterns', lumioSnapshot: null, hasExercise: true },
  { number: '11', slug: 'component-testing', title: 'Component Testing: React & Vue', lumioSnapshot: null, hasExercise: true },
  { number: '12', slug: 'specialized-automation', title: 'Specialized Automation: Scraping, Crawling & Bots', lumioSnapshot: null, hasExercise: true },
  { number: '13', slug: 'realtime-protocols-and-cdp', title: 'WebSocket, SSE & CDP Deep Dive', lumioSnapshot: null, hasExercise: true },
  { number: '14', slug: 'specialized-testing-types', title: 'Specialized Testing Types: i18n, Flags, Security, Chat & CMS', lumioSnapshot: null, hasExercise: true },
  { number: '15', slug: 'platform-specific-testing', title: 'Platform-Specific Testing: Extensions, Electron & Android', lumioSnapshot: null, hasExercise: true },
  { number: '16', slug: 'monitoring-and-synthetic', title: 'Synthetic Monitoring & Scheduled Bots', lumioSnapshot: null, hasExercise: true },
  { number: '17', slug: 'ai-and-modern-tooling', title: 'AI-Assisted Testing & MCP Integration', lumioSnapshot: null, hasExercise: true },
  { number: '18', slug: 'decision-making-and-patterns', title: 'Decision-Making & Real-World Patterns', lumioSnapshot: null, hasExercise: true },
  { number: '19', slug: 'capstone', title: 'Capstone: Full Suite Organization & Review', lumioSnapshot: null, hasExercise: true },
];
