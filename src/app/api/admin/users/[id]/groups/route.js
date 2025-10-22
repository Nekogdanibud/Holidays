import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';

async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

export async function GET(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: userId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            level: true,
            minPoints: true,
            maxPoints: true,
            color: true,
            bgColor: true,
            icon: true,
            badgeText: true,
            isExclusive: true
          }
        }
      }
    });

    return NextResponse.json({ userGroups });

  } catch (error) {
    console.error('Ошибка получения групп пользователя:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: userId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json(
        { message: 'Group ID обязателен' },
        { status: 400 }
      );
    }

    console.log('Adding user', userId, 'to group', groupId);

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    // Проверяем существование группы
    const group = await prisma.group.findUnique({ 
      where: { id: groupId } 
    });

    if (!group) {
      console.log('Group not found:', groupId);
      return NextResponse.json({ message: 'Группа не найдена' }, { status: 404 });
    }

    console.log('User and group found, creating userGroup...');

    // Проверяем, не состоит ли пользователь уже в этой группе
    const existingUserGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (existingUserGroup) {
      return NextResponse.json(
        { message: 'Пользователь уже состоит в этой группе' },
        { status: 409 }
      );
    }

    // Создаем связь пользователя с группой
    const userGroup = await prisma.userGroup.create({
      data: {
        userId,
        groupId,
        joinedAt: new Date()
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            description: true,
            level: true,
            minPoints: true,
            maxPoints: true,
            color: true,
            bgColor: true,
            icon: true,
            badgeText: true,
            isExclusive: true
          }
        }
      }
    });

    console.log('UserGroup created successfully:', userGroup);

    return NextResponse.json({
      message: 'Пользователь добавлен в группу',
      userGroup
    });

  } catch (error) {
    console.error('Ошибка добавления пользователя в группу:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Пользователь уже состоит в этой группе' },
        { status: 409 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Пользователь или группа не найдены' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: userId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { message: 'Group ID обязателен' },
        { status: 400 }
      );
    }

    console.log('Removing user', userId, 'from group', groupId);

    // Проверяем существование связи
    const existingUserGroup = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!existingUserGroup) {
      return NextResponse.json(
        { message: 'Пользователь не состоит в этой группе' },
        { status: 404 }
      );
    }

    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    console.log('UserGroup deleted successfully');

    return NextResponse.json({ message: 'Пользователь удален из группы' });

  } catch (error) {
    console.error('Ошибка удаления пользователя из группы:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Пользователь не состоит в этой группе' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера: ' + error.message },
      { status: 500 }
    );
  }
}
