// src/app/api/auth/sessions/all/route.js
import { NextResponse } from 'next/server';
import { deleteAllUserSessions } from '../../../../../lib/auth';
import { verifyAccessToken } from '../../../../../lib/auth';

// Удалить все сессии пользователя (кроме текущей)
export async function DELETE(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Получаем все сессии пользователя
    const { getUserSessions, deleteSession } = await import('../../../../../lib/auth');
    const sessions = await getUserSessions(decoded.userId);

    // Удаляем все сессии кроме текущей
    for (const session of sessions) {
      if (session.id !== decoded.sessionId) {
        await deleteSession(session.id);
      }
    }

    return NextResponse.json({ message: 'Все другие сессии удалены' });

  } catch (error) {
    console.error('Ошибка удаления сессий:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
