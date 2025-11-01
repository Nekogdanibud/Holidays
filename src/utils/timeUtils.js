// Утилиты для работы с временем и часовыми поясами
export class TimeZoneUtils {
  // Получаем локальное время пользователя
  static getUserLocalTime() {
    return new Date();
  }

  // Конвертируем UTC дату в локальное время пользователя
  static convertToLocalTime(utcDateString) {
    if (!utcDateString) return null;
    
    const utcDate = new Date(utcDateString);
    
    // Создаем дату в локальном времени пользователя
    const localDate = new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000);
    
    return localDate;
  }

  // Получаем разницу во времени между UTC и локальным временем (в минутах)
  static getTimezoneOffset() {
    return new Date().getTimezoneOffset();
  }

  // Форматируем дату для отображения с учетом локального времени
  static formatLocalDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = this.convertToLocalTime(dateString);
    const defaultOptions = {
      day: 'numeric',
      month: 'long', 
      year: 'numeric'
    };
    
    return date.toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
  }

  // Получаем информацию о часовом поясе пользователя
  static getUserTimezoneInfo() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -this.getTimezoneOffset() / 60;
    const offsetString = `UTC${offset >= 0 ? '+' : ''}${offset}`;
    
    return {
      timezone,
      offset,
      offsetString,
      location: this.getTimezoneLocation(timezone)
    };
  }

  // Определяем город/регион по часовому поясу
  static getTimezoneLocation(timezone) {
    const locations = {
      'Europe/Moscow': 'Москва',
      'Europe/London': 'Лондон',
      'Europe/Berlin': 'Берлин',
      'Europe/Paris': 'Париж',
      'America/New_York': 'Нью-Йорк',
      'Asia/Tokyo': 'Токио',
      'Asia/Shanghai': 'Шанхай'
    };
    
    return locations[timezone] || timezone;
  }
}

// Утилиты для расчета времени
export class TimeCalculationUtils {
  // Рассчитываем оставшееся время до даты
  static calculateTimeLeft(targetDate, referenceDate = new Date()) {
    const target = new Date(targetDate);
    const now = referenceDate;
    
    const diff = target - now;
    
    if (diff <= 0) {
      return {
        status: 'past',
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0
      };
    }
    
    return {
      status: now < target ? 'upcoming' : 'past',
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      totalMs: diff
    };
  }

  // Определяем статус отпуска
  static getVacationStatus(startDate, endDate, referenceDate = new Date()) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = referenceDate;
    
    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'current';
    } else {
      return 'past';
    }
  }
}
