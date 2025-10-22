// src/app/api/profile/delete-temp/route.js
import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { verifyAccessToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { imagePath } = await request.json();
    if (!imagePath || !imagePath.startsWith('/uploads/temp/')) {
      return NextResponse.json({ message: 'Недопустимый путь изображения' }, { status: 400 });
    }

    const filepath = join(process.cwd(), 'public', imagePath);
    try {
      await unlink(filepath);
      console.log(`Deleted temp file: ${filepath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`Error deleting temp file ${filepath}:`, error);
      }
    }

    return NextResponse.json({ message: 'Временное изображение удалено' });

  } catch (error) {
    console.error('Ошибка удаления временного изображения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
