// src/app/api/profile/posts/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

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

    if (!userId) {
      return NextResponse.json({ message: 'User ID обязателен' }, { status: 400 });
    }

    // Находим пользователя и проверяем настройки приватности
    const profileUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        profileVisibility: true 
      }
    });

    if (!profileUser) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    const currentUserId = decoded.userId;
    const isOwnProfile = currentUserId === userId;

    // Проверяем видимость постов
    let canViewPosts = false;
    
    if (isOwnProfile) {
      canViewPosts = true;
    } else {
      switch (profileUser.profileVisibility) {
        case 'PUBLIC':
          canViewPosts = true;
          break;
        case 'FRIENDS_ONLY':
          // Проверяем дружбу
          const friendship = await prisma.friendship.findFirst({
            where: {
              OR: [
                { user1Id: currentUserId, user2Id: userId },
                { user1Id: userId, user2Id: currentUserId }
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

    if (!canViewPosts) {
      return NextResponse.json([], { status: 200 });
    }

    // Получаем посты
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);

  } catch (error) {
    console.error('Ошибка получения постов:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: 'Содержание обязательно' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { message: 'Содержание не должно превышать 500 символов' },
        { status: 400 }
      );
    }

    // Создаем пост
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: decoded.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            usertag: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания поста:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
