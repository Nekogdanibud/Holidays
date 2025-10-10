// src/app/api/notifications/invite/route.js
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { userId, vacationId, invitedByName, vacationTitle } = await request.json();

    if (!userId || !vacationId || !invitedByName) {
      return NextResponse.json(
        { message: 'Отсутствуют обязательные данные' },
        { status: 400 }
      );
    }

    // Создаем уведомление о приглашении
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'invitation',
        title: 'Приглашение в отпуск',
        message: `${invitedByName} пригласил(а) вас в отпуск "${vacationTitle}"`,
        data: {
          vacationId,
          invitedByName,
          vacationTitle
        }
      },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            avatar: true 
          }
        }
      }
    });

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
