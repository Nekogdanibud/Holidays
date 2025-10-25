// src/app/api/vacations/[id]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    console.log('🔍 Получение отпуска с ID:', id);
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      console.log('❌ Нет access token');
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      console.log('❌ Невалидный токен');
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    console.log('👤 ID пользователя:', decoded.userId);

    const vacation = await prisma.vacation.findFirst({
      where: {
        id: id,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          where: { status: 'ACCEPTED' },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, usertag: true }
            }
          }
        },
        activities: {
          orderBy: { date: 'asc' },
          take: 10,
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
        },
        memories: {
          orderBy: { createdAt: 'desc' },
          take: 12,
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            isFavorite: true,
            captureType: true, // Используем существующее поле
            locationId: true,
            activityId: true,
            tags: true,
            takenAt: true,
            authorId: true,
            vacationId: true,
            author: {
              select: { id: true, name: true, avatar: true }
            },
            location: {
              select: { id: true, name: true, address: true }
            }
          }
        },
        _count: {
          select: {
            activities: true,
            memories: true,
            members: {
              where: { status: 'ACCEPTED' }
            },
            locations: true
          }
        }
      }
    });

    if (!vacation) {
      console.log('❌ Отпуск не найден или нет доступа');
      return NextResponse.json({ message: 'Отпуск не найден' }, { status: 404 });
    }

    // Форматируем активности для удобства
    const formattedVacation = {
      ...vacation,
      activities: vacation.activities.map(activity => ({
        ...activity,
        author: activity.participants[0]?.user || null,
        participants: activity.participants.map(p => p.user)
      }))
    };

    console.log('✅ Отпуск найден:', formattedVacation.title);
    return NextResponse.json(formattedVacation);

  } catch (error) {
    console.error('❌ Ошибка получения отпуска:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
