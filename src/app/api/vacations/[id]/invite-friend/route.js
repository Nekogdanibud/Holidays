// src/app/api/vacations/[id]/invite-friend/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id: vacationId } = await params;
    const { friendId } = await request.json();
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь - владелец отпуска
    const vacation = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        userId: decoded.userId
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!vacation) {
      return NextResponse.json({ message: 'Отпуск не найден или нет прав' }, { status: 404 });
    }

    // Проверяем, что friendId - действительно друг
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: decoded.userId, user2Id: friendId },
          { user1Id: friendId, user2Id: decoded.userId }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ message: 'Пользователь не является вашим другом' }, { status: 403 });
    }

    // Получаем информацию о друге
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, email: true, usertag: true }
    });

    if (!friend) {
      return NextResponse.json({ message: 'Друг не найден' }, { status: 404 });
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await prisma.vacationMember.findFirst({
      where: {
        vacationId,
        userId: friend.id,
        status: 'ACCEPTED'
      }
    });

    if (existingMember) {
      return NextResponse.json({ 
        message: 'Пользователь уже является участником этого отпуска' 
      }, { status: 409 });
    }

    // АТОМАРНАЯ ОПЕРАЦИЯ: создаем или обновляем приглашение
    const invitation = await prisma.invitation.upsert({
      where: {
        vacationId_email: {
          vacationId,
          email: friend.email
        }
      },
      update: {
        // Обновляем только если приглашение было отклонено/истекло
        token: randomBytes(32).toString('hex'),
        invitedById: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: new Date()
      },
      create: {
        vacationId,
        email: friend.email,
        token: randomBytes(32).toString('hex'),
        invitedById: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      }
    });

    // Проверяем, было ли приглашение только что создано или обновлено из неактивного статуса
    const shouldNotify = invitation.status === 'pending' && 
                        invitation.expiresAt > new Date();

    if (shouldNotify) {
      // Создаем уведомление для приглашенного пользователя
      await prisma.notification.create({
        data: {
          userId: friend.id,
          type: 'invitation',
          title: 'Приглашение в отпуск',
          message: `${vacation.user.name} пригласил(а) вас в отпуск "${vacation.title}"`,
          data: {
            invitationId: invitation.id,
            vacationId: vacation.id,
            invitedByName: vacation.user.name,
            vacationTitle: vacation.title
          }
        }
      });
    }

    return NextResponse.json({ 
      message: shouldNotify ? 'Приглашение отправлено' : 'Приглашение обновлено',
      user: {
        id: friend.id,
        name: friend.name,
        usertag: friend.usertag
      }
    });

  } catch (error) {
    console.error('Ошибка отправки приглашения другу:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        message: 'Приглашение уже существует' 
      }, { status: 409 });
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
