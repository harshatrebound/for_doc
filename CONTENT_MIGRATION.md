# Content Migration Guide

This document outlines the hybrid content system that combines PostgreSQL database storage with local CSV files as a fallback.

## System Architecture

The hybrid content system provides several benefits:

1. **Primary PostgreSQL Storage**: Content is primarily stored in the PostgreSQL database for better querying, relationships, and performance.
2. **CSV Fallback**: Local CSV files serve as a fallback mechanism in case the database is unavailable.
3. **Gradual Migration**: Allows for a smooth transition from CSV-based content to a database-driven approach.
4. **Content Versioning**: CSV files can be version-controlled in Git as a backup.

## Migration Process

### Step 1: Setup Database Schema

The Prisma schema already includes the necessary models:

- `Page`: Represents a content page with metadata
- `ContentBlock`: Individual content blocks within a page
- `Category`: Content categorization

### Step 2: Migrate Content

Use the included command-line tools to migrate your content:

```bash
# Migrate all content from CSV to PostgreSQL
npm run content:migrate

# Sync changes from CSV to existing database content
npm run content:sync

# Export database content back to CSV
npm run content:export

# Check database health and content statistics
npm run db:health
```

### Step 3: Configure Fallback Mode

You can control whether the system should use CSV files as a fallback by setting the `ENABLE_CSV_FALLBACK` environment variable in your `.env` file:

```
# Content system configuration
ENABLE_CSV_FALLBACK=true
```

To toggle this setting, run:

```bash
npx ts-node scripts/database-admin.ts toggle-fallback
```

## Service Layer

The content service layer (`src/lib/content-service.ts`) handles:

1. Fetching content from the database
2. Falling back to CSV when needed
3. Automatically detecting database connectivity issues
4. Periodically checking if the database connection is restored

## Developing with the Hybrid System

When working with content, use the integration layer (`src/lib/content-integration.ts`) instead of accessing the content service directly. This provides:

1. Stable API that won't change even as we modify the underlying storage mechanisms
2. Helper functions for working with content
3. Clear separation from direct database or filesystem access

### Example Usage in Components

```typescript
import { getTopicData, getRelatedTopics } from '@/lib/content-integration';

// In your page component
const page = await getTopicData(slug, 'bone-joint-school');
const relatedContent = await getRelatedTopics(slug, 'bone-joint-school', 3, page?.category);
```

## Data Lifecycle

1. **Creation**: Content can be initially authored in CSV files or added directly to the database.
2. **Synchronization**: Run `npm run content:sync` to ensure database has the latest content.
3. **Backup**: Run `npm run content:export` to create CSV backups of database content.
4. **Fallback**: If database connectivity is lost, system automatically uses CSV files.

## Future Improvements

- Admin UI for content management
- Content versioning and change history
- Real-time content synchronization
- Media asset management integration 