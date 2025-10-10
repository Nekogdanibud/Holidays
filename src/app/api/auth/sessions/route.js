// src/app/api/auth/sessions/route.js
import { NextResponse } from 'next/server';
import { getUserSessions, deleteSession, deleteAllUserSessions } from '../../../../lib/auth';
import { verifyAccessToken } from '../../../../lib/auth';

// Получить все активные сессии пользователя
export async function GET(request) {
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

    const sessions = await getUserSessions(decoded.userId);

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Ошибка получения сессий:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Удалить конкретную сессию
export async function DELETE(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const { sessionId } = await request.json();

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

    await deleteSession(sessionId);

    return NextResponse.json({ message: 'Сессия удалена' });

  } catch (error) {
    console.error('Ошибка удаления сессии:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
