import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  return user?.role === 'ADMIN';
}

export async function GET(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !(await isAdmin(decoded.userId))) {
      return NextResponse.json({ message: 'Доступ запрещен' }, { status: 403 });
    }

    const [totalUsers, totalVacations, activeVacations, totalGroups] = await Promise.all([
      prisma.user.count(),
      prisma.vacation.count(),
      prisma.vacation.count({
        where: {
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      }),
      prisma.group.count()
    ]);

    return NextResponse.json({
      totalUsers,
      totalVacations,
      activeVacations,
      totalGroups
    });

  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
