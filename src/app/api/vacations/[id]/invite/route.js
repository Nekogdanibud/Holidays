// src/app/api/vacations/[id]/invite/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request, { params }) {
  try {
    // Await params для Next.js 15
    const { id: vacationId } = await params;
    const { email } = await request.json();
    
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

    // Проверяем, существует ли пользователь с таким email
    const invitedUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!invitedUser) {
      return NextResponse.json({ message: 'Пользователь с таким email не найден' }, { status: 404 });
    }

    // Проверяем, не приглашен ли уже этот пользователь
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        vacationId,
        email
      }
    });

    if (existingInvitation) {
      return NextResponse.json({ message: 'Пользователь уже приглашен' }, { status: 409 });
    }

    // Проверяем, не является ли пользователь уже участником
    const existingMember = await prisma.vacationMember.findFirst({
      where: {
        vacationId,
        userId: invitedUser.id
      }
    });

    if (existingMember) {
      return NextResponse.json({ message: 'Пользователь уже является участником' }, { status: 409 });
    }

    // Создаем приглашение
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

    const invitation = await prisma.invitation.create({
      data: {
        vacationId,
        email,
        token,
        invitedById: decoded.userId,
        expiresAt
      }
    });

    // Создаем уведомление для приглашенного пользователя
    const notification = await prisma.notification.create({
      data: {
        userId: invitedUser.id,
        type: 'invitation',
        title: 'Приглашение в отпуск',
        message: `${vacation.user.name} пригласил(а) вас в отпуск "${vacation.title}"`,
        data: {
          invitationId: invitation.id,
          vacationId: vacation.id,
          invitedByName: vacation.user.name,
          vacationTitle: vacation.title
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

    return NextResponse.json({ 
      message: 'Приглашение отправлено',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status
      },
      notification
    });

  } catch (error) {
    console.error('Ошибка отправки приглашения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
