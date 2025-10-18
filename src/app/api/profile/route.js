// src/app/api/profile/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { getUserGroup, getLevelProgress } from '../../../lib/userLevels';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const usertag = searchParams.get('usertag');
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    if (!usertag) {
      return NextResponse.json({ message: 'Usertag обязателен' }, { status: 400 });
    }

    // Находим пользователя по usertag
    const user = await prisma.user.findUnique({
      where: { usertag },
      select: {
        id: true,
        name: true,
        usertag: true,
        email: true,
        avatar: true,
        banner: true,
        bio: true,
        location: true,
        website: true,
        experiencePoints: true,
        createdAt: true,
        profileVisibility: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    const isOwnProfile = decoded.userId === user.id;

    // Проверяем дружбу для определения видимости постов
    let canViewPosts = false;
    
    if (isOwnProfile) {
      canViewPosts = true;
    } else {
      switch (user.profileVisibility) {
        case 'PUBLIC':
          canViewPosts = true;
          break;
        case 'FRIENDS_ONLY':
          // Проверяем, являются ли пользователи друзьями
          const friendship = await prisma.friendship.findFirst({
            where: {
              OR: [
                { user1Id: decoded.userId, user2Id: user.id },
                { user1Id: user.id, user2Id: decoded.userId }
              ]
            }
          });
          canViewPosts = !!friendship;
          break;
        case 'PRIVATE':
          canViewPosts = false;
          break;
      }
    }

    // Получаем посты в зависимости от прав доступа
    let posts = [];
    if (canViewPosts) {
      posts = await prisma.post.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, avatar: true }
          },
          likes: {
            select: { userId: true }
          },
          comments: {
            select: { id: true }
          }
        }
      });
    }

    // Получаем ВСЕ отпуски пользователя через vacation_members
    const vacationMembers = await prisma.vacationMember.findMany({
      where: {
        userId: user.id,
        status: 'accepted'
      },
      include: {
        vacation: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            },
            members: {
              where: { status: 'accepted' },
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            },
            _count: {
              select: {
                activities: true,
                memories: true,
                members: true
              }
            }
          }
        }
      },
      orderBy: { vacation: { startDate: 'desc' } }
    });

    // Преобразуем в формат отпусков
    const vacations = vacationMembers.map(member => ({
      ...member.vacation,
      userRole: member.role,
      isOwner: member.role === 'owner'
    }));

    // Получаем информацию об уровне пользователя
    const userGroup = await getUserGroup(user.id);
    const levelProgress = await getLevelProgress(user.id);

    // Формируем полный профиль
    const userProfile = {
      ...user,
      posts,
      vacations,
      canViewPosts,
      // Добавляем информацию об уровне
      userGroup,
      levelProgress
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// API для обновления профиля
export async function PUT(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { name, usertag, bio, location, website, profileVisibility } = await request.json();

    // Валидация
    if (!name || !usertag) {
      return NextResponse.json(
        { message: 'Имя и usertag обязательны' },
        { status: 400 }
      );
    }

    if (usertag.length < 3 || usertag.length > 20) {
      return NextResponse.json(
        { message: 'Usertag должен быть от 3 до 20 символов' },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9-]+$/.test(usertag)) {
      return NextResponse.json(
        { message: 'Usertag может содержать только латинские буквы в нижнем регистре, цифры и дефисы' },
        { status: 400 }
      );
    }

    // Проверяем, не занят ли usertag другим пользователем
    const existingUser = await prisma.user.findFirst({
      where: {
        usertag,
        NOT: {
          id: decoded.userId
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Этот usertag уже занят' },
        { status: 409 }
      );
    }

    // Обновляем профиль
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        usertag,
        bio,
        location,
        website,
        profileVisibility
      },
      select: {
        id: true,
        name: true,
        usertag: true,
        email: true,
        avatar: true,
        banner: true,
        bio: true,
        location: true,
        website: true,
        profileVisibility: true,
        createdAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Этот usertag уже занят' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
