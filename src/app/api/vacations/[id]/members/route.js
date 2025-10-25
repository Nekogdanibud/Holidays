// src/app/api/vacations/[id]/members/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    // Await params для Next.js 15
    const { id } = await params;
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверяем доступ к отпуску
    const vacationAccess = await prisma.vacation.findFirst({
      where: {
        id: id,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
        ]
      }
    });

    if (!vacationAccess) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const members = await prisma.vacationMember.findMany({
      where: { vacationId: id },
      include: {
        user: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            avatar: true 
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(members);

  } catch (error) {
    console.error('Ошибка получения участников:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
