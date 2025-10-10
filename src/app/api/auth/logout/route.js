// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';
import { deleteSession } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;

    if (accessToken) {
      const { verifyAccessToken } = await import('../../../../lib/auth');
      const decoded = verifyAccessToken(accessToken);
      
      if (decoded?.sessionId) {
        await deleteSession(decoded.sessionId);
      }
    }

    const response = NextResponse.json(
      { message: 'Выход выполнен успешно' },
      { status: 200 }
    );

    // Очищаем куки
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;

  } catch (error) {
    console.error('Ошибка выхода:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
