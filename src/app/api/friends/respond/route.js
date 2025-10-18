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

    const { requestId, accept } = await request.json();

    console.log('📨 Обработка запроса дружбы:', { requestId, accept, userId: decoded.userId });

    if (!requestId) {
      return NextResponse.json({ message: 'Request ID обязателен' }, { status: 400 });
    }

    // Находим запрос
    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: requestId,
        receiverId: decoded.userId,
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
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true
          }
        }
      }
    });

    console.log('🔍 Найден запрос дружбы:', friendRequest);

    if (!friendRequest) {
      return NextResponse.json({ message: 'Запрос не найден' }, { status: 404 });
    }

    if (accept) {
      // Принимаем запрос - создаем дружбу
      const result = await prisma.$transaction(async (tx) => {
        // Создаем запись о дружбе (убедимся, что user1Id всегда меньше user2Id для уникальности)
        const user1Id = friendRequest.senderId < decoded.userId ? friendRequest.senderId : decoded.userId;
        const user2Id = friendRequest.senderId < decoded.userId ? decoded.userId : friendRequest.senderId;

        console.log('👥 Создаем дружбу между:', { user1Id, user2Id });

        const friendship = await tx.friendship.create({
          data: {
            user1Id,
            user2Id
          }
        });

        // Обновляем статус запроса
        await tx.friendRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
        });

        // Создаем уведомление для отправителя
        await tx.notification.create({
          data: {
            userId: friendRequest.senderId,
            type: 'friend_request_accepted',
            title: 'Запрос в друзья принят',
            message: `${friendRequest.receiver.name} принял(а) ваш запрос в друзья`,
            data: {
              friendId: decoded.userId,
              friendName: friendRequest.receiver.name,
              friendAvatar: friendRequest.receiver.avatar,
              friendUsertag: friendRequest.receiver.usertag
            }
          }
        });

        return friendship;
      });

      console.log('✅ Запрос дружбы принят:', result);

      return NextResponse.json({ 
        message: 'Запрос в друзья принят',
        friendship: result
      });

    } else {
      // Отклоняем запрос
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });

      console.log('❌ Запрос дружбы отклонен');

      return NextResponse.json({ message: 'Запрос в друзья отклонен' });
    }

  } catch (error) {
    console.error('❌ Ошибка обработки запроса в друзья:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
