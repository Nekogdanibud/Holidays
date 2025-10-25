// src/lib/activityValidators.js

// ENUM значения из Prisma схемы
export const ACTIVITY_TYPES = {
  FLIGHT: 'FLIGHT',
  HOTEL: 'HOTEL', 
  RESTAURANT: 'RESTAURANT',
  ATTRACTION: 'ATTRACTION',
  TRANSPORTATION: 'TRANSPORTATION',
  EVENT: 'EVENT',
  ACTIVITY: 'ACTIVITY',
  SHOPPING: 'SHOPPING',
  BEACH: 'BEACH',
  HIKING: 'HIKING',
  MUSEUM: 'MUSEUM',
  CONCERT: 'CONCERT',
  SPORTS: 'SPORTS'
};

export const ACTIVITY_STATUSES = {
  PLANNED: 'PLANNED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const ACTIVITY_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export const PARTICIPANT_STATUSES = {
  GOING: 'GOING',
  MAYBE: 'MAYBE',
  NOT_GOING: 'NOT_GOING'
};

export const MEMBER_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED', 
  REJECTED: 'REJECTED'
};

export const MEMBER_ROLES = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  CO_ORGANIZER: 'CO_ORGANIZER'
};

// Функции валидации
export const isValidActivityType = (type) => 
  Object.values(ACTIVITY_TYPES).includes(type);

export const isValidActivityStatus = (status) =>
  Object.values(ACTIVITY_STATUSES).includes(status);

export const isValidActivityPriority = (priority) =>
  Object.values(ACTIVITY_PRIORITIES).includes(priority);

export const isValidParticipantStatus = (status) =>
  Object.values(PARTICIPANT_STATUSES).includes(status);

export const isValidMemberStatus = (status) =>
  Object.values(MEMBER_STATUSES).includes(status);

export const isValidMemberRole = (role) =>
  Object.values(MEMBER_ROLES).includes(role);

// Функции нормализации (для приведения к верхнему регистру)
export const normalizeActivityType = (type) => {
  const upperType = type?.toUpperCase();
  return isValidActivityType(upperType) ? upperType : ACTIVITY_TYPES.ACTIVITY;
};

export const normalizeActivityStatus = (status) => {
  const upperStatus = status?.toUpperCase();
  return isValidActivityStatus(upperStatus) ? upperStatus : ACTIVITY_STATUSES.PLANNED;
};

export const normalizeActivityPriority = (priority) => {
  const upperPriority = priority?.toUpperCase();
  return isValidActivityPriority(upperPriority) ? upperPriority : ACTIVITY_PRIORITIES.MEDIUM;
};

export const normalizeParticipantStatus = (status) => {
  const upperStatus = status?.toUpperCase();
  return isValidParticipantStatus(upperStatus) ? upperStatus : PARTICIPANT_STATUSES.GOING;
};

// Вспомогательные функции для UI
export const getActivityTypeLabel = (type) => {
  const labels = {
    [ACTIVITY_TYPES.FLIGHT]: '✈️ Перелет',
    [ACTIVITY_TYPES.HOTEL]: '🏨 Отель',
    [ACTIVITY_TYPES.RESTAURANT]: '🍽️ Ресторан',
    [ACTIVITY_TYPES.ATTRACTION]: '🏛️ Достопримечательность',
    [ACTIVITY_TYPES.TRANSPORTATION]: '🚗 Транспорт',
    [ACTIVITY_TYPES.EVENT]: '🎪 Мероприятие',
    [ACTIVITY_TYPES.ACTIVITY]: '🎯 Активность',
    [ACTIVITY_TYPES.SHOPPING]: '🛍️ Шоппинг',
    [ACTIVITY_TYPES.BEACH]: '🏖️ Пляж',
    [ACTIVITY_TYPES.HIKING]: '🥾 Поход',
    [ACTIVITY_TYPES.MUSEUM]: '🏛️ Музей',
    [ACTIVITY_TYPES.CONCERT]: '🎵 Концерт',
    [ACTIVITY_TYPES.SPORTS]: '⚽ Спорт'
  };
  return labels[type] || '🎯 Активность';
};

export const getStatusColor = (status) => {
  const colors = {
    [ACTIVITY_STATUSES.PLANNED]: 'bg-blue-100 text-blue-800',
    [ACTIVITY_STATUSES.CONFIRMED]: 'bg-green-100 text-green-800',
    [ACTIVITY_STATUSES.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
    [ACTIVITY_STATUSES.COMPLETED]: 'bg-gray-100 text-gray-800',
    [ACTIVITY_STATUSES.CANCELLED]: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) => {
  const colors = {
    [ACTIVITY_PRIORITIES.LOW]: 'bg-green-100 text-green-800',
    [ACTIVITY_PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [ACTIVITY_PRIORITIES.HIGH]: 'bg-red-100 text-red-800'
  };
  return colors[priority] || 'bg-gray-100 text-gray-800';
};
