# Bone Joint School → Directus Migration Plan

Contents exported from Directus are here in: F:\AI APps\sports_directus_7thjune\for_doc\directus_export_20250606_212734 (for your ease to understand and map properly)

## 🎯 Executive Summary

Based on our successful blog migration from CSV to Directus, this document outlines a strategic approach to migrate the Bone Joint School section to Directus while preserving all design elements and improving content management.

## 📚 Current Analysis

### Existing Structure Assessment
- **Current Location**: `/bone-joint-school/`
- **Content Type**: Educational content about various joint conditions
- **Categories**: Knee, Shoulder, Ankle, Hip, Elbow, Wrist pain
- **Data Source**: Currently using CSV files or static content
- **Design Elements**: Cards, categories, detailed pages

### Key Learning from Blog Migration
✅ **Successful Patterns:**
- Server Components for performance
- Proper URL structure preservation  
- Client Component wrappers for interactivity
- Field mapping validation before implementation
- Typography enhancement with Tailwind
- Image authentication with Directus assets
- Responsive design preservation

❌ **Pitfalls to Avoid:**
- Wrong URL structure assumptions
- Missing environment variable configuration
- Client/Server component conflicts
- Field name mismatches
- External image domain issues
- Missing fallback content

## 🏗️ Migration Strategy

### Phase 1: Content Structure Analysis (Week 1)

#### 1.1 Current Content Audit
```bash
# Analyze existing bone-joint-school directory structure
src/app/bone-joint-school/
├── [category]/           # Category pages (knee-pain, shoulder-pain, etc.)
├── components/           # Reusable components
├── page.tsx             # Main landing page
└── layout.tsx           # Section layout
```

#### 1.2 Content Type Identification
- **Educational Articles**: Condition explanations, treatments
- **Category Pages**: Joint-specific content groupings
- **Symptom Guides**: Diagnostic information
- **Treatment Options**: Procedure descriptions
- **Prevention Tips**: Lifestyle recommendations

#### 1.3 Design Element Inventory
- Landing page hero section
- Category grid/cards
- Article cards with images
- Navigation breadcrumbs
- Related content sections
- Call-to-action buttons
- Mobile responsiveness

### Phase 2: Directus Schema Design (Week 1-2)

#### 2.1 Collection Structure
```typescript
// Primary Collection: bone_joint_content
interface BoneJointContent {
  id: string;
  title: string;
  slug: string;
  category: 'knee' | 'shoulder' | 'ankle' | 'hip' | 'elbow' | 'wrist';
  content_type: 'article' | 'guide' | 'treatment' | 'prevention';
  featured_image_url: string;
  excerpt: string;
  content_html: string;
  content_text: string;
  symptoms?: string[];
  treatments?: string[];
  prevention_tips?: string[];
  severity_level: 'mild' | 'moderate' | 'severe';
  reading_time: number;
  meta_title?: string;
  meta_description?: string;
  is_featured: boolean;
  related_conditions?: string[];
  date_created: string;
  date_updated: string;
  status: 'draft' | 'published' | 'archived';
}

// Secondary Collection: bone_joint_categories
interface BoneJointCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  featured_image_url: string;
  color_theme: string;
  sort_order: number;
  status: 'active' | 'inactive';
}
```

#### 2.2 Field Mapping Strategy
```typescript
// Ensure field names match exactly between:
// 1. Directus collection fields
// 2. TypeScript interfaces  
// 3. Component prop expectations
// 4. Database schema

// Example validation:
const REQUIRED_FIELDS = [
  'id', 'title', 'slug', 'category', 'content_html',
  'featured_image_url', 'excerpt', 'date_created', 'status'
];
```

### Phase 3: Component Architecture (Week 2)

#### 3.1 URL Structure Preservation
```
Current: /bone-joint-school/knee-pain/acl-injury
Target:  /bone-joint-school/knee-pain/acl-injury (NO CHANGE)

Landing: /bone-joint-school/
Categories: /bone-joint-school/[category]/
Articles: /bone-joint-school/[category]/[slug]
```

#### 3.2 Component Hierarchy
```
src/app/bone-joint-school/
├── page.tsx                     # Landing page (Server Component)
├── [category]/
│   ├── page.tsx                 # Category page (Server Component)
│   └── [slug]/
│       ├── page.tsx             # Article page (Server Component)
│       └── components/
│           └── BookingWidget.tsx # Client Component for booking
├── components/
│   ├── CategoryCard.tsx         # Server Component
│   ├── ArticleCard.tsx          # Server Component
│   ├── SymptomChecker.tsx       # Client Component
│   └── RelatedContent.tsx       # Server Component
└── lib/
    └── bone-joint-directus.ts   # API functions
```

#### 3.3 Smart Component Design
```typescript
// Follow blog pattern - Server Components with Client wrappers
export default async function ArticlePage({ params }: Props) {
  const article = await getArticleBySlug(params.category, params.slug);
  // Server-side data fetching, Client Components for interactivity
}

// Reusable booking integration
<BookingWidget 
  category={article.category}
  condition={article.title}
  urgency={article.severity_level}
/>
```

### Phase 4: Implementation Steps (Week 2-3)

#### 4.1 Environment Setup
```env
# Ensure these are properly configured
NEXT_PUBLIC_DIRECTUS_URL=https://directus-production-d39c.up.railway.app
DIRECTUS_ADMIN_TOKEN=7VmFoC9sqOW2nk3PZCjLY4RWWsauoH48
NEXT_PUBLIC_BASE_URL=https://sportsorthopedics.in
```

#### 4.2 API Layer Development
```typescript
// src/lib/bone-joint-directus.ts
export async function getBoneJointCategories(): Promise<BoneJointCategory[]>
export async function getArticlesByCategory(category: string): Promise<BoneJointContent[]>
export async function getArticleBySlug(category: string, slug: string): Promise<BoneJointContent | null>
export async function getRelatedArticles(currentSlug: string, category: string): Promise<BoneJointContent[]>
export async function getFeaturedContent(): Promise<BoneJointContent[]>
```

#### 4.3 Progressive Migration Strategy
1. **Step 1**: Create Directus collections and test data
2. **Step 2**: Implement landing page with categories
3. **Step 3**: Migrate category pages
4. **Step 4**: Migrate individual article pages
5. **Step 5**: Add advanced features (symptom checker, etc.)

### Phase 5: Design Enhancement (Week 3-4)

#### 5.1 Typography & Content Rendering
```css
/* Extend existing prose styles for medical content */
.bone-joint-prose {
  /* Medical diagram support */
  /* Symptom list styling */
  /* Treatment step styling */
  /* Warning/tip callouts */
}
```

#### 5.2 Interactive Features
- **Symptom Checker**: Client Component with conditional logic
- **Body Part Highlighter**: SVG-based interactive anatomy
- **Treatment Progress Tracker**: Client Component with state
- **Appointment Booking**: Integrated with existing modal

#### 5.3 Medical Content Features
- **Severity Indicators**: Visual severity level badges
- **Treatment Timelines**: Step-by-step procedure explanations
- **Before/After Galleries**: Image carousels for procedures
- **Video Integration**: Educational video embeds

### Phase 6: Testing & Optimization (Week 4)

#### 6.1 Content Migration Testing
- [ ] All existing URLs redirect properly
- [ ] Content renders with proper formatting
- [ ] Images load with authentication
- [ ] Related content suggestions work
- [ ] Category filtering functions
- [ ] Search functionality (if implemented)

#### 6.2 Performance Optimization
- [ ] Server Components used for static content
- [ ] Client Components only where needed
- [ ] Image optimization and lazy loading
- [ ] Proper caching strategies
- [ ] Mobile performance testing

#### 6.3 SEO & Metadata
- [ ] Proper meta titles and descriptions
- [ ] OpenGraph tags for social sharing
- [ ] Structured data for medical content
- [ ] XML sitemap updates

## 🚀 Implementation Timeline

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Analysis & Planning | Content audit, Schema design |
| 2 | Core Implementation | API layer, Basic pages |
| 3 | Design Integration | Components, Responsive design |
| 4 | Enhancement & Testing | Interactive features, QA |

## 🔧 Technical Specifications

### Dependencies Required
```json
{
  "@directus/sdk": "latest",
  "@tailwindcss/typography": "latest",
  "lucide-react": "latest"
}
```

### File Structure
```
src/
├── app/bone-joint-school/
├── lib/bone-joint-directus.ts
├── types/bone-joint.ts
└── components/bone-joint/
```

## 🎯 Success Metrics

- [ ] **Functionality**: All existing features preserved
- [ ] **Performance**: No regression in page load times
- [ ] **Design**: Pixel-perfect design preservation
- [ ] **SEO**: No loss in search rankings
- [ ] **User Experience**: Improved content management workflow
- [ ] **Maintenance**: Easier content updates via Directus

## 🚨 Risk Mitigation

### Potential Issues & Solutions
1. **URL Structure Changes**: Implement proper redirects
2. **Content Loss**: Full backup before migration
3. **Performance Regression**: Optimize queries and caching
4. **Design Breaks**: Component-by-component testing
5. **SEO Impact**: Maintain all meta tags and structure

### Rollback Plan
- Keep CSV/static content as backup
- Environment variable toggle for quick rollback
- Staged deployment with monitoring

## 📋 Pre-Migration Checklist

- [ ] Complete content audit and field mapping
- [ ] Set up Directus collections with test data
- [ ] Create TypeScript interfaces
- [ ] Implement API layer with proper error handling
- [ ] Test authentication and image loading
- [ ] Verify booking modal integration works
- [ ] Mobile responsiveness testing
- [ ] Performance benchmarking

---

**Next Steps**: Review this plan and approve before starting Phase 1 implementation.

**Questions for Clarification**:
1. Are there any specific interactive features in the current Bone Joint School?
2. Do you want to maintain the exact same URL structure?
3. Any specific content types or categories I should prioritize?
4. Should we add any new features during this migration? 