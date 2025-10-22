import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Получить комментарии поста
export async function GET(request, { params }) {
  try {
    const { id: postId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, usertag: true }
        },
        // ПРАВИЛЬНО: images (согласно схеме)
        images: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(comments);

  } catch (error) {
    console.error('Ошибка получения комментариев:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Создать комментарий
export async function POST(request, { params }) {
  try {
    const { id: postId } = await params;
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
    const images = formData.getAll('images');

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: 'Содержание комментария обязательно' },
        { status: 400 }
      );
    }

    // Проверяем существование поста
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ message: 'Пост не найден' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Создаем комментарий
      const comment = await tx.comment.create({
        data: {
          content: content.trim(),
          authorId: decoded.userId,
          postId
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true, usertag: true }
          },
          // ПРАВИЛЬНО: images (согласно схеме)
          images: true
        }
      });

      // Обрабатываем изображения
      if (images && images.length > 0) {
        const commentImages = [];

        for (const image of images) {
          if (image.size > 0) {
            // Создаем директорию для загрузок
            const uploadDir = join(process.cwd(), 'public', 'uploads', 'comments');
            await mkdir(uploadDir, { recursive: true });

            // Генерируем уникальное имя файла
            const timestamp = Date.now();
            const filename = `${timestamp}-${image.name}`;
            const filepath = join(uploadDir, filename);

            // Сохраняем файл
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            // Создаем запись в базе - ПРАВИЛЬНО
            const commentImage = await tx.commentImage.create({
              data: {
                url: `/uploads/comments/${filename}`,
                commentId: comment.id
              }
            });

            commentImages.push(commentImage);
          }
        }

        comment.images = commentImages;
      }

      return comment;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Ошибка создания комментария:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
