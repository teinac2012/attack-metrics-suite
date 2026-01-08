import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones de producción
  compress: true, // Habilitar compresión Gzip/Brotli
  // Note: swcMinify está habilitado por defecto en Next.js 16+
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Optimización de headers
  async headers() {
    return [
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;