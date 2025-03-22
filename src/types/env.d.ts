declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      JWT_SECRET: string;
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_DOMAIN: string;
      ALLOWED_ORIGINS: string;
    }
  }
} 