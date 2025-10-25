// src/app/api/vacations/[id]/memories/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Ждём params — теперь это Promise
  const { id } = await params;

  // Ждём cookies() — теперь это тоже асинхронная функция
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Не авторизован' },
      { status: 401 }
    );
  }

  try {
    const memories = await prisma.memory.findMany({
      where: { vacationId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { takenAt: 'desc' },
    });

    return NextResponse.json(memories, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении воспоминаний:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера при загрузке воспоминаний' },
      { status: 500 }
    );
  }
}

// Опционально: POST для создания воспоминания
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vacationId } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'Не авторизован' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      isCapture,
      locationId,
      activityId,
      tags,
      takenAt,
    } = body;

    // Проверка: пользователь должен быть участником отпуска
    const member = await prisma.vacationMember.findUnique({
      where: {
        vacationId_userId: {
          vacationId,
          userId: accessToken, // временно — потом будет JWT с userId
        },
      },
    });

    if (!member || member.status !== 'ACCEPTED') {
      return NextResponse.json(
        { message: 'Доступ запрещён: вы не участник этого отпуска' },
        { status: 403 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        title,
        description: description ?? null,
        imageUrl,
        isCapture: isCapture ?? false,
        locationId: locationId ?? null,
        activityId: activityId ?? null,
        tags: tags ?? [],
        takenAt: new Date(takenAt),
        vacationId,
        authorId: accessToken, // заменить на реальный userId из JWT
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    console.error('Ошибка при создании воспоминания:', error);
    return NextResponse.json(
      { message: 'Ошибка при создании воспоминания' },
      { status: 500 }
    );
  }
}
