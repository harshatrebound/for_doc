import { Directus } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const directusToken = process.env.DIRECTUS_ADMIN_TOKEN;

if (!directusUrl) {
  throw new Error('Directus URL is not defined. Please set NEXT_PUBLIC_DIRECTUS_URL environment variable.');
}

// Initialize Directus client
// We are not using static token here as it's generally not recommended for client-side access.
// Authentication should be handled based on user sessions or other secure methods if needed for non-admin actions.
// For server-side fetching during build or API routes, the admin token can be used if necessary,
// but ensure it's not exposed to the client.
// For this task, we'll assume public read access for blogs initially,
// or authenticated access if your Directus instance requires it.
// If your Directus instance allows public read for the 'blog_content' collection, you might not need to authenticate.
// If it requires authentication even for reading, the admin token would be used here,
// but it's crucial this code runs server-side (e.g., in getServerSideProps, getStaticProps, or API routes)
// to avoid exposing the admin token.

// Let's create a generic client first. Authentication will be handled by individual functions if needed.
export const directus = new Directus<Record<string, any>>(directusUrl);

// Example of how you might create an authenticated client if needed for specific operations (server-side only)
export const getAuthenticatedDirectusClient = async () => {
  if (!directusToken) {
    console.warn('DIRECTUS_ADMIN_TOKEN is not set. Authenticated client cannot be created.');
    // Depending on requirements, you might throw an error or return the unauthenticated client
    return directus; // Fallback to unauthenticated or handle error
  }
  try {
    // Check if already authenticated to avoid re-authenticating unnecessarily
    // Note: The SDK does not directly expose a method to check if the *client* is authenticated with a static token.
    // Static token is passed with each request.
    // If using login/logout methods:
    // if (await directus.auth.token) {
    //   return directus;
    // }
    // await directus.auth.login({ email: process.env.DIRECTUS_EMAIL!, password: process.env.DIRECTUS_PASSWORD! });

    // For static token, you typically pass it when creating the client or per request.
    // Re-initializing with token for simplicity here, or pass token in individual requests.
    const authenticatedClient = new Directus<Record<string, any>>(directusUrl, {
      auth: {
        staticToken: directusToken,
      },
    });
    return authenticatedClient;
  } catch (error) {
    console.error('Failed to authenticate Directus client:', error);
    // Fallback to unauthenticated client or throw an error
    return directus;
  }
};

// Example usage (ensure this is adapted to your actual data structure in Directus)
// Define a type for your blog posts based on Directus fields
export interface DirectusBlogPost {
  id: string;
  status: string; // e.g., 'published', 'draft'
  title: string;
  slug: string;
  category?: string; // Assuming category is a simple string or a relational field's key
  content_html?: string;
  content_text?: string;
  excerpt?: string;
  featured_image_url?: string; // Or this could be an image ID/object if it's a file in Directus
  date_created?: string; // ISO date string
  date_updated?: string; // ISO date string
  reading_time?: number;
  canonical_url?: string;
  meta_title?: string;
  meta_description?: string;
  // Add any other fields you expect from your 'blog_content' collection
}
