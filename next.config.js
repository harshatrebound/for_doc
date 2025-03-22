/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Disable image optimization in development for faster builds
  images: {
    domains: ['localhost', 'yamabiko.proxy.rlwy.net', 'images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
        hostname: process.env.NODE_ENV === 'development' ? 'localhost' : 'bookingdoc-production.up.railway.app',
        port: process.env.NODE_ENV === 'development' ? '3000' : '',
        pathname: '/doctors/**',
      }
    ],
  },

  // Increase build memory limit for production builds
  experimental: {
    memoryBasedWorkersCount: true,
    workerThreads: true,
    optimizeCss: true,
  },

  // Set higher memory limit for builds
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Enable source maps in development only
  productionBrowserSourceMaps: false,

  async headers() {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
      {
        source: '/widget',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
      {
        source: '/embed.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(','),
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },

  // Optimize production builds
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Handle the .next directory permissions
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      Object.assign(config, {
        optimization: {
          ...config.optimization,
          minimize: true,
        },
      });
    }
    return config;
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 