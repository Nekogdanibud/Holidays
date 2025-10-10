// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { verifyPassword, createSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { email, password, rememberMe = false } = await request.json();

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Получаем информацию о клиенте
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;

    // Создаем сессию с учетом rememberMe
    const { accessToken, refreshToken, sessionId } = await createSession(
      user.id, 
      userAgent, 
      ipAddress,
      rememberMe
    );

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    const response = NextResponse.json(
      { 
        message: 'Вход выполнен успешно',
        user: userData
      },
      { status: 200 }
    );

    // Устанавливаем httpOnly куки с разным временем жизни
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 час
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe 
        ? 365 * 24 * 60 * 60 * 1000 // 1 год для "Запомнить меня"
        : 30 * 24 * 60 * 60 * 1000 // 30 дней для обычной сессии
    });

    return response;

  } catch (error) {
    console.error('Ошибка входа:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
