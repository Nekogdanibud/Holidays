// src/app/api/memories/capture/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

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

    const formData = await request.formData();
    const vacationId = formData.get('vacationId');
    const photos = formData.getAll('photos');

    if (!vacationId || photos.length === 0) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные данные' },
        { status: 400 }
      );
    }

    // Проверяем доступ к отпуску
    const vacationAccess = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'accepted' } } }
        ]
      }
    });

    if (!vacationAccess) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    // Проверяем лимит фотографий на день (3 фото)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMemories = await prisma.memory.count({
      where: {
        vacationId,
        authorId: decoded.userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todayMemories + photos.length > 3) {
      return NextResponse.json(
        { message: 'Превышен лимит в 3 фотографии в день' },
        { status: 400 }
      );
    }

    const createdMemories = [];

    // Создаем директорию для загрузок если её нет
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'memories');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Директория уже существует
    }

    for (const photo of photos) {
      const bytes = await photo.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const filename = `${timestamp}-${photo.name}`;
      const filepath = join(uploadDir, filename);

      // Сохраняем файл
      await writeFile(filepath, buffer);

      // Создаем запись в базе
      const memory = await prisma.memory.create({
        data: {
          title: `Фото дня - ${new Date().toLocaleDateString('ru-RU')}`,
          description: 'Запечатленный момент',
          imageUrl: `/uploads/memories/${filename}`,
          takenAt: new Date(),
          vacationId,
          authorId: decoded.userId,
          tags: ['captured_moment']
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true }
          }
        }
      });

      createdMemories.push(memory);
    }

    return NextResponse.json({ 
      message: 'Фотографии успешно сохранены',
      memories: createdMemories 
    }, { status: 201 });

  } catch (error) {
    console.error('Ошибка сохранения фотографий:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
