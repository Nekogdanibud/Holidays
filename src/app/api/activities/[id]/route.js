// src/app/api/activities/[id]/route.js (ИСПРАВЛЕННАЯ ВЕРСИЯ)
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    console.log('🔍 Получение активности:', { activityId: id, userId: decoded.userId });

    // Получаем активность с фотографиями ТОЛЬКО этой активности
    const activity = await prisma.activity.findFirst({
      where: {
        id: id,
        vacation: {
          OR: [
            { userId: decoded.userId },
            { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
          ]
        }
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            description: true,
            latitude: true,
            longitude: true,
            type: true,
            priceLevel: true,
            rating: true,
            website: true,
            phone: true
          }
        },
        vacation: {
          select: {
            id: true,
            title: true,
            destination: true,
            startDate: true,
            endDate: true,
            userId: true,
            members: {
              where: { status: 'ACCEPTED' },
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                usertag: true
              }
            }
          }
        },
        // ВАЖНО: только фото с activityId = этой активности
        memories: {
          where: {
            activityId: id  // ТОЛЬКО фото этой активности
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                usertag: true
              }
            }
          },
          orderBy: { takenAt: 'asc' }
        }
      }
    });

    if (!activity) {
      console.log('❌ Активность не найдена или нет доступа');
      return NextResponse.json({ message: 'Активность не найдена' }, { status: 404 });
    }

    console.log('✅ Активность загружена:', {
      title: activity.title,
      activityPhotosCount: activity.memories?.length || 0,
      activityPhotos: activity.memories?.map(m => ({
        id: m.id,
        activityId: m.activityId,
        title: m.title
      }))
    });

    // Формируем ответ с правильной структурой
    const response = {
      ...activity,
      goingCount: activity.participants?.filter(p => p.status === 'GOING').length || 0,
      goingParticipants: activity.participants?.filter(p => p.status === 'GOING') || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Ошибка получения активности:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

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

    const formData = await request.formData();
    
    const title = formData.get('title');
    const description = formData.get('description');
    const date = formData.get('date');
    const type = formData.get('type');
    const status = formData.get('status');
    const priority = formData.get('priority');
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const cost = formData.get('cost');
    const notes = formData.get('notes');
    const locationName = formData.get('locationName');
    const locationAddress = formData.get('locationAddress');
    const bannerImage = formData.get('bannerImage');

    console.log('📝 Получены данные для обновления:', {
      title, description, date, type, status, priority,
      startTime, endTime, cost, notes,
      locationName, locationAddress,
      hasBanner: !!bannerImage
    });

    // Проверяем права на редактирование
    const activity = await prisma.activity.findFirst({
      where: {
        id: id,
        vacation: {
          OR: [
            { userId: decoded.userId },
            { members: { some: { userId: decoded.userId, role: 'CO_ORGANIZER' } } }
          ]
        }
      },
      include: {
        location: true
      }
    });

    if (!activity) {
      return NextResponse.json({ message: 'Активность не найдена или нет прав' }, { status: 404 });
    }

    // Используем транзакцию для атомарного обновления
    const result = await prisma.$transaction(async (tx) => {
      let locationId = activity.locationId;

      // Обработка локации
      if (locationName && locationName.trim()) {
        if (activity.locationId) {
          // Обновляем существующую локацию
          await tx.location.update({
            where: { id: activity.locationId },
            data: {
              name: locationName.trim(),
              address: locationAddress?.trim() || null,
              type: type || 'OTHER'
            }
          });
        } else {
          // Создаем новую локацию
          const newLocation = await tx.location.create({
            data: {
              name: locationName.trim(),
              address: locationAddress?.trim() || null,
              type: type || 'OTHER',
              vacationId: activity.vacationId
            }
          });
          locationId = newLocation.id;
        }
      } else if (activity.locationId) {
        // Удаляем связь с локацией если название очищено
        locationId = null;
      }

      // Подготовка данных для обновления активности
      const updateData = {
        title: title?.trim(),
        description: description?.trim() || null,
        date: date ? new Date(date) : undefined,
        type,
        status,
        priority,
        startTime: startTime || null,
        endTime: endTime || null,
        cost: cost ? parseFloat(cost) : null,
        notes: notes?.trim() || null,
        locationId: locationId
      };

      // Обработка баннера
      if (bannerImage && bannerImage instanceof File && bannerImage.size > 0) {
        // Создаем директорию для баннера конкретной активности
        const activityBannerDir = join(process.cwd(), 'public', 'uploads', 'activity-banners', id);
        await mkdir(activityBannerDir, { recursive: true });

        // Генерируем имя файла
        const fileExtension = bannerImage.name.split('.').pop() || 'jpg';
        const filename = `banner.${fileExtension}`;
        const filepath = join(activityBannerDir, filename);
        const bannerUrl = `/uploads/activity-banners/${id}/${filename}`;

        console.log('💾 Сохранение баннера активности:', {
          activityId: id,
          filename,
          filepath,
          bannerUrl,
          size: bannerImage.size
        });

        // Сохраняем файл
        const bytes = await bannerImage.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Удаляем старый баннер если он существует
        if (activity.bannerImage) {
          try {
            const oldBannerPath = join(process.cwd(), 'public', activity.bannerImage);
            await unlink(oldBannerPath);
            console.log('🗑️ Удален старый баннер:', activity.bannerImage);
          } catch (error) {
            console.warn('⚠️ Не удалось удалить старый баннер:', error);
          }
        }

        updateData.bannerImage = bannerUrl;
      } else if (bannerImage === 'remove') {
        // Удаляем баннер если передано 'remove'
        if (activity.bannerImage) {
          try {
            const oldBannerPath = join(process.cwd(), 'public', activity.bannerImage);
            await unlink(oldBannerPath);
            console.log('🗑️ Баннер удален по запросу:', activity.bannerImage);
          } catch (error) {
            console.warn('⚠️ Не удалось удалить баннер:', error);
          }
        }
        updateData.bannerImage = null;
      }

      console.log('📝 Финальные данные для обновления:', updateData);

      // Обновляем активность
      const updatedActivity = await tx.activity.update({
        where: { id: id },
        data: updateData,
        include: {
          location: {
            select: { id: true, name: true, address: true }
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          },
          vacation: {
            select: { id: true, title: true }
          }
        }
      });

      return updatedActivity;
    });

    console.log('✅ Активность обновлена:', {
      title: result.title,
      hasBanner: !!result.bannerImage,
      location: result.location
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Ошибка обновления активности:', error);
    
    // Более детальная обработка ошибок
    if (error.code === 'P2009') {
      console.error('❌ Ошибка валидации Prisma:', error);
      return NextResponse.json(
        { message: 'Ошибка структуры данных. Пожалуйста, перегенерируйте Prisma Client.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Активность не найдена' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
