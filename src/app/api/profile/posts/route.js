// src/app/api/profile/posts/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        // ПРАВИЛЬНОЕ имя отношения согласно схеме
        images: {
          select: {
            id: true,
            url: true
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
            },
            // ПРАВИЛЬНОЕ имя отношения для комментариев
            images: true
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

    const formData = await request.formData();
    const content = formData.get('content');
    const imageFiles = formData.getAll('images');

    // Валидация контента
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { message: 'Содержание обязательно' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { message: 'Содержание не должно превышать 500 символов' },
        { status: 400 }
      );
    }

    // Валидация изображений
    if (imageFiles && imageFiles.length > 0) {
      for (const image of imageFiles) {
        if (image.size === 0) continue;
        
        // Проверка типа файла
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(image.type)) {
          return NextResponse.json(
            { message: 'Разрешены только изображения в формате JPEG, PNG или WebP' },
            { status: 400 }
          );
        }

        // Проверка размера файла (5MB максимум)
        const maxSize = 5 * 1024 * 1024;
        if (image.size > maxSize) {
          return NextResponse.json(
            { message: 'Размер каждого изображения не должен превышать 5MB' },
            { status: 400 }
          );
        }
      }
    }

    // Создаем пост и изображения в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Создаем пост
      const post = await tx.post.create({
        data: {
          content: trimmedContent,
          authorId: decoded.userId
        }
      });

      // Обрабатываем изображения - ИСПРАВЛЕНО: проверяем imageFiles
      if (imageFiles && imageFiles.length > 0) {
        for (const image of imageFiles) {
          if (image.size === 0) continue;

          // Создаем директорию для загрузок
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'posts');
          await mkdir(uploadDir, { recursive: true });

          // Генерируем уникальное имя файла
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExtension = image.name.split('.').pop();
          const filename = `${timestamp}-${randomString}.${fileExtension}`;
          const filepath = join(uploadDir, filename);

          // Сохраняем файл
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);

          // Создаем запись в базе
          await tx.postImage.create({
            data: {
              url: `/uploads/posts/${filename}`,
              postId: post.id
            }
          });
        }
      }

      // Получаем полные данные поста
      const postWithData = await tx.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              usertag: true
            }
          },
          // ПРАВИЛЬНОЕ имя отношения
          images: {
            select: {
              id: true,
              url: true
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

      return postWithData;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания поста:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
