// src/app/api/vacations/[id]/gallery/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id: vacationId } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';
    
    console.log('🔄 Запрос галереи:', { vacationId, view });

    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      console.log('❌ Нет access token');
      return NextResponse.json({ message: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      console.log('❌ Невалидный токен');
      return NextResponse.json({ message: 'Недействительный токен' }, { status: 401 });
    }

    // Проверка доступа к отпуску
    const vacationAccess = await prisma.vacation.findFirst({
      where: {
        id: vacationId,
        OR: [
          { userId: decoded.userId },
          { members: { some: { userId: decoded.userId, status: 'ACCEPTED' } } }
        ]
      }
    });

    if (!vacationAccess) {
      console.log('❌ Доступ запрещен для vacation:', vacationId);
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 });
    }

    // Безопасный запрос memories
    let where = { vacationId };

    if (view === 'capture') {
      where.captureType = { in: ['DAILY_MOMENT', 'ACTIVITY_MOMENT'] };
    } else if (view === 'activities') {
      where.activityId = { not: null };
      where.captureType = null;
    }

    console.log('📊 Условия запроса:', where);

    const memories = await prisma.memory.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true, usertag: true }
        },
        activity: {
          select: { id: true, title: true }
        },
        location: {
          select: { id: true, name: true }
        }
      },
      orderBy: { takenAt: 'desc' }
    });

    console.log('✅ Найдено воспоминаний:', memories.length);

    // Безопасная группировка с валидацией
    let groupedMemories = {};

    try {
      if (view === 'all') {
        const byDay = {};
        memories.forEach(memory => {
          if (!memory || !memory.takenAt) return;
          
          try {
            const dateKey = memory.takenAt.toISOString().split('T')[0];
            if (!byDay[dateKey]) {
              byDay[dateKey] = [];
            }
            byDay[dateKey].push(memory);
          } catch (dateError) {
            console.warn('⚠️ Ошибка обработки даты:', memory.takenAt);
          }
        });
        groupedMemories.byDay = byDay;
      } else if (view === 'activities') {
        const byActivity = {};
        memories.forEach(memory => {
          if (!memory) return;
          
          const activityKey = memory.activityId || 'no-activity';
          if (!byActivity[activityKey]) {
            byActivity[activityKey] = {
              title: memory.activity?.title || 'Без активности',
              memories: []
            };
          }
          byActivity[activityKey].memories.push(memory);
        });
        groupedMemories.byActivity = byActivity;
      } else {
        groupedMemories.memories = memories;
      }
    } catch (groupingError) {
      console.error('❌ Ошибка группировки:', groupingError);
      // Возвращаем пустые данные вместо ошибки
      groupedMemories = view === 'all' ? { byDay: {} } : 
                       view === 'activities' ? { byActivity: {} } : 
                       { memories: [] };
    }

    const response = {
      view,
      memories: groupedMemories,
      total: memories.length
    };

    console.log('📦 Ответ галереи:', { 
      view, 
      total: memories.length,
      groupedKeys: Object.keys(groupedMemories)
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Критическая ошибка загрузки галереи:', error);
    
    // Возвращаем безопасный ответ вместо ошибки
    return NextResponse.json({
      view: new URL(request.url).searchParams.get('view') || 'all',
      memories: { byDay: {}, byActivity: {}, memories: [] },
      total: 0,
      error: 'Временная ошибка загрузки'
    }, { status: 200 }); // Возвращаем 200 чтобы фронтенд не падал
  }
}
