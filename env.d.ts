declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_DIRECTUS_URL: string;
    DIRECTUS_ADMIN_TOKEN: string;
    DIRECTUS_EMAIL?: string;
    DIRECTUS_PASSWORD?: string;
  }
} 