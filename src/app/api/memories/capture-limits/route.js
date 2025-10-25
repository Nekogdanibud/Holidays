// src/app/api/memories/capture-limits/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vacationId = searchParams.get('vacationId');
    
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });

    if (!vacationId) {
      return NextResponse.json({ message: 'Vacation ID обязателен' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Получаем сегодняшние активности
    const todayActivities = await prisma.activity.findMany({
      where: {
        vacationId,
        date: { gte: today, lt: tomorrow }
      },
      select: { id: true, title: true }
    });

    // Считаем лимиты для каждого типа
    const dailyMemoriesCount = await prisma.memory.count({
      where: {
        vacationId,
        authorId: decoded.userId,
        captureType: 'DAILY_MOMENT',
        takenAt: { gte: today, lt: tomorrow }
      }
    });

    const activityLimits = await Promise.all(
      todayActivities.map(async (activity) => {
        const count = await prisma.memory.count({
          where: {
            vacationId,
            authorId: decoded.userId,
            activityId: activity.id,
            captureType: 'ACTIVITY_MOMENT',
            takenAt: { gte: today, lt: tomorrow }
          }
        });
        
        return {
          activityId: activity.id,
          title: activity.title,
          used: count,
          total: 3,
          remaining: Math.max(0, 3 - count)
        };
      })
    );

    const limits = {
      daily: {
        used: dailyMemoriesCount,
        total: 3,
        remaining: Math.max(0, 3 - dailyMemoriesCount)
      },
      activities: activityLimits
    };

    return NextResponse.json(limits);

  } catch (error) {
    console.error('Ошибка получения лимитов:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
