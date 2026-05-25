import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import type { DecisionType } from '../types';

export interface ManifestEntry {
  sha: string;
  date: string;
  result: 'pass' | 'fail' | 'regression' | 'cancelled';
  modulesRun: string[];
  reportPath: string;
}

export function loadManifest(manifestPath: string): ManifestEntry[] {
  if (!existsSync(manifestPath)) return [];
  return JSON.parse(readFileSync(manifestPath, 'utf-8')) as ManifestEntry[];
}

export function appendManifest(manifestPath: string, entry: ManifestEntry): void {
  const entries = loadManifest(manifestPath);
  entries.unshift(entry);
  writeFileSync(manifestPath, JSON.stringify(entries, null, 2) + '\n', 'utf-8');
}

export function buildManifestEntry(
  commitSha: string,
  decision: DecisionType,
  moduleResults: Map<string, boolean>
): ManifestEntry {
  const resultMap: Record<DecisionType['type'], ManifestEntry['result']> = {
    unlock: 'pass',
    complete: 'pass',
    fail: 'fail',
    regression: 'regression',
    'complete-regression-fail': 'regression',
    cancelled: 'cancelled',
  };
  return {
    sha: commitSha,
    date: new Date().toISOString(),
    result: resultMap[decision.type],
    modulesRun: [...moduleResults.keys()],
    reportPath: `reports/${commitSha}/index.html`,
  };
}

export function generateIndexHtml(entries: ManifestEntry[], baseUrl: string): string {
  const rows = entries.map(e => {
    const icon = e.result === 'pass' ? '✅' : e.result === 'cancelled' ? '⏹️' : '❌';
    const date = new Date(e.date).toLocaleString();
    return `
    <tr>
      <td><code>${e.sha.slice(0, 7)}</code></td>
      <td>${date}</td>
      <td>${icon} ${e.result}</td>
      <td>${e.modulesRun.join(', ')}</td>
      <td><a href="${baseUrl}/${e.reportPath}">View report</a></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Playwright Progress Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f5f5f5; }
    tr:nth-child(even) { background: #fafafa; }
    code { background: #eee; padding: 0.1em 0.3em; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Playwright Learning Progress</h1>
  <table>
    <thead><tr><th>Commit</th><th>Date</th><th>Result</th><th>Modules</th><th>Report</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
