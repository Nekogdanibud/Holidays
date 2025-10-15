// src/app/api/profile/posts/[id]/like/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const postId = params.id;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Временное решение: получаем userId из тела запроса
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Проверяем существование поста
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
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

    // Проверяем, не лайкнул ли уже пользователь этот пост
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId
        }
      }
    });

    if (existingLike) {
      // Убираем лайк
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId
          }
        }
      });
    } else {
      // Добавляем лайк
      await prisma.postLike.create({
        data: {
          userId: userId,
          postId: postId
        }
      });
    }

    // Получаем обновленное количество лайков
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          select: {
            userId: true
          }
        }
      }
    });

    return NextResponse.json({ 
      liked: !existingLike,
      likesCount: updatedPost.likes.length 
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
