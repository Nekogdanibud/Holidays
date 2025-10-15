import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

// Получить профиль пользователя
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const profileUserId = userId || decoded.userId;
    const isOwnProfile = profileUserId === decoded.userId;

    // Сначала получаем базовую информацию о пользователе БЕЗ поля vacations
    const user = await prisma.user.findUnique({
      where: { id: profileUserId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        banner: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
        profileVisibility: true,
        achievements: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            icon: true,
            earnedAt: true
          }
        },
        posts: {
          where: {
            OR: [
              { isPublic: true },
              ...(isOwnProfile ? [{ isPublic: false }] : [])
            ]
          },
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
        },
        // УБИРАЕМ vacations отсюда - этого поля нет в модели User
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    // Получаем отпуски, созданные пользователем
    const ownedVacations = await prisma.vacation.findMany({
      where: {
        userId: profileUserId,
        OR: [
          { isPublic: true },
          ...(isOwnProfile ? [{ isPublic: false }] : [])
        ]
      },
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
      },
      orderBy: { startDate: 'desc' }
    });

    // Получаем отпуски, где пользователь является участником (но не владельцем)
    const memberVacations = await prisma.vacation.findMany({
      where: {
        members: {
          some: {
            userId: profileUserId,
            status: 'accepted'
          }
        },
        // Исключаем отпуски, где пользователь является владельцем (они уже в ownedVacations)
        NOT: {
          userId: profileUserId
        },
        OR: [
          { isPublic: true },
          ...(isOwnProfile ? [{ isPublic: false }] : [])
        ]
      },
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
      },
      orderBy: { startDate: 'desc' }
    });

    // Объединяем все отпуски
    const allVacations = [
      ...ownedVacations,
      ...memberVacations
    ].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    // Формируем финальный ответ
    const userWithAllVacations = {
      ...user,
      vacations: allVacations // Добавляем vacations в ответ
    };

    return NextResponse.json(userWithAllVacations);

  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновить профиль
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

    const { name, bio, location, website, profileVisibility, avatar, banner } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(website !== undefined && { website }),
        ...(profileVisibility !== undefined && { profileVisibility }),
        ...(avatar !== undefined && { avatar }),
        ...(banner !== undefined && { banner })
      },
      select: {
        id: true,
        name: true,
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
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}