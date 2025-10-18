// prisma/seed.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создаем уровни/группы пользователей
  const groups = await prisma.group.createMany({
    data: [
      {
        name: "Новичок",
        description: "Только начал путешествовать",
        level: 1,
        minPoints: 0,
        maxPoints: 99,
        color: "text-gray-800",
        bgColor: "bg-gray-100",
        icon: "👋",
        badgeText: "Новичок",
        isExclusive: false
      },
      {
        name: "Путешественник",
        description: "Активный участник сообщества",
        level: 2,
        minPoints: 100,
        maxPoints: 499,
        color: "text-blue-800",
        bgColor: "bg-blue-100",
        icon: "✈️",
        badgeText: "Путешественник",
        isExclusive: false
      },
      {
        name: "Опытный путешественник",
        description: "Много путешествует и делится опытом",
        level: 3,
        minPoints: 500,
        maxPoints: 999,
        color: "text-purple-800",
        bgColor: "bg-purple-100",
        icon: "🚀",
        badgeText: "Опытный",
        isExclusive: false
      },
      {
        name: "Эксперт по путешествиям",
        description: "Настоящий эксперт в путешествиях",
        level: 4,
        minPoints: 1000,
        maxPoints: null,
        color: "text-yellow-800",
        bgColor: "bg-yellow-100",
        icon: "🏆",
        badgeText: "Эксперт",
        isExclusive: false
      },
      {
        name: "Легенда путешествий",
        description: "Эксклюзивная группа для самых активных путешественников",
        level: 5,
        minPoints: 5000,
        maxPoints: null,
        color: "text-white",
        bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: "👑",
        badgeText: "Легенда",
        isExclusive: true
      }
    ],
    skipDuplicates: true
  });

  console.log('✅ Группы созданы');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
