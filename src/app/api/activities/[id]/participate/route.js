// src/app/api/activities/[id]/participate/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: activityId } = await params;
    const { going } = await request.json(); // true = иду, false = не иду
    
    console.log('🎯 Участие в активности:', { activityId, going });
    
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
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ message: 'Активность не найдена' }, { status: 404 });
    }

    const status = going ? 'GOING' : 'NOT_GOING';

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
        },
        activity: {
          include: {
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          }
        }
      }
    });

    // Получаем обновленное количество участников
    const goingParticipantsCount = await prisma.activityParticipant.count({
      where: {
        activityId,
        status: 'GOING'
      }
    });

    console.log('✅ Статус участия обновлен:', { 
      userId: decoded.userId, 
      status, 
      goingParticipantsCount 
    });

    return NextResponse.json({
      participation,
      goingParticipantsCount,
      message: going ? 'Вы идете на активность!' : 'Вы отказались от участия'
    });

  } catch (error) {
    console.error('❌ Ошибка участия в активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Получить статус участия текущего пользователя
export async function GET(request, { params }) {
  try {
    const { id: activityId } = await params;
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Получаем участие пользователя
    const participation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId: decoded.userId
        }
      }
    });

    // Получаем общее количество участников
    const goingParticipantsCount = await prisma.activityParticipant.count({
      where: {
        activityId,
        status: 'GOING'
      }
    });

    return NextResponse.json({
      isGoing: participation?.status === 'GOING',
      goingParticipantsCount
    });

  } catch (error) {
    console.error('❌ Ошибка получения статуса участия:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
