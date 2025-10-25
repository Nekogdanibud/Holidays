// src/app/api/friends/list/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

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

    // Получаем друзей пользователя
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: decoded.userId },
          { user2Id: decoded.userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            usertag: true,
            avatar: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            usertag: true,
            avatar: true
          }
        }
      }
    });

    // Форматируем список друзей
    const friends = friendships.map(friendship => 
      friendship.user1Id === decoded.userId ? friendship.user2 : friendship.user1
    );

    return NextResponse.json({ friends });

  } catch (error) {
    console.error('Ошибка получения списка друзей:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
