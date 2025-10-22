import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

export async function PUT(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { message: 'User ID и роль обязательны' },
        { status: 400 }
      );
    }

    const validRoles = ['USER', 'ADMIN', 'MODERATOR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Недопустимая роль' },
        { status: 400 }
      );
    }

    if (userId === decoded.userId) {
      return NextResponse.json(
        { message: 'Нельзя изменить собственную роль' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({
      message: 'Роль пользователя обновлена',
      user: updatedUser
    });

  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
