// src/app/api/notifications/test/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

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

    const { type = 'info' } = await request.json();

    // Создаем тестовое уведомление
    let notificationData;

    switch (type) {
      case 'invitation':
        notificationData = {
          userId: decoded.userId,
          type: 'invitation',
          title: 'Приглашение в отпуск',
          message: 'Анна пригласила вас в отпуск "Отдых на Бали"',
          data: {
            invitationId: 'test-invitation-123',
            vacationId: 'test-vacation-456',
            invitedByName: 'Анна',
            vacationTitle: 'Отдых на Бали'
          }
        };
        break;

      case 'activity_update':
        notificationData = {
          userId: decoded.userId,
          type: 'activity_update',
          title: 'Обновление планов',
          message: 'В вашем отпуске "Горные походы" добавлена новая активность',
          data: {
            vacationId: 'test-vacation-789',
            activityId: 'test-activity-123'
          }
        };
        break;

      case 'memory_comment':
        notificationData = {
          userId: decoded.userId,
          type: 'memory_comment',
          title: 'Новый комментарий',
          message: 'Иван прокомментировал ваше воспоминание',
          data: {
            memoryId: 'test-memory-123',
            commentId: 'test-comment-456'
          }
        };
        break;

      default:
        notificationData = {
          userId: decoded.userId,
          type: 'info',
          title: 'Тестовое уведомление',
          message: 'Это тестовое уведомление для проверки системы',
          data: {
            test: true
          }
        };
    }

    const notification = await prisma.notification.create({
      data: notificationData,
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

    return NextResponse.json({
      message: 'Тестовое уведомление создано',
      notification
    });

  } catch (error) {
    console.error('Ошибка создания тестового уведомления:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
