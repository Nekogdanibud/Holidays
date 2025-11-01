// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';
import LayoutWrapper from '../components/LayoutWrapper';
import ToastProvider from '../components/ToastProvider'; // Импорт

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Breezeway - Бесплатная платформа для планирования отпусков",
  description: "Планируйте отпуска вместе с друзьями бесплатно.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <ToastProvider /> {/* Клиентский компонент — здесь */}
        </AuthProvider>
      </body>
    </html>
  );
}
