// src/app/api/profile/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

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
    const image = formData.get('image');
    const type = formData.get('type'); // 'avatar' или 'banner'

    if (!image || !type) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные данные' },
        { status: 400 }
      );
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      );
    }

    // Создаем директорию для временных файлов
    const tempDir = join(process.cwd(), 'public', 'uploads', 'temp');
    await mkdir(tempDir, { recursive: true });

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileExtension = image.name.split('.').pop();
    const filename = `${decoded.userId}-${type}-${timestamp}.${fileExtension}`;
    const filepath = join(tempDir, filename);
    const tempPath = `/uploads/temp/${filename}`;

    // Сохраняем файл
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Планируем удаление файла через 5 минут
    setTimeout(async () => {
      try {
        await unlink(filepath);
        console.log(`Deleted temp file: ${filepath}`);
      } catch (error) {
        console.error(`Error deleting temp file ${filepath}:`, error);
      }
    }, 5 * 60 * 1000); // 5 минут

    // Возвращаем временный путь
    return NextResponse.json({
      message: 'Изображение временно загружено',
      tempPath
    });

  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
