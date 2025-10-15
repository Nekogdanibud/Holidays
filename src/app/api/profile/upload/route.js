// src/app/api/profile/upload/route.js
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

    // Проверяем тип файла
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Файл должен быть изображением' },
        { status: 400 }
      );
    }

    // Проверяем размер файла (макс 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Размер файла не должен превышать 5MB' },
        { status: 400 }
      );
    }

    // Создаем директории если их нет
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const avatarsDir = join(uploadsDir, 'avatars');
    const bannersDir = join(uploadsDir, 'banners');
    
    await mkdir(avatarsDir, { recursive: true });
    await mkdir(bannersDir, { recursive: true });

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const fileExtension = image.name.split('.').pop();
    const filename = `${timestamp}.${fileExtension}`;
    
    const uploadDir = type === 'avatar' ? avatarsDir : bannersDir;
    const filepath = join(uploadDir, filename);
    const publicUrl = `/uploads/${type === 'avatar' ? 'avatars' : 'banners'}/${filename}`;

    // Сохраняем файл
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Обновляем профиль пользователя
    const updateData = type === 'avatar' 
      ? { avatar: publicUrl }
      : { banner: publicUrl };

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        banner: true,
        bio: true,
        location: true,
        website: true,
        profileVisibility: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Изображение успешно загружено',
      user: updatedUser
    });

  } catch (error) {
    console.error('Ошибка загрузки изображения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
