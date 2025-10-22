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

export async function GET(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: groupId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            userGroups: true
          }
        },
        userGroups: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                usertag: true,
                avatar: true,
                experiencePoints: true
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ message: 'Группа не найдена' }, { status: 404 });
    }

    return NextResponse.json({ group });

  } catch (error) {
    console.error('Ошибка получения группы:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: groupId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const updates = await request.json();

    const validFields = [
      'name', 'description', 'level', 'minPoints', 'maxPoints',
      'color', 'bgColor', 'icon', 'badgeText', 'isExclusive'
    ];

    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (validFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Группа обновлена',
      group: updatedGroup
    });

  } catch (error) {
    console.error('Ошибка обновления группы:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Группа с таким именем или уровнем уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Ожидаем параметры
    const { id: groupId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    await prisma.group.delete({
      where: { id: groupId }
    });

    return NextResponse.json({ message: 'Группа удалена' });

  } catch (error) {
    console.error('Ошибка удаления группы:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
