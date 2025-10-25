// app/api/memories/[id]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(request, { params }) {
  try {
    const { id: memoryId } = await params;
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Находим воспоминание
    const memory = await prisma.memory.findFirst({
      where: {
        id: memoryId,
        authorId: decoded.userId // Только автор может удалить
      }
    });

    if (!memory) {
      return NextResponse.json({ message: 'Воспоминание не найдено или нет прав' }, { status: 404 });
    }

    // Удаляем файл с диска
    try {
      const filepath = join(process.cwd(), 'public', memory.imageUrl);
      await unlink(filepath);
    } catch (error) {
      console.warn('Не удалось удалить файл:', error);
      // Продолжаем удаление записи из БД даже если файл не найден
    }

    // Удаляем запись из базы данных
    await prisma.memory.delete({
      where: { id: memoryId }
    });

    return NextResponse.json({ message: 'Воспоминание удалено' });

  } catch (error) {
    console.error('Ошибка удаления воспоминания:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
