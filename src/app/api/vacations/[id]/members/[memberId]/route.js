// src/app/api/vacations/[id]/members/[memberId]/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const { id: vacationId, memberId } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    console.log('🔧 Удаление участника:', { vacationId, memberId, userId: decoded.userId });

    // Проверяем, что пользователь - владелец отпуска
    const vacation = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        userId: decoded.userId // Только владелец может удалять участников
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!vacation) {
      return NextResponse.json({ 
        message: 'Отпуск не найден или у вас нет прав для управления участниками' 
      }, { status: 404 });
    }

    // Находим участника для удаления
    const memberToDelete = vacation.members.find(m => m.id === memberId);
    if (!memberToDelete) {
      return NextResponse.json({ message: 'Участник не найден' }, { status: 404 });
    }

    // Нельзя удалить владельца
    if (memberToDelete.userId === decoded.userId) {
      return NextResponse.json({ 
        message: 'Нельзя удалить себя из отпуска. Используйте функцию удаления отпуска.' 
      }, { status: 400 });
    }

    // Удаляем участника
    await prisma.vacationMember.delete({
      where: { id: memberId }
    });

    console.log('✅ Участник удален:', memberToDelete.user.name);

    // Создаем уведомление для удаленного пользователя
    try {
      await prisma.notification.create({
        data: {
          userId: memberToDelete.userId,
          type: 'info',
          title: 'Удален из отпуска',
          message: `Вас удалили из отпуска "${vacation.title}"`,
          data: {
            vacationId: vacationId,
            vacationTitle: vacation.title,
            removedByName: decoded.name || 'Владелец отпуска'
          }
        }
      });
    } catch (notificationError) {
      console.warn('Не удалось создать уведомление:', notificationError);
    }

    return NextResponse.json({ 
      message: 'Участник успешно удален',
      removedUser: {
        id: memberToDelete.userId,
        name: memberToDelete.user.name
      }
    });

  } catch (error) {
    console.error('❌ Ошибка удаления участника:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Участник не найден' }, { status: 404 });
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Дополнительный метод для изменения роли участника
export async function PATCH(request, { params }) {
  try {
    const { id: vacationId, memberId } = await params;
    const { role } = await request.json();
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем, что пользователь - владелец отпуска
    const vacation = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        userId: decoded.userId
      }
    });

    if (!vacation) {
      return NextResponse.json({ 
        message: 'Отпуск не найден или у вас нет прав для управления участниками' 
      }, { status: 404 });
    }

    // Обновляем роль участника
    const updatedMember = await prisma.vacationMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Роль участника обновлена',
      member: updatedMember
    });

  } catch (error) {
    console.error('❌ Ошибка обновления роли участника:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Участник не найден' }, { status: 404 });
    }
    
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
