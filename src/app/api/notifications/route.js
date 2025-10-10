// src/app/api/notifications/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// Получить уведомления пользователя
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

    const notifications = await prisma.notification.findMany({
      where: { 
        userId: decoded.userId 
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            avatar: true 
          }
        }
      },
      take: 50
    });

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Пометить уведомления как прочитанные
export async function PUT(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { notificationIds } = await request.json();

    if (notificationIds && notificationIds.length > 0) {
      // Пометить конкретные уведомления как прочитанные
      await prisma.notification.updateMany({
        where: { 
          id: { in: notificationIds },
          userId: decoded.userId 
        },
        data: { isRead: true }
      });
    } else {
      // Пометить все как прочитанные
      await prisma.notification.updateMany({
        where: { 
          userId: decoded.userId,
          isRead: false 
        },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ message: 'Уведомления помечены как прочитанные' });

  } catch (error) {
    console.error('Ошибка обновления уведомлений:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
