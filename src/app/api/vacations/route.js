// src/app/api/vacations/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// Получить все отпуски пользователя
export async function GET(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Получаем отпуски где пользователь является участником
    const vacations = await prisma.vacation.findMany({
      where: {
        OR: [
          { userId: decoded.userId }, // Владелец
          { members: { some: { userId: decoded.userId, status: 'accepted' } } } // Участник
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          where: {
            status: 'accepted'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        activities: {
          orderBy: { date: 'asc' }
        },
        memories: true,
        locations: true,
        _count: {
          select: {
            activities: true,
            memories: true,
            members: true,
            locations: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json(vacations);

  } catch (error) {
    console.error('Ошибка получения отпусков:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Создать новый отпуск
export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const { title, description, destination, startDate, endDate } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Название и даты обязательны' },
        { status: 400 }
      );
    }

    // Создаем отпуск
    const vacation = await prisma.vacation.create({
      data: {
        title,
        description,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        userId: decoded.userId,
        // Автоматически добавляем владельца как участника
        members: {
          create: {
            userId: decoded.userId,
            role: 'owner',
            status: 'accepted'
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          where: {
            status: 'accepted'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        activities: true,
        memories: true,
        locations: true,
        _count: {
          select: {
            activities: true,
            memories: true,
            members: true,
            locations: true
          }
        }
      }
    });

    return NextResponse.json(vacation, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания отпуска:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
