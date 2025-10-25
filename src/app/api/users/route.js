// src/app/api/users/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Базовые условия для поиска
    const where = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { usertag: { contains: search, mode: 'insensitive' } }
      ],
      // Исключаем текущего пользователя
      NOT: {
        id: decoded.userId
      }
    };

    console.log('🔍 Поиск пользователей с условиями:', { search, page, limit });

    // Получаем пользователей - ТОЛЬКО ОСНОВНЫЕ ДАННЫЕ
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        usertag: true,
        avatar: true,
        bio: true,
        location: true,
        createdAt: true,
        profileVisibility: true,
        // УБРАЛ сложные подсчеты - они не нужны для общего списка
        _count: {
          select: {
            posts: true,
            // Только базовые счетчики
            friendsAsUser1: true,
            friendsAsUser2: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    console.log('✅ Найдено пользователей:', users.length);

    // Форматируем данные для фронтенда
    const formattedUsers = users.map(user => ({
      ...user,
      // УБРАЛ vacationCount - он не нужен в общем списке
      postCount: user._count.posts,
      friendCount: user._count.friendsAsUser1 + user._count.friendsAsUser2
    }));

    // Получаем общее количество для пагинации
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения пользователей:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
