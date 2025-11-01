'use client';

import { useRef } from 'react';

export default function ActivityEditTab({ 
  activity, 
  editForm, 
  onEditChange, 
  onSave, 
  onCancel,
  isSaving,
  formErrors,
  bannerPreview,
  onRemoveBanner,
  hasChanges,
  fileInputRef
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Редактировать активность</h3>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm font-medium"
          disabled={isSaving}
        >
          Отменить
        </button>
      </div>

      <div className="space-y-6">
        {/* БАННЕР */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Баннер активности
          </label>
          <div className="space-y-4">
            {(activity.bannerImage || bannerPreview) && (
              <div className="relative">
                <img
                  src={bannerPreview || activity.bannerImage}
                  alt="Баннер активности"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={onRemoveBanner}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  title="Удалить баннер"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
            
            <input
              type="file"
              name="bannerImage"
              onChange={onEditChange}
              accept="image/*"
 Funktion
              ref={fileInputRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500">
              Рекомендуемый размер: 1200x400px. Форматы: JPG, PNG, WebP
            </p>
          </div>
        </div>

        {/* ГРИД С ПОЛЯМИ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название активности *
            </label>
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={onEditChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                formErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
            )}
          </div>

          {/* Тип */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип активности *
            </label>
            <select
              name="type"
              value={editForm.type}
              onChange={onEditChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="FLIGHT">Перелет</option>
              <option value="HOTEL">Отель</option>
              <option value="RESTAURANT">Ресторан</option>
              <option value="ATTRACTION">Достопримечательность</option>
              <option value="TRANSPORTATION">Транспорт</option>
              <option value="EVENT">Мероприятие</option>
              <option value="ACTIVITY">Активность</option>
              <option value="SHOPPING">Шоппинг</option>
              <option value="BEACH">Пляж</option>
              <option value="HIKING">Поход</option>
              <option value="MUSEUM">Музей</option>
              <option value="CONCERT">Концерт</option>
              <option value="SPORTS">Спорт</option>
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата *
            </label>
            <input
              type="date"
              name="date"
              value={editForm.date}
              onChange={onEditChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              name="status"
              value={editForm.status}
              onChange={onEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="PLANNED">Запланировано</option>
              <option value="CONFIRMED">Подтверждено</option>
              <option value="IN_PROGRESS">В процессе</option>
              <option value="COMPLETED">Завершено</option>
              <option value="CANCELLED">Отменено</option>
            </select>
          </div>

          {/* Время начала */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Время начала
            </label>
            <input
              type="time"
              name="startTime"
              value={editForm.startTime}
              onChange={onEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Время окончания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Время окончания
            </label>
            <input
              type="time"
              name="endTime"
              value={editForm.endTime}
              onChange={onEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Приоритет */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Приоритет
            </label>
            <select
              name="priority"
              value={editForm.priority}
              onChange={onEditChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
            </select>
          </div>

          {/* Стоимость */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Стоимость (₽)
            </label>
            <input
              type="number"
              name="cost"
              value={editForm.cost}
              onChange={onEditChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                formErrors.cost ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.cost && (
              <p className="mt-1 text-sm text-red-600">{formErrors.cost}</p>
            )}
          </div>
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            name="description"
            value={editForm.description}
            onChange={onEditChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Местоположение */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Местоположение
          </label>
          <input
            type="text"
            name="locationName"
            value={editForm.locationName}
            onChange={onEditChange}
            placeholder="Название места"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-2 ${
              formErrors.locationName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.locationName && (
            <p className="mt-1 text-sm text-red-600 mb-2">{formErrors.locationName}</p>
          )}
          <input
            type="text"
            name="locationAddress"
            value={editForm.locationAddress}
            onChange={onEditChange}
            placeholder="Адрес"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              formErrors.locationAddress ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.locationAddress && (
            <p className="mt-1 text-sm text-red-600">{formErrors.locationAddress}</p>
          )}
        </div>

        {/* Заметки */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Заметки
          </label>
          <textarea
            name="notes"
            value={editForm.notes}
            onChange={onEditChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* КНОПКИ */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                <span>Сохранение...</span>
              </>
            ) : (
              <span>Сохранить изменения</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
