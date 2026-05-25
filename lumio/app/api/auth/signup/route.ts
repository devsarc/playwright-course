import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { json, apiError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password } = body;

  if (!email || !password || !name) {
    return apiError('name, email, and password are required', 400);
  }

  if (password.length < 8) {
    return apiError('Password must be at least 8 characters', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return apiError('An account with this email already exists', 409);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true },
  });

  return json({ user }, 201);
}
