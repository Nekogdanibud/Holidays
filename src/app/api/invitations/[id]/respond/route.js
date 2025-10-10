// src/app/api/invitations/[id]/respond/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { id: invitationId } = await params;
    const { accept } = await request.json();
    
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Получаем информацию о пользователе из базы
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }

    // Находим приглашение
    const invitation = await prisma.invitation.findFirst({
      where: {
        id: invitationId,
        email: user.email // Используем email из базы данных
      },
      include: {
        vacation: true,
        invitedBy: {
          select: { name: true }
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({ message: 'Приглашение не найдено' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ message: 'Приглашение уже обработано' }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ message: 'Приглашение истекло' }, { status: 400 });
    }

    if (accept) {
      // Принимаем приглашение
      await prisma.$transaction(async (tx) => {
        // Добавляем пользователя как участника
        await tx.vacationMember.create({
          data: {
            vacationId: invitation.vacationId,
            userId: user.id,
            role: 'member',
            status: 'accepted',
            joinedAt: new Date()
          }
        });

        // Обновляем статус приглашения
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: 'accepted' }
        });

        // Создаем уведомление для владельца
        await tx.notification.create({
          data: {
            userId: invitation.invitedById,
            type: 'info',
            title: 'Приглашение принято',
            message: `${user.name} принял(а) ваше приглашение в отпуск "${invitation.vacation.title}"`,
            data: {
              vacationId: invitation.vacationId,
              acceptedByName: user.name
            }
          }
        });

        // Обновляем уведомление приглашенного пользователя
        await tx.notification.updateMany({
          where: {
            userId: user.id,
            type: 'invitation',
            data: {
              path: ['invitationId'],
              equals: invitationId
            }
          },
          data: {
            data: {
              ...invitation.data,
              status: 'accepted'
            }
          }
        });
      });

      return NextResponse.json({ 
        message: 'Приглашение принято',
        vacationId: invitation.vacationId
      });
    } else {
      // Отклоняем приглашение
      await prisma.$transaction(async (tx) => {
        // Обновляем статус приглашения
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: 'rejected' }
        });

        // Создаем уведомление для владельца
        await tx.notification.create({
          data: {
            userId: invitation.invitedById,
            type: 'info',
            title: 'Приглашение отклонено',
            message: `${user.name} отклонил(а) ваше приглашение в отпуск "${invitation.vacation.title}"`,
            data: {
              vacationId: invitation.vacationId,
              rejectedByName: user.name
            }
          }
        });

        // Обновляем уведомление приглашенного пользователя
        await tx.notification.updateMany({
          where: {
            userId: user.id,
            type: 'invitation',
            data: {
              path: ['invitationId'],
              equals: invitationId
            }
          },
          data: {
            data: {
              ...invitation.data,
              status: 'rejected'
            }
          }
        });
      });

      return NextResponse.json({ message: 'Приглашение отклонено' });
    }

  } catch (error) {
    console.error('Ошибка обработки приглашения:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
