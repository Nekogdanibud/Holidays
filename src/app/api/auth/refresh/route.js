// src/app/api/auth/refresh/route.js
import { NextResponse } from 'next/server';
import { verifySession, generateAccessToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token не найден' },
        { status: 401 }
      );
    }

    // Проверяем сессию
    const session = await verifySession(refreshToken);
    if (!session) {
      return NextResponse.json(
        { message: 'Недействительная сессия' },
        { status: 401 }
      );
    }

    // Генерируем новый access token
    const newAccessToken = generateAccessToken(session.userId, session.id);

    const response = NextResponse.json(
      { message: 'Token обновлен' },
      { status: 200 }
    );

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 час
    });

    return response;

  } catch (error) {
    console.error('Ошибка обновления токена:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
