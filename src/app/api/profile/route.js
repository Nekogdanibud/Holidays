// src/app/api/profile/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { getUserGroup, getLevelProgress } from '../../../lib/userLevels';
import { writeFile, mkdir, unlink, rename } from 'fs/promises';
import { join } from 'path';

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

    const { name, usertag, bio, location, website, profileVisibility, avatar, banner } = await request.json();

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

    // Получаем текущий профиль для проверки старых изображений
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { avatar: true, banner: true }
    });

    // Обрабатываем перемещение временных изображений
    const updateData = { name, usertag, bio, location, website, profileVisibility };
    
    if (avatar && avatar.startsWith('/uploads/temp/')) {
      const filename = avatar.split('/').pop();
      const tempPath = join(process.cwd(), 'public', avatar);
      const finalPath = join(process.cwd(), 'public', 'uploads', 'avatars', filename);
      await mkdir(join(process.cwd(), 'public', 'uploads', 'avatars'), { recursive: true });
      
      // Перемещаем файл
      try {
        await rename(tempPath, finalPath);
        updateData.avatar = `/uploads/avatars/${filename}`;
        
        // Удаляем старый аватар, если он существует
        if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
          const oldAvatarPath = join(process.cwd(), 'public', currentUser.avatar);
          try {
            await unlink(oldAvatarPath);
            console.log(`Deleted old avatar: ${oldAvatarPath}`);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              console.error(`Error deleting old avatar ${oldAvatarPath}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error moving avatar ${tempPath}:`, error);
        return NextResponse.json(
          { message: 'Ошибка при обработке аватара' },
          { status: 500 }
        );
      }
    }

    if (banner && banner.startsWith('/uploads/temp/')) {
      const filename = banner.split('/').pop();
      const tempPath = join(process.cwd(), 'public', banner);
      const finalPath = join(process.cwd(), 'public', 'uploads', 'banners', filename);
      await mkdir(join(process.cwd(), 'public', 'uploads', 'banners'), { recursive: true });
      
      // Перемещаем файл
      try {
        await rename(tempPath, finalPath);
        updateData.banner = `/uploads/banners/${filename}`;
        
        // Удаляем старый баннер, если он существует
        if (currentUser.banner && currentUser.banner.startsWith('/uploads/banners/')) {
          const oldBannerPath = join(process.cwd(), 'public', currentUser.banner);
          try {
            await unlink(oldBannerPath);
            console.log(`Deleted old banner: ${oldBannerPath}`);
          } catch (error) {
            if (error.code !== 'ENOENT') {
              console.error(`Error deleting old banner ${oldBannerPath}:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`Error moving banner ${tempPath}:`, error);
        return NextResponse.json(
          { message: 'Ошибка при обработке баннера' },
          { status: 500 }
        );
      }
    }

    // Обновляем профиль
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
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
