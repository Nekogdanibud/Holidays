// src/app/api/auth/me/route.js
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    console.log('🔍 Checking auth...');
    
    const accessToken = request.cookies.get('accessToken')?.value;
    console.log('Access token exists:', !!accessToken);

    if (!accessToken) {
      console.log('❌ No access token');
      return NextResponse.json(
        { message: 'Не авторизован' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(accessToken);
    console.log('Decoded token:', decoded);

    if (!decoded) {
      console.log('❌ Invalid token');
      return NextResponse.json(
        { message: 'Недействительный токен' },
        { status: 401 }
      );
    }

    // Получаем пользователя из базы
    console.log('👤 Fetching user:', decoded.userId);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    });

    console.log('User found:', !!user);

    if (!user) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
