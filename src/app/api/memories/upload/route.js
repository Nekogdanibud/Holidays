// src/app/api/memories/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });

    const formData = await request.formData();
    const vacationId = formData.get('vacationId');
    const activityId = formData.get('activityId') || null;
    const captureType = formData.get('captureType'); // 'DAILY_MOMENT' или 'ACTIVITY_MOMENT'
    const photos = formData.getAll('photos');

    if (!vacationId || photos.length === 0) {
      return NextResponse.json({ message: 'Отпуск и фото обязательны' }, { status: 400 });
    }

    // Проверка доступа к отпуску
    const vacation = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
        ]
      }
    });

    if (!vacation) return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });

    // === ЛОГИКА ЛИМИТОВ ДЛЯ CAPTURE-ФОТО ===
    if (captureType) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let allowedCount = 0;

      if (captureType === 'ACTIVITY_MOMENT' && activityId) {
        // Проверяем, что активность сегодняшняя
        const activity = await prisma.activity.findFirst({
          where: {
            id: activityId,
            date: { gte: today, lt: tomorrow }
          }
        });

        if (!activity) {
          return NextResponse.json(
            { message: 'Яркий момент можно привязать только к сегодняшней активности' },
            { status: 400 }
          );
        }

        // Лимит: 3 фото на активность в день
        const activityMemoriesCount = await prisma.memory.count({
          where: {
            vacationId,
            authorId: decoded.userId,
            activityId,
            captureType: 'ACTIVITY_MOMENT',
            takenAt: { gte: today, lt: tomorrow }
          }
        });

        allowedCount = Math.max(0, 3 - activityMemoriesCount);
      } else if (captureType === 'DAILY_MOMENT') {
        // Лимит: 3 фото в день без привязки к активности
        const dailyMemoriesCount = await prisma.memory.count({
          where: {
            vacationId,
            authorId: decoded.userId,
            captureType: 'DAILY_MOMENT',
            activityId: null,
            takenAt: { gte: today, lt: tomorrow }
          }
        });

        allowedCount = Math.max(0, 3 - dailyMemoriesCount);
      }

      if (photos.length > allowedCount) {
        return NextResponse.json(
          { message: `Лимит превышен. Доступно: ${allowedCount} ярких фото` },
          { status: 400 }
        );
      }
    }

    // === ЗАГРУЗКА ФАЙЛОВ ===
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'memories');
    await mkdir(uploadDir, { recursive: true });

    const createdMemories = [];

    for (const photo of photos) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${randomStr}.${ext}`;
      const filepath = join(uploadDir, filename);
      
      // ВАЖНО: Сохраняем с правильным путем для доступа из браузера
      const publicUrl = `/uploads/memories/${filename}`;

      console.log('💾 Сохранение файла:', {
        filename,
        filepath,
        publicUrl,
        size: buffer.length
      });

      await writeFile(filepath, buffer);

      const memory = await prisma.memory.create({
        data: {
          title: captureType ? 'Яркий момент' : 'Фото из отпуска',
          description: '',
          imageUrl: publicUrl,
          takenAt: new Date(),
          vacationId,
          authorId: decoded.userId,
          activityId: captureType === 'ACTIVITY_MOMENT' ? activityId : (activityId || null),
          captureType: captureType || null,
          tags: captureType ? ['capture'] : [],
          isFavorite: false
          // Убираем isCapture - его нет в схеме
        },
        include: {
          author: { select: { id: true, name: true, avatar: true, usertag: true } },
          activity: { select: { id: true, title: true } }
        }
      });

      console.log('✅ Создана запись памяти:', memory.id, memory.imageUrl);
      createdMemories.push(memory);
    }

    return NextResponse.json({
      message: 'Фото загружены',
      memories: createdMemories
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Ошибка загрузки фото:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
