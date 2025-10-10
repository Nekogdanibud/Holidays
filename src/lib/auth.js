// src/lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Убедимся, что секреты есть
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-for-development-only';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-fallback-refresh-secret-key-for-development-only';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Увеличиваем время жизни access token до 1 часа
export function generateAccessToken(userId, sessionId) {
  return jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: '1h' });
}

// Увеличиваем время жизни refresh token до 30 дней
export function generateRefreshToken() {
  return jwt.sign({}, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
}

// Создание новой сессии с поддержкой "Запомнить меня"
export async function createSession(userId, userAgent, ipAddress, isPersistent = false) {
  try {
    const refreshToken = generateRefreshToken();
    
    // Если "Запомнить меня" - сессия на 1 год, иначе на 30 дней
    const expiresAt = isPersistent 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 год
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

    const session = await prisma.session.create({
      data: {
        userId,
        refreshToken,
        userAgent: userAgent || 'Unknown',
        ipAddress: ipAddress || 'Unknown',
        expiresAt,
        isPersistent
      }
    });

    return {
      sessionId: session.id,
      refreshToken,
      accessToken: generateAccessToken(userId, session.id)
    };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Проверка сессии с поддержкой persistent сессий
export async function verifySession(refreshToken) {
  try {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true }
    });

    if (!session) {
      return null;
    }

    // Для persistent сессий автоматически продлеваем срок
    if (session.isPersistent) {
      const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      if (session.expiresAt < oneYearFromNow) {
        // Автоматически продлеваем persistent сессию
        await prisma.session.update({
          where: { id: session.id },
          data: { expiresAt: oneYearFromNow }
        });
      }
    }

    // Проверяем не истекла ли сессия
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Удаление сессии
export async function deleteSession(sessionId) {
  try {
    await prisma.session.delete({ where: { id: sessionId } });
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// Удаление всех сессий пользователя
export async function deleteAllUserSessions(userId) {
  try {
    await prisma.session.deleteMany({ where: { userId } });
  } catch (error) {
    console.error('Error deleting user sessions:', error);
  }
}

// Получение всех активных сессий пользователя
export async function getUserSessions(userId) {
  try {
    return await prisma.session.findMany({
      where: { 
        userId,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
}
