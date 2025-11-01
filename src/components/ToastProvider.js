'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        margin: '12px',
        zIndex: 9999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: '14px',
          maxWidth: '500px',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'var(--font-geist-sans)',
        },
        success: {
          style: { background: '#10b981', color: 'white' },
        },
        error: {
          style: { background: '#ef4444', color: 'white' },
        },
        loading: {
          style: { background: '#6366f1', color: 'white' },
        },
      }}
    />
  );
}
