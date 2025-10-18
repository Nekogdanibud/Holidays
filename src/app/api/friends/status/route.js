// src/app/api/friends/status/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    if (!targetUserId) {
      return NextResponse.json({ message: 'Target User ID обязателен' }, { status: 400 });
    }

    // Проверяем дружбу
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: decoded.userId }
        ]
      }
    });

    if (friendship) {
      return NextResponse.json({ status: 'friends' });
    }

    // Проверяем исходящий запрос
    const outgoingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: decoded.userId,
        receiverId: targetUserId,
        status: 'PENDING'
      }
    });

    if (outgoingRequest) {
      return NextResponse.json({ status: 'pending' });
    }

    // Проверяем входящий запрос
    const incomingRequest = await prisma.friendRequest.findFirst({
      where: {
        senderId: targetUserId,
        receiverId: decoded.userId,
        status: 'PENDING'
      }
    });

    if (incomingRequest) {
      return NextResponse.json({ status: 'incoming' });
    }

    return NextResponse.json({ status: 'none' });

  } catch (error) {
    console.error('Ошибка проверки статуса дружбы:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
