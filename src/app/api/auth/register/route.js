// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { hashPassword, createSession } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const { name, email, password, rememberMe = false } = await request.json();

    // Валидация
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await hashPassword(password);

    // Создание пользователя
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Получаем информацию о клиенте
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip;

    // Создаем сессию с учетом rememberMe
    const { accessToken, refreshToken, sessionId } = await createSession(
      newUser.id, 
      userAgent, 
      ipAddress,
      rememberMe
    );

    const response = NextResponse.json(
      { 
        message: 'Пользователь успешно зарегистрирован',
        user: newUser
      },
      { status: 201 }
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
    console.error('Ошибка регистрации:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
