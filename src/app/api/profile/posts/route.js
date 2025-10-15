// src/app/api/profile/posts/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Вспомогательная функция для получения пользователя из сессии
async function getAuthUser(request) {
  try {
    // Получаем сессию из cookies
    const cookieHeader = request.headers.get('cookie');
    
    // Если у вас есть сессия в cookies, можно получить userId оттуда
    // Или используем заголовки, если передаете токен
    const authHeader = request.headers.get('authorization');
    
    // Временное решение: будем использовать userId из query параметра для GET запросов
    // Для POST запросов будем проверять через сессию
    return { id: null }; // Заглушка - нужно адаптировать под вашу систему
  } catch (error) {
    return null;
  }
}

// GET /api/profile/posts?userId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        profileVisibility: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Получаем текущего пользователя из сессии
    const currentUser = await getAuthUser(request);
    const isOwnProfile = currentUser?.id === userId;

    // Определяем, какие посты показывать
    let whereCondition = { authorId: userId };

    if (!isOwnProfile && user.profileVisibility === 'private') {
      // Для приватных профилей показываем только публичные посты
      whereCondition.isPublic = true;
    }

    const posts = await prisma.post.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
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
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/profile/posts
export async function POST(request) {
  try {
    // Временное решение: будем получать userId из тела запроса
    // В реальном приложении нужно получать из сессии
    const { content, isPublic = true, userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Content too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Создаем пост
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        isPublic,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
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
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
