// src/app/api/activities/[id]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Получаем активность с полной информацией
    const activity = await prisma.activity.findFirst({
      where: {
        id: id,
        vacation: {
          OR: [
            { userId: decoded.userId },
            { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
          ]
        }
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            description: true,
            latitude: true,
            longitude: true,
            type: true,
            priceLevel: true,
            rating: true,
            website: true,
            phone: true
          }
        },
        vacation: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                usertag: true
              }
            }
          }
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ message: 'Активность не найдена' }, { status: 404 });
    }

    // Получаем фотографии для этой активности
    const memories = await prisma.memory.findMany({
      where: {
        OR: [
          { activityId: id }, // Фото привязанные к активности
          { 
            AND: [
              { vacationId: activity.vacationId },
              { 
                takenAt: {
                  gte: new Date(activity.date.setHours(0, 0, 0, 0)),
                  lt: new Date(activity.date.setHours(23, 59, 59, 999))
                }
              }
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true
          }
        }
      },
      orderBy: { takenAt: 'asc' }
    });

    const response = {
      ...activity,
      memories
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Ошибка получения активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const updates = await request.json();

    // Проверяем права на редактирование
    const activity = await prisma.activity.findFirst({
      where: {
        id: id,
        vacation: {
          OR: [
            { userId: decoded.userId },
            { 
              members: { 
                some: { 
                  userId: decoded.userId, 
                  status: 'ACCEPTED',
                  role: { in: ['OWNER', 'CO_ORGANIZER'] }
                } 
              } 
            }
          ]
        }
      }
    });

    if (!activity) {
      return NextResponse.json({ message: 'Активность не найдена или нет прав' }, { status: 404 });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: id },
      data: {
        ...updates,
        date: updates.date ? new Date(updates.date) : undefined,
        cost: updates.cost ? parseFloat(updates.cost) : undefined
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

    return NextResponse.json(updatedActivity);

  } catch (error) {
    console.error('Ошибка обновления активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
