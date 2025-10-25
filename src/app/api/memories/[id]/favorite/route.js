// app/api/memories/[id]/favorite/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const { id: memoryId } = await params;
    const { isFavorite } = await request.json();
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь является автором воспоминания
    const memory = await prisma.memory.findFirst({
      where: {
        id: memoryId,
        authorId: decoded.userId
      }
    });

    if (!memory) {
      return NextResponse.json({ message: 'Воспоминание не найдено или нет прав' }, { status: 404 });
    }

    // Обновляем статус избранного
    const updatedMemory = await prisma.memory.update({
      where: { id: memoryId },
      data: { isFavorite },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json({ 
      message: isFavorite ? 'Добавлено в избранное' : 'Убрано из избранного',
      memory: updatedMemory
    });

  } catch (error) {
    console.error('Ошибка обновления избранного:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
