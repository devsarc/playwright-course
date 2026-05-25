export interface ModuleConfig {
  /** Zero-padded number: '00', '01', … '92' */
  number: string;
  /** Kebab-case slug used in branch names and directory names */
  slug: string;
  /** Human-readable title shown in success comments */
  title: string;
  /**
   * Git tag on main that marks the Lumio snapshot for this module.
   * The generation script checks out this tag before creating the branch,
   * so Lumio is at the right state of growth.
   * Null means "use the full Lumio from main" (awareness modules, late phases).
   */
  lumioSnapshot: string | null;
  /**
   * Whether this module has an exercise.spec.ts.
   * Awareness modules (M01, M73) have no exercise — only README.
   */
  hasExercise: boolean;
}

export const MODULES: ModuleConfig[] = [
  // ─── Phase 0: Environment & How Playwright Works ──────────────────────────
  { number: '00', slug: 'setup', title: 'Setup & Project Structure', lumioSnapshot: 'lumio-snapshot-m00', hasExercise: true },
  { number: '01', slug: 'how-playwright-works', title: 'How Playwright Works Internally', lumioSnapshot: 'lumio-snapshot-m00', hasExercise: false },

  // ─── Phase 1: Locators & Actions ──────────────────────────────────────────
  { number: '02', slug: 'locators', title: 'Locators — Finding Elements', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },
  { number: '03', slug: 'actions', title: 'Actions — Interacting with Elements', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },
  { number: '04', slug: 'assertions', title: 'Assertions — Verifying State', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },
  { number: '05', slug: 'navigation', title: 'Navigation & Page State', lumioSnapshot: 'lumio-snapshot-m02', hasExercise: true },

  // ─── Phase 2: Test Runner & Organization ─────────────────────────────────
  { number: '06', slug: 'test-runner', title: 'Test Runner Fundamentals', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '07', slug: 'configuration', title: 'Configuration Deep Dive', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '08', slug: 'fixtures', title: 'Fixtures & Dependency Injection', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '09', slug: 'global-setup', title: 'Global Setup & Teardown', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '10', slug: 'watch-mode', title: 'Watch Mode & Developer Workflow', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },
  { number: '11', slug: 'retries', title: 'Retries & Flakiness Management', lumioSnapshot: 'lumio-snapshot-m06', hasExercise: true },

  // ─── Phase 3: Network & APIs ──────────────────────────────────────────────
  { number: '12', slug: 'network-mocking', title: 'Network Interception & Mocking', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },
  { number: '13', slug: 'advanced-network', title: 'Advanced Network Patterns', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },
  { number: '14', slug: 'api-testing', title: 'API Testing with request Fixture', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },
  { number: '15', slug: 'har-recording', title: 'HAR Recording & Network Analysis', lumioSnapshot: 'lumio-snapshot-m12', hasExercise: true },

  // ─── Phase 4: Authentication & Sessions ──────────────────────────────────
  { number: '16', slug: 'auth-patterns', title: 'Authentication Patterns', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },
  { number: '17', slug: 'oauth', title: 'OAuth & SSO Flows', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },
  { number: '18', slug: 'session-management', title: 'Cookie, Storage & Session Management', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },
  { number: '19', slug: 'security-workflows', title: 'Security Workflow Testing', lumioSnapshot: 'lumio-snapshot-m16', hasExercise: true },

  // ─── Phase 5: Forms & Interactions ────────────────────────────────────────
  { number: '20', slug: 'form-automation', title: 'Form Automation & Validation', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '21', slug: 'dialogs', title: 'Dialog & Alert Handling', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '22', slug: 'file-upload-download-pdf', title: 'File Upload, Download & PDF', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '23', slug: 'advanced-input-interactions', title: 'Advanced Input & Interactions', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },
  { number: '24', slug: 'iframe-shadow-dom', title: 'iFrame & Shadow DOM', lumioSnapshot: 'lumio-snapshot-m20', hasExercise: true },

  // ─── Phase 6: Visual Testing ──────────────────────────────────────────────
  { number: '25', slug: 'screenshot-testing', title: 'Screenshot Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '26', slug: 'visual-regression-testing', title: 'Visual Regression Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '27', slug: 'aria-snapshots', title: 'ARIA Snapshot Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },

  // ─── Phase 7: Accessibility & Performance ────────────────────────────────
  { number: '28', slug: 'accessibility-testing', title: 'Accessibility Testing', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '29', slug: 'performance-testing-measurement', title: 'Performance Testing & Measurement', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },
  { number: '30', slug: 'har-devtools', title: 'HAR & DevTools Deep Analysis', lumioSnapshot: 'lumio-snapshot-m25', hasExercise: true },

  // ─── Phase 8: Multi-Tab, Real-Time & Complex Flows ────────────────────────
  { number: '31', slug: 'multi-tab-popup-management', title: 'Multi-Tab & Popup Management', lumioSnapshot: 'lumio-snapshot-m31', hasExercise: true },
  { number: '32', slug: 'websocket-sse-testing', title: 'WebSocket & SSE Testing', lumioSnapshot: 'lumio-snapshot-m31', hasExercise: true },
  { number: '33', slug: 'user-journeys', title: 'User Journey Simulation', lumioSnapshot: 'lumio-snapshot-m31', hasExercise: true },

  // ─── Phase 9: Cross-Browser & Mobile ─────────────────────────────────────
  { number: '34', slug: 'cross-browser', title: 'Cross-Browser Testing Strategy', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },
  { number: '35', slug: 'mobile-emulation', title: 'Mobile Emulation & Responsive Testing', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },
  { number: '36', slug: 'geolocation-permissions', title: 'Geolocation, Permissions & Device APIs', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },
  { number: '37', slug: 'offline-pwa-service-workers', title: 'Offline, PWA & Service Workers', lumioSnapshot: 'lumio-snapshot-m34', hasExercise: true },

  // ─── Phase 10: Scale & CI/CD ──────────────────────────────────────────────
  { number: '38', slug: 'parallel-execution', title: 'Parallel Execution & Test Isolation', lumioSnapshot: null, hasExercise: true },
  { number: '39', slug: 'sharding-large-suites', title: 'Sharding for Large Suites', lumioSnapshot: null, hasExercise: true },
  { number: '40', slug: 'ci-cd', title: 'CI/CD Pipeline Setup', lumioSnapshot: null, hasExercise: true },
  { number: '41', slug: 'webserver-config', title: 'WebServer Config & Test Environment', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 11: Debugging & Reporting ─────────────────────────────────────
  { number: '42', slug: 'inspector-codegen', title: 'Playwright Inspector & Codegen', lumioSnapshot: null, hasExercise: true },
  { number: '43', slug: 'tracing-trace-viewer', title: 'Tracing & Trace Viewer', lumioSnapshot: null, hasExercise: true },
  { number: '44', slug: 'reporters-deep-dive', title: 'Reporters Deep Dive', lumioSnapshot: null, hasExercise: true },
  { number: '45', slug: 'debugging-strategies', title: 'Debugging Strategies', lumioSnapshot: null, hasExercise: true },
  { number: '46', slug: 'test-step-attachments', title: 'test.step() & Runtime Attachments', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 12: Architecture & Patterns ────────────────────────────────────
  { number: '47', slug: 'page-object-model', title: 'Page Object Model', lumioSnapshot: null, hasExercise: true },
  { number: '48', slug: 'advanced-fixture-patterns', title: 'Advanced Fixture Patterns', lumioSnapshot: null, hasExercise: true },
  { number: '49', slug: 'data-driven-testing', title: 'Data-Driven Testing', lumioSnapshot: null, hasExercise: true },
  { number: '50', slug: 'test-organization', title: 'Test Organization & Suite Architecture', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 13: Component Testing ──────────────────────────────────────────
  { number: '51', slug: 'component-testing-foundations', title: 'Component Testing Foundations', lumioSnapshot: null, hasExercise: true },
  { number: '52', slug: 'react-component-testing', title: 'React Component Testing', lumioSnapshot: null, hasExercise: true },
  { number: '53', slug: 'vue-component-testing', title: 'Vue Component Testing', lumioSnapshot: null, hasExercise: true },
  { number: '54', slug: 'network-mocking-component-tests', title: 'Network Mocking in Component Tests', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 14: Specialized Automation ────────────────────────────────────
  { number: '55', slug: 'web-scraping-fundamentals', title: 'Web Scraping Fundamentals', lumioSnapshot: null, hasExercise: true },
  { number: '56', slug: 'advanced-scraping-data-extraction', title: 'Advanced Scraping & Data Extraction', lumioSnapshot: null, hasExercise: true },
  { number: '57', slug: 'web-crawling-link-monitoring', title: 'Web Crawling & Link Monitoring', lumioSnapshot: null, hasExercise: true },
  { number: '58', slug: 'automated-form-filling-bots', title: 'Automated Form Filling & Bots', lumioSnapshot: null, hasExercise: true },
  { number: '59', slug: 'screenshot-demo-generation', title: 'Screenshot & Demo Generation', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 15: Real-Time & Advanced Protocols ────────────────────────────
  { number: '60', slug: 'websocket-deep-dive', title: 'WebSocket Deep Dive', lumioSnapshot: null, hasExercise: true },
  { number: '61', slug: 'sse-streaming', title: 'SSE & Streaming', lumioSnapshot: null, hasExercise: true },
  { number: '62', slug: 'cdp-direct-access', title: 'CDP Direct Access', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 16: Specialized Testing Types ─────────────────────────────────
  { number: '63', slug: 'localization-i18n-testing', title: 'Localization & i18n Testing', lumioSnapshot: null, hasExercise: true },
  { number: '64', slug: 'feature-flag-ab-testing', title: 'Feature Flag & A/B Testing', lumioSnapshot: null, hasExercise: true },
  { number: '65', slug: 'security-workflow-testing', title: 'Security Workflow Testing (Deep)', lumioSnapshot: null, hasExercise: true },
  { number: '66', slug: 'oauth-sso-deep-dive', title: 'OAuth & SSO Deep Dive', lumioSnapshot: null, hasExercise: true },
  { number: '67', slug: 'chatbot-rich-ui-interaction', title: 'Chatbot & Rich UI Interaction', lumioSnapshot: null, hasExercise: true },
  { number: '68', slug: 'cms-admin-panel-automation', title: 'CMS & Admin Panel Automation', lumioSnapshot: null, hasExercise: true },
  { number: '69', slug: 'seo-meta-verification', title: 'SEO & Meta Verification', lumioSnapshot: null, hasExercise: true },
  { number: '70', slug: 'broken-link-navigation-monitoring', title: 'Broken Link & Navigation Monitoring', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 17: Platform-Specific Testing ─────────────────────────────────
  { number: '71', slug: 'browser-extension-testing', title: 'Browser Extension Testing', lumioSnapshot: null, hasExercise: true },
  { number: '72', slug: 'electron-app-testing', title: 'Electron App Testing', lumioSnapshot: null, hasExercise: true },
  { number: '73', slug: 'android-device-automation', title: 'Android Device Automation (Awareness)', lumioSnapshot: null, hasExercise: false },

  // ─── Phase 18: Monitoring & Synthetic ────────────────────────────────────
  { number: '74', slug: 'synthetic-monitoring-fundamentals', title: 'Synthetic Monitoring Fundamentals', lumioSnapshot: null, hasExercise: true },
  { number: '75', slug: 'scheduled-bots-cron-tasks', title: 'Scheduled Bots & Cron Tasks', lumioSnapshot: null, hasExercise: true },
  { number: '76', slug: 'uptime-performance-monitoring', title: 'Uptime & Performance Monitoring', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 19: AI & Modern Tooling ───────────────────────────────────────
  { number: '77', slug: 'ai-test-planning', title: 'AI Test Planning (playwright-test-planner)', lumioSnapshot: null, hasExercise: true },
  { number: '78', slug: 'ai-test-code-generation', title: 'AI Test Code Generation (playwright-test-generator)', lumioSnapshot: null, hasExercise: true },
  { number: '79', slug: 'ai-test-healing', title: 'AI Test Healing (playwright-test-healer)', lumioSnapshot: null, hasExercise: true },
  { number: '80', slug: 'mcp-server-agent-integration', title: 'MCP Server & Agent Integration', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 20: Decision-Making & Real-World Patterns ─────────────────────
  { number: '81', slug: 'playwright-vs-selenium', title: 'Playwright vs Selenium', lumioSnapshot: null, hasExercise: true },
  { number: '82', slug: 'playwright-vs-cypress', title: 'Playwright vs Cypress', lumioSnapshot: null, hasExercise: true },
  { number: '83', slug: 'playwright-vs-puppeteer-others', title: 'Playwright vs Puppeteer & Others', lumioSnapshot: null, hasExercise: true },
  { number: '84', slug: 'flakiness-root-cause-analysis', title: 'Flakiness Root Cause Analysis', lumioSnapshot: null, hasExercise: true },
  { number: '85', slug: 'test-maintenance-long-term-strategy', title: 'Test Maintenance & Long-term Strategy', lumioSnapshot: null, hasExercise: true },
  { number: '86', slug: 'cicd-pipeline-optimization', title: 'CI/CD Pipeline Optimization', lumioSnapshot: null, hasExercise: true },
  { number: '87', slug: 'secrets-security-in-tests', title: 'Secrets & Security in Tests', lumioSnapshot: null, hasExercise: true },
  { number: '88', slug: 'test-health-observability', title: 'Test Health Observability', lumioSnapshot: null, hasExercise: true },

  // ─── Phase 21: Bringing It All Together ──────────────────────────────────
  { number: '89', slug: 'smoke-suite-for-lumio', title: 'Smoke Suite for Lumio', lumioSnapshot: null, hasExercise: true },
  { number: '90', slug: 'full-regression-suite-organization', title: 'Full Regression Suite Organization', lumioSnapshot: null, hasExercise: true },
  { number: '91', slug: 'production-incident-reproduction', title: 'Production Incident Reproduction', lumioSnapshot: null, hasExercise: true },
  { number: '92', slug: 'end-to-end-review-capstone', title: 'End-to-End Review & Capstone', lumioSnapshot: null, hasExercise: true },
];
