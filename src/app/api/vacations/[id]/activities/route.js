// src/app/api/vacations/[id]/activities/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем доступ к отпуску
    const vacationAccess = await prisma.vacation.findFirst({
      where: {
        id: id,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'accepted' } } }
        ]
      }
    });

    if (!vacationAccess) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    // ИСПРАВЛЕНО: правильные поля для модели Activity
    const activities = await prisma.activity.findMany({
      where: { vacationId: id },
      orderBy: { date: 'asc' },
      include: {
        location: {
          select: { id: true, name: true, address: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    // Преобразуем данные для удобства использования
    const formattedActivities = activities.map(activity => ({
      ...activity,
      // Берем первого участника как "автора" активности
      author: activity.participants[0]?.user || null,
      participants: activity.participants.map(p => p.user)
    }));

    return NextResponse.json(formattedActivities);

  } catch (error) {
    console.error('Ошибка получения активностей:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
