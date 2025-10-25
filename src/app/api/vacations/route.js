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
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } } // Участник
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                usertag: true
              }
            }
          }
        },
        activities: {
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
            captureType: true, // Используем captureType вместо isCapture
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
      },
      orderBy: { startDate: 'asc' }
    });

    return NextResponse.json(vacations);

  } catch (error) {
    console.error('Ошибка получения отпусков:', error);
    
    // Обработка ошибки отсутствующего поля
    if (error.code === 'P2022') {
      console.error('Отсутствует поле в базе данных:', error.meta);
      return NextResponse.json(
        { message: 'Ошибка структуры базы данных. Пожалуйста, выполните миграцию.' },
        { status: 500 }
      );
    }
    
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

    const { title, description, destination, startDate, endDate, coverImage, isPublic = false } = await request.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { message: 'Название и даты обязательны' },
        { status: 400 }
      );
    }

    // Валидация дат
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json(
        { message: 'Дата начала должна быть раньше даты окончания' },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { message: 'Дата начала не может быть в прошлом' },
        { status: 400 }
      );
    }

    // Создаем отпуск
    const vacation = await prisma.vacation.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        destination: destination?.trim() || null,
        startDate: start,
        endDate: end,
        coverImage: coverImage || null,
        isPublic: Boolean(isPublic),
        userId: decoded.userId,
        // Автоматически добавляем владельца как участника
        members: {
          create: {
            userId: decoded.userId,
            role: 'OWNER',
            status: 'ACCEPTED',
            joinedAt: new Date()
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                usertag: true
              }
            }
          }
        },
        activities: {
          orderBy: { date: 'asc' },
          take: 5
        },
        memories: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            title: true,
            imageUrl: true,
            captureType: true,
            takenAt: true
          }
        },
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
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Отпуск с таким названием уже существует' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
