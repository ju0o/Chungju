import { NextResponse } from 'next/server';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);
    const booksDir = path.join(process.cwd(), 'public', 'books');
    const files = await readdir(booksDir, { withFileTypes: true });
    const covers = files
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => /\.(jpg|jpeg|png|webp|svg)$/i.test(name))
      .map((name) => `/books/${name}`)
      .sort((a, b) => a.localeCompare(b, 'ko'));

    return NextResponse.json({ success: true, data: covers });
  } catch (error) {
    const message = error instanceof Error ? error.message : '표지 목록 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
