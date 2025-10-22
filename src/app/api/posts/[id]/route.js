import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

// Получить пост
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, usertag: true }
        },
        // ПРАВИЛЬНО: images (согласно схеме)
        images: true,
        likes: {
          select: { userId: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true, usertag: true }
            },
            // ПРАВИЛЬНО: images (согласно схеме)
            images: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ message: 'Пост не найден' }, { status: 404 });
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error('Ошибка получения поста:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Обновить пост
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    const { content, imageUrls } = await request.json();

    // Проверяем, что пользователь является автором поста
    const existingPost = await prisma.post.findFirst({
      where: { 
        id,
        authorId: decoded.userId 
      }
    });

    if (!existingPost) {
      return NextResponse.json({ message: 'Пост не найден или нет прав' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Обновляем пост
      const updatedPost = await tx.post.update({
        where: { id },
        data: { 
          content,
          updatedAt: new Date()
        },
        include: {
          author: {
            select: { id: true, name: true, avatar: true, usertag: true }
          },
          // ПРАВИЛЬНО: images (согласно схеме)
          images: true,
          likes: {
            select: { userId: true }
          }
        }
      });

      // Если есть новые изображения, обновляем их
      if (imageUrls && imageUrls.length > 0) {
        // Удаляем старые изображения
        await tx.postImage.deleteMany({
          where: { postId: id }
        });

        // Добавляем новые изображения
        const postImages = imageUrls.map(url => ({
          url,
          postId: id
        }));

        await tx.postImage.createMany({
          data: postImages
        });

        // Получаем обновленные изображения
        updatedPost.images = await tx.postImage.findMany({
          where: { postId: id }
        });
      }

      return updatedPost;
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Ошибка обновления поста:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Удалить пост
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь является автором поста
    const existingPost = await prisma.post.findFirst({
      where: { 
        id,
        authorId: decoded.userId 
      }
    });

    if (!existingPost) {
      return NextResponse.json({ message: 'Пост не найден или нет прав' }, { status: 404 });
    }

    // Удаляем пост (каскадно удалятся изображения, лайки и комментарии)
    await prisma.post.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Пост удален' });

  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
