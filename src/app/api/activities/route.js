// src/app/api/activities/route.js
import { NextResponse } from 'next/server';
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

    const { title, description, date, type, vacationId, locationId } = await request.json();

    if (!title || !date || !type || !vacationId) {
      return NextResponse.json(
        { message: 'Обязательные поля: название, дата, тип и ID отпуска' },
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

    // Создаем активность
    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
        vacationId,
        locationId: locationId || null
      },
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

    // Автоматически добавляем создателя как участника
    await prisma.activityParticipant.create({
      data: {
        activityId: activity.id,
        userId: decoded.userId,
        status: 'going'
      }
    });

    // Обновляем активность с участниками
    const updatedActivity = await prisma.activity.findUnique({
      where: { id: activity.id },
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

    // Форматируем для ответа
    const formattedActivity = {
      ...updatedActivity,
      author: updatedActivity.participants[0]?.user || null,
      participants: updatedActivity.participants.map(p => p.user)
    };

    return NextResponse.json(formattedActivity, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
