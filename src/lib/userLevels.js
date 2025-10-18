// src/lib/userLevels.js
import { prisma } from './prisma';

// Получить текущую группу пользователя (с приоритетом для эксклюзивных групп)
export async function getUserGroup(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      experiencePoints: true,
      userGroups: {
        include: {
          group: true
        },
        orderBy: [
          {
            group: {
              isExclusive: 'desc' // Сначала эксклюзивные группы
            }
          },
          {
            group: {
              level: 'desc' // Затем по уровню
            }
          }
        ]
      }
    }
  });

  if (!user) return null;

  // Если у пользователя есть эксклюзивные группы, возвращаем самую высокую
  const exclusiveGroup = user.userGroups.find(ug => ug.group.isExclusive);
  if (exclusiveGroup) {
    return exclusiveGroup.group;
  }

  // Иначе ищем группу по очкам опыта
  const pointsGroup = await prisma.group.findFirst({
    where: {
      isExclusive: false, // Только не эксклюзивные группы
      minPoints: { lte: user.experiencePoints },
      OR: [
        { maxPoints: { gte: user.experiencePoints } },
        { maxPoints: null }
      ]
    },
    orderBy: { level: 'desc' }
  });

  return pointsGroup;
}

// Добавить пользователя в эксклюзивную группу (для админа)
export async function addUserToExclusiveGroup(userId, groupId) {
  try {
    // Проверяем, что группа эксклюзивная
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group || !group.isExclusive) {
      throw new Error('Группа не является эксклюзивной');
    }

    // Удаляем все существующие эксклюзивные группы пользователя
    await prisma.userGroup.deleteMany({
      where: {
        userId: userId,
        group: {
          isExclusive: true
        }
      }
    });

    // Добавляем пользователя в новую эксклюзивную группу
    const userGroup = await prisma.userGroup.create({
      data: {
        userId: userId,
        groupId: groupId
      },
      include: {
        group: true
      }
    });

    // Создаем уведомление
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'level_up',
        title: 'Эксклюзивная группа!',
        message: `Поздравляем! Вы получили доступ к эксклюзивной группе "${group.name}"`,
        data: {
          groupId: group.id,
          groupName: group.name,
          level: group.level,
          isExclusive: true
        }
      }
    });

    return userGroup;
  } catch (error) {
    console.error('Ошибка добавления в эксклюзивную группу:', error);
    throw error;
  }
}

// Удалить пользователя из эксклюзивной группы (для админа)
export async function removeUserFromExclusiveGroup(userId) {
  try {
    const result = await prisma.userGroup.deleteMany({
      where: {
        userId: userId,
        group: {
          isExclusive: true
        }
      }
    });

    // Создаем уведомление
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'info',
        title: 'Изменение группы',
        message: 'Вы больше не состоите в эксклюзивной группе',
        data: {
          action: 'exclusive_group_removed'
        }
      }
    });

    return result;
  } catch (error) {
    console.error('Ошибка удаления из эксклюзивной группы:', error);
    throw error;
  }
}

// Получить все эксклюзивные группы
export async function getExclusiveGroups() {
  return await prisma.group.findMany({
    where: {
      isExclusive: true
    },
    orderBy: {
      level: 'desc'
    }
  });
}

// Получить обычные группы (по баллам)
export async function getRegularGroups() {
  return await prisma.group.findMany({
    where: {
      isExclusive: false
    },
    orderBy: {
      level: 'asc'
    }
  });
}

// Добавить очки опыта пользователю (только для обычных групп)
export async function addExperiencePoints(userId, points) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      experiencePoints: { increment: points }
    },
    include: {
      userGroups: {
        include: {
          group: true
        }
      }
    }
  });

  // Проверяем, есть ли у пользователя эксклюзивная группа
  const hasExclusiveGroup = user.userGroups.some(ug => ug.group.isExclusive);
  
  // Если у пользователя нет эксклюзивной группы, обновляем обычную группу по баллам
  if (!hasExclusiveGroup) {
    const newGroup = await getUserGroup(userId);
    const currentGroup = user.userGroups.find(ug => !ug.group.isExclusive)?.group;

    if (newGroup && (!currentGroup || currentGroup.id !== newGroup.id)) {
      // Удаляем все обычные группы
      await prisma.userGroup.deleteMany({
        where: {
          userId: userId,
          group: {
            isExclusive: false
          }
        }
      });

      // Добавляем пользователя в новую группу
      await prisma.userGroup.create({
        data: {
          userId: userId,
          groupId: newGroup.id
        }
      });

      // Создаем уведомление о новом уровне
      await prisma.notification.create({
        data: {
          userId: userId,
          type: 'level_up',
          title: 'Новый уровень!',
          message: `Поздравляем! Вы достигли уровня "${newGroup.name}"`,
          data: {
            groupId: newGroup.id,
            groupName: newGroup.name,
            level: newGroup.level,
            isExclusive: false
          }
        }
      });
    }
  }

  return user;
}

// Получить прогресс до следующего уровня (только для обычных групп)
export async function getLevelProgress(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true }
  });

  if (!user) return null;

  const currentGroup = await getUserGroup(userId);
  
  // Если текущая группа эксклюзивная, не показываем прогресс
  if (currentGroup?.isExclusive) {
    return {
      currentGroup,
      progress: 100,
      pointsToNext: 0,
      nextGroup: null,
      isExclusive: true
    };
  }

  const nextGroup = await prisma.group.findFirst({
    where: {
      isExclusive: false,
      level: { gt: currentGroup?.level || 0 }
    },
    orderBy: { level: 'asc' }
  });

  if (!nextGroup) {
    // Пользователь на максимальном уровне
    return {
      currentGroup,
      progress: 100,
      pointsToNext: 0,
      nextGroup: null,
      isExclusive: false
    };
  }

  const pointsInCurrentLevel = user.experiencePoints - (currentGroup?.minPoints || 0);
  const totalPointsInLevel = nextGroup.minPoints - (currentGroup?.minPoints || 0);
  const progress = Math.min(100, Math.round((pointsInCurrentLevel / totalPointsInLevel) * 100));

  return {
    currentGroup,
    progress,
    pointsToNext: nextGroup.minPoints - user.experiencePoints,
    nextGroup,
    isExclusive: false
  };
}
