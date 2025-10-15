// src/app/api/profile/posts/[id]/like/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

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

    // Проверяем, существует ли пост
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          where: { userId: decoded.userId }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ message: 'Запись не найдена' }, { status: 404 });
    }

    const isLiked = post.likes.length > 0;

    if (isLiked) {
      // Удаляем лайк
      await prisma.postLike.deleteMany({
        where: {
          postId: postId,
          userId: decoded.userId
        }
      });
    } else {
      // Добавляем лайк
      await prisma.postLike.create({
        data: {
          postId: postId,
          userId: decoded.userId
        }
      });
    }

    // Получаем обновленное количество лайков
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          select: { userId: true }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    return NextResponse.json({
      liked: !isLiked,
      likesCount: updatedPost._count.likes
    });

  } catch (error) {
    console.error('Ошибка лайка записи:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
