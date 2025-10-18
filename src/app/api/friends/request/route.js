// src/app/api/friends/request/route.js
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID обязателен' }, { status: 400 });
    }

    // Нельзя отправить запрос самому себе
    if (userId === decoded.userId) {
      return NextResponse.json(
        { message: 'Нельзя отправить запрос в друзья самому себе' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем, не отправили ли уже запрос
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: decoded.userId,
        receiverId: userId
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { message: 'Запрос в друзья уже отправлен' },
        { status: 409 }
      );
    }

    // Проверяем, не являются ли уже друзьями
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: userId },
          { user1Id: userId, user2Id: decoded.userId }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json(
        { message: 'Пользователь уже у вас в друзьях' },
        { status: 409 }
      );
    }

    // Создаем запрос в друзья
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: decoded.userId,
        receiverId: userId,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true
          }
        }
      }
    });

    // Создаем уведомление для получателя
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'friend_request',
        title: 'Новый запрос в друзья',
        message: `${friendRequest.sender.name} хочет добавить вас в друзья`,
        data: {
          requestId: friendRequest.id,
          senderId: decoded.userId,
          senderName: friendRequest.sender.name,
          senderAvatar: friendRequest.sender.avatar
        }
      }
    });

    return NextResponse.json({
      message: 'Запрос в друзья отправлен',
      request: friendRequest
    });

  } catch (error) {
    console.error('Ошибка отправки запроса в друзья:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
