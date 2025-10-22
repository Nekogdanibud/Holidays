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
    const { id: userId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        usertag: true,
        email: true,
        avatar: true,
        banner: true,
        bio: true,
        role: true,
        location: true,
        website: true,
        profileVisibility: true,
        experiencePoints: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vacationMembers: true,
            ownedVacations: true,
            posts: true,
            friendsAsUser1: true,
            friendsAsUser2: true,
            memories: true,
            achievements: true
          }
        },
        ownedVacations: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            destination: true,
            coverImage: true,
            _count: {
              select: {
                members: true,
                memories: true,
                activities: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            _count: {
              select: {
                comments: true,
                likes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        userGroups: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                icon: true,
                badgeText: true,
                bgColor: true,
                color: true,
                isExclusive: true
              }
            }
          }
        },
        achievements: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            icon: true,
            earnedAt: true
          },
          orderBy: { earnedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Ошибка получения данных пользователя:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const updates = await request.json();

    const validFields = [
      'name', 'email', 'usertag', 'bio', 'location', 'website', 
      'profileVisibility', 'experiencePoints', 'avatar', 'banner'
    ];

    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (validFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        usertag: true,
        email: true,
        bio: true,
        location: true,
        website: true,
        profileVisibility: true,
        experiencePoints: true,
        avatar: true,
        banner: true
      }
    });

    return NextResponse.json({
      message: 'Данные пользователя обновлены',
      user: updatedUser
    });

  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Пользователь с таким email или usertag уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
