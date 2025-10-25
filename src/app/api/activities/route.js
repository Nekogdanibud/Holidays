// src/app/api/activities/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const { 
      title, 
      description, 
      date, 
      type, 
      vacationId, 
      locationId, 
      status = 'PLANNED', 
      priority = 'MEDIUM', 
      startTime, 
      endTime, 
      cost, 
      notes 
    } = await request.json();

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
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED', role: { in: ['OWNER', 'CO_ORGANIZER'] } } } }
        ]
      }
    });

    if (!vacationAccess) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    // Создаем активность
    const activity = await prisma.activity.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: new Date(date),
        type,
        status,
        priority,
        startTime: startTime || null,
        endTime: endTime || null,
        cost: cost ? parseFloat(cost) : null,
        notes: notes?.trim() || null,
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
        },
        vacation: {
          select: { id: true, title: true }
        }
      }
    });

    // Автоматически добавляем создателя как участника
    await prisma.activityParticipant.create({
      data: {
        activityId: activity.id,
        userId: decoded.userId,
        status: 'GOING'
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
        },
        vacation: {
          select: { id: true, title: true }
        }
      }
    });

    return NextResponse.json(updatedActivity, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
