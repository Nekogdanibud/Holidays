// src/app/api/vacations/[id]/invite-by-usertag/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request, { params }) {
  try {
    const { id: vacationId } = await params;
    const { usertag } = await request.json();
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем права владельца
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

    // Находим пользователя по usertag
    const invitedUser = await prisma.user.findUnique({
      where: { usertag }
    });

    if (!invitedUser) {
      return NextResponse.json({ message: 'Пользователь с таким usertag не найден' }, { status: 404 });
    }

    // Проверяем, не приглашен ли уже
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        vacationId,
        email: invitedUser.email
      }
    });

    if (existingInvitation) {
      return NextResponse.json({ message: 'Пользователь уже приглашен' }, { status: 409 });
    }

    // Проверяем, не является ли уже участником
    const existingMember = await prisma.vacationMember.findFirst({
      where: {
        vacationId,
        userId: invitedUser.id
      }
    });

    if (existingMember) {
      return NextResponse.json({ message: 'Пользователь уже является участником' }, { status: 409 });
    }

    // Генерируем токен для приглашения
    const token = randomBytes(32).toString('hex');

    // Создаем приглашение
    const invitation = await prisma.invitation.create({
      data: {
        vacationId,
        email: invitedUser.email,
        token: token,
        invitedById: decoded.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 дней
      }
    });

    // Создаем уведомление
    await prisma.notification.create({
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
      }
    });

    return NextResponse.json({ 
      message: 'Приглашение отправлено',
      user: {
        id: invitedUser.id,
        name: invitedUser.name,
        usertag: invitedUser.usertag
      }
    });

  } catch (error) {
    console.error('Ошибка отправки приглашения по usertag:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
