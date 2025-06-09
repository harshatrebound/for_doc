# Railway Environment Variables Checklist

## Required Environment Variables for Railway Deployment

### 1. Set these in Railway Dashboard:
```
NEXT_PUBLIC_DIRECTUS_URL=https://directus-production-d39c.up.railway.app
DIRECTUS_ADMIN_TOKEN=7VmFoC9sqOW2nk3PZCjLY4RWWsauoH48
```

### 2. Check Railway Logs for these errors:
- "Missing Directus environment variables"
- "URL: undefined" 
- "Directus configuration is required"

### 3. How to set in Railway:
1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add each variable with the exact names above
4. Redeploy your application

### 4. Verify Variables are Working:
- Check Railway build logs for the console.log outputs
- The URL should show: https://directus-production-d39c.up.railway.app
- Not: undefined

## Common Issues:

### Issue 1: NEXT_PUBLIC_ Variables
- `NEXT_PUBLIC_DIRECTUS_URL` must be set as environment variable in Railway
- This is used for client-side image URLs

### Issue 2: Server-side Variables  
- `DIRECTUS_ADMIN_TOKEN` must be set for server-side API calls
- This is used for authentication

### Issue 3: Build vs Runtime
- Variables set in Railway are available at both build time and runtime
- But local .env files are NOT deployed to Railway

## Debug Steps:
1. Check Railway deployment logs for console.log outputs
2. Verify both environment variables are set in Railway dashboard  
3. Ensure no typos in variable names
4. Redeploy after setting variables 