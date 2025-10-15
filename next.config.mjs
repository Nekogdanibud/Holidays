// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Внешние пакеты для серверных компонентов
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  
  // Настройки изображений
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Для загрузки файлов
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  
  // Включить source maps для разработки
  productionBrowserSourceMaps: false,
  
  // Компилятор для уменьшения размера бандла
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
