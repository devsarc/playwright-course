import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';
import { requireAuth, apiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  await requireAuth();
  const projectId = req.nextUrl.searchParams.get('projectId');
  if (!projectId) return apiError('projectId is required', 400);

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto(`${baseUrl}/projects/${projectId}?print=1`, {
    waitUntil: 'networkidle0',
  });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });

  await browser.close();

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="project-${projectId}.pdf"`,
    },
  });
}
