# Procedure Surgery Collection Integration Plan

## Overview
This document outlines the complete integration plan for the Procedure Surgery collection, following the successful patterns established with Blogs and Bone Joint School integrations.

## 1. Data Structure Analysis

### 1.1 Directus Collection Review
- [ ] Analyze existing `procedure_surgery` collection in Directus
- [ ] Document field structure and relationships
- [ ] Identify required fields vs optional fields
- [ ] Check for existing content and categories
- [ ] Verify image/media field configuration

### 1.2 Expected Schema Structure
Based on typical medical procedure content:
```typescript
interface ProcedureSurgery {
  id: number;
  title: string;
  slug: string;
  description?: string;
  content_html: string;
  featured_image?: DirectusFile;
  category?: string;
  procedure_type?: string;
  duration?: string;
  recovery_time?: string;
  preparation_instructions?: string;
  post_operative_care?: string;
  risks_complications?: string;
  expected_outcomes?: string;
  cost_estimate?: string;
  is_featured: boolean;
  status: 'published' | 'draft';
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}
```

## 2. API Integration Setup

### 2.1 Directus API Functions
Extend `src/lib/directus.ts` with:

```typescript
// Get all procedure surgeries with pagination
export async function getProcedureSurgeries(
  limit = 12, 
  offset = 0, 
  category?: string,
  search?: string
): Promise<ProcedureSurgeryResponse>

// Get single procedure by slug
export async function getProcedureSurgeryBySlug(slug: string): Promise<ProcedureSurgery | null>

// Get procedure categories
export async function getProcedureCategories(): Promise<string[]>

// Get related procedures
export async function getRelatedProcedures(
  currentId: number, 
  category?: string, 
  limit = 3
): Promise<ProcedureSurgery[]>

// Get featured procedures
export async function getFeaturedProcedures(limit = 6): Promise<ProcedureSurgery[]>
```

### 2.2 Type Definitions
Create `src/types/procedure-surgery.ts`:

```typescript
export interface ProcedureSurgery {
  // ... as defined above
}

export interface ProcedureSurgeryResponse {
  data: ProcedureSurgery[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProcedureCategory {
  name: string;
  count: number;
}
```

## 3. URL Structure & Routing

### 3.1 Proposed URL Structure
```
/procedures                          # Main listing page
/procedures/category/[category]      # Category-specific listings
/procedures/[slug]                   # Individual procedure page
```

### 3.2 File Structure
```
src/app/procedures/
├── page.tsx                        # Main procedures listing
├── [slug]/
│   └── page.tsx                    # Individual procedure page
├── category/
│   └── [category]/
│       └── page.tsx                # Category listings
├── actions.ts                      # Server actions
└── components/
    ├── ProcedureCard.tsx
    ├── ProcedureHero.tsx
    ├── ProcedureDetails.tsx
    ├── ProcedureFilters.tsx
    ├── BookingModal.tsx
    └── RelatedProcedures.tsx
```

## 4. Page Components Design

### 4.1 Main Procedures Listing (`/procedures`)
**Features:**
- Hero section with introduction to surgical procedures
- Category filter tabs
- Search functionality
- Grid layout of procedure cards
- Pagination
- Featured procedures section
- Call-to-action for consultations

**Components:**
- `ProcedureFilters` - Category and search filtering
- `ProcedureCard` - Individual procedure preview
- `PaginationControls` - Navigation between pages
- `BookingCTA` - Consultation booking section

### 4.2 Individual Procedure Page (`/procedures/[slug]`)
**Features:**
- Hero section with procedure title and key info
- Detailed procedure information sections:
  - Overview and description
  - Preparation instructions
  - Procedure details and duration  
  - Recovery and post-operative care
  - Risks and complications
  - Expected outcomes
  - Cost information
- Image gallery (before/after if applicable)
- Related procedures
- Booking/consultation CTA
- Breadcrumb navigation
- Share functionality

**Components:**
- `ProcedureHero` - Hero section with key details
- `ProcedureDetails` - Tabbed or sectioned content
- `ProcedureGallery` - Image showcase
- `RelatedProcedures` - Similar procedure suggestions
- `ConsultationBooking` - Booking form/modal

### 4.3 Category Pages (`/procedures/category/[category]`)
**Features:**
- Category-specific hero
- Filtered procedure listings
- Category description
- Sub-category navigation if applicable

## 5. Design System Integration

### 5.1 Visual Design Principles
Following the enhanced design established for Bone Joint School:
- Modern card-based layouts
- Gradient backgrounds and overlays
- Hover animations and transitions
- Consistent color scheme with medical theme
- Professional typography hierarchy
- Call-to-action buttons with enhanced styling

### 5.2 Mobile Responsiveness
- Touch-friendly navigation
- Responsive grid layouts
- Mobile-optimized forms
- Collapsible content sections

## 6. SEO & Performance Optimization

### 6.1 SEO Features
- Dynamic meta titles and descriptions
- Structured data for medical procedures
- Open Graph tags for social sharing
- XML sitemap generation
- Breadcrumb markup

### 6.2 Performance Features
- Server-side rendering (SSR)
- Image optimization with Next.js Image
- Lazy loading for procedure cards
- Efficient API queries with proper caching

## 7. Content Management Features

### 7.1 Admin Features
- Rich text editor for procedure content
- Image upload and management
- Category management
- SEO meta field editing
- Content status management (draft/published)

### 7.2 Content Structure
- Standardized procedure templates
- Consistent information architecture
- Quality assurance checklists
- Content versioning

## 8. Integration Steps

### Phase 1: Foundation Setup
1. [ ] Analyze Directus collection structure
2. [ ] Create type definitions
3. [ ] Extend Directus API functions
4. [ ] Set up basic routing structure

### Phase 2: Core Pages Development
1. [ ] Create main procedures listing page
2. [ ] Develop individual procedure page template
3. [ ] Implement category filtering
4. [ ] Add search functionality

### Phase 3: Enhanced Features
1. [ ] Develop procedure-specific components
2. [ ] Implement booking/consultation features
3. [ ] Add related procedures functionality
4. [ ] Create image gallery components

### Phase 4: Design & UX Polish
1. [ ] Apply enhanced design system
2. [ ] Implement animations and transitions
3. [ ] Optimize mobile experience
4. [ ] Conduct usability testing

### Phase 5: SEO & Performance
1. [ ] Implement SEO optimizations
2. [ ] Add structured data
3. [ ] Optimize images and loading
4. [ ] Set up analytics tracking

### Phase 6: Testing & Launch
1. [ ] Content migration testing
2. [ ] Cross-browser testing
3. [ ] Performance auditing
4. [ ] Soft launch and feedback collection

## 9. Header Navigation Integration

### 9.1 Navigation Updates
Update `src/components/layout/SiteHeader.tsx` to include:
- Procedures main navigation item
- Dropdown with popular procedure categories
- Quick access to consultation booking

### 9.2 Actions Integration
Create `src/app/procedures/actions.ts` for:
- Category fetching for navigation
- Search functionality
- Related content suggestions

## 10. Special Considerations

### 10.1 Medical Content Compliance
- Ensure medical disclaimers are included
- Implement content review workflow
- Add appropriate legal notices
- Consider accessibility compliance (WCAG)

### 10.2 User Experience
- Clear information hierarchy
- Prominent consultation CTAs
- Easy navigation between related procedures
- Trust signals and credentials

### 10.3 Technical Considerations
- Image optimization for medical photography
- Secure handling of patient information
- Performance optimization for content-heavy pages
- Mobile-first responsive design

## 11. Success Metrics

### 11.1 Technical Metrics
- Page load times < 3 seconds
- Mobile performance score > 90
- SEO score improvements
- Accessibility compliance

### 11.2 Business Metrics
- Increased procedure page engagement
- Higher consultation booking rates
- Improved search rankings for procedure terms
- Enhanced user journey completion

## 12. Timeline Estimate

- **Phase 1-2**: 1-2 weeks (Foundation & Core Pages)
- **Phase 3-4**: 2-3 weeks (Features & Design)
- **Phase 5-6**: 1-2 weeks (Optimization & Launch)

**Total Estimated Timeline**: 4-7 weeks

## 13. Dependencies

- Directus collection structure finalization
- Content creation and migration
- Design system components
- Booking system integration
- Medical content review process

---

This plan provides a comprehensive roadmap for integrating the Procedure Surgery collection while maintaining consistency with the established patterns and ensuring a professional, user-friendly experience for medical procedure information. 