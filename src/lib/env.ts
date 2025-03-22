import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Admin credentials
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_DOMAIN: z.string().url(),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',')),
});

export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return { 
      success: true, 
      env: parsed 
    };
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables. Check server logs for more details.');
  }
}

// Validate on import
validateEnv(); 