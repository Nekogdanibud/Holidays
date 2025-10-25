// src/app/api/activities/[id]/participate/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: activityId } = await params;
    const { status } = await request.json(); // 'GOING', 'MAYBE', 'NOT_GOING'
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем доступ к активности
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        vacation: {
          OR: [
            { userId: decoded.userId },
            { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
          ]
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ message: 'Активность не найдена' }, { status: 404 });
    }

    // Обновляем или создаем участие
    const participation = await prisma.activityParticipant.upsert({
      where: {
        activityId_userId: {
          activityId,
          userId: decoded.userId
        }
      },
      update: {
        status
      },
      create: {
        activityId,
        userId: decoded.userId,
        status
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(participation);

  } catch (error) {
    console.error('Ошибка участия в активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
