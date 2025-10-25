// src/components/vacation/MemoryUploadModal.js
'use client';

import PhotoUpload from './PhotoUpload.js';

export default function MemoryUploadModal({ vacationId, onClose, onUpload }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Загрузить воспоминание</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <PhotoUpload
          vacationId={vacationId}
          onUpload={(memories) => {
            onUpload(memories);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
