// src/app/api/admin/groups/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addUserToExclusiveGroup, removeUserFromExclusiveGroup, getExclusiveGroups } from '@/lib/userLevels';

// Проверка прав администратора
async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

// Получить все эксклюзивные группы
export async function GET() {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const groups = await getExclusiveGroups();
    return NextResponse.json(groups);

  } catch (error) {
    console.error('Ошибка получения эксклюзивных групп:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Добавить пользователя в эксклюзивную группу
export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { userId, groupId } = await request.json();

    if (!userId || !groupId) {
      return NextResponse.json(
        { message: 'User ID и Group ID обязательны' },
        { status: 400 }
      );
    }

    const result = await addUserToExclusiveGroup(userId, groupId);
    return NextResponse.json({ 
      message: 'Пользователь добавлен в эксклюзивную группу',
      userGroup: result 
    });

  } catch (error) {
    console.error('Ошибка добавления в эксклюзивную группу:', error);
    return NextResponse.json(
      { message: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Удалить пользователя из эксклюзивной группы
export async function DELETE(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID обязателен' },
        { status: 400 }
      );
    }

    const result = await removeUserFromExclusiveGroup(userId);
    return NextResponse.json({ 
      message: 'Пользователь удален из эксклюзивной группы',
      result 
    });

  } catch (error) {
    console.error('Ошибка удаления из эксклюзивной группы:', error);
    return NextResponse.json(
      { message: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
