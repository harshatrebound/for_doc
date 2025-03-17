# Trebound Design System

## Colors

### Primary Colors
- Primary Orange: `#ff4c39`
- Primary Orange Gradient: `linear-gradient(to bottom, #ff4c39, #ffb573)`

### Neutral Colors
- Text Primary: `#373737`
- Text Secondary: `#979797`
- Text Light: `#b1b1b1`
- Background Light: `#f8fafc`
- Background Card: `#eeeeee`
- White: `#ffffff`

### Accent Colors
- Accent Blue: `#0369a1`
- Accent Blue Light: `#e0f2fe`

## Typography

### Font Families
- Primary Headings: `'DM Sans', sans-serif`
- Secondary Headings & Body: `'Inter', sans-serif`

### Font Sizes
- Hero Title: `2.5rem` (40px)
- Section Title: `1.5rem` (24px)
- Card Title: `1.25rem` (20px)
- Subtitle: `1rem` (16px)
- Body Text: `0.875rem` (14px)
- Small Text: `0.75rem` (12px)
- Label Text: `0.875rem` (14px)

### Font Weights
- Regular: `400`
- Medium: `500`
- Semibold: `600`
- Bold: `700`

### Line Heights
- Tight: `1.25`
- Normal: `1.5`
- Relaxed: `1.625`

## Spacing

### Padding
- Section Padding: `3rem 1rem` (48px 16px)
- Card Padding: `1.25rem` (20px)
- Button Padding: `0.5rem 1rem` (8px 16px)

### Margins
- Section Margin Bottom: `2.5rem` (40px)
- Component Spacing: `1.5rem` (24px)
- Element Spacing: `0.75rem` (12px)

### Grid System
- Container Max Width: `1200px`
- Grid Columns: `12`
- Grid Gap: `1.5rem` (24px)
- Card Grid: `repeat(auto-fit, minmax(280px, 1fr))`

## Components

### Buttons

#### Primary Button
```css
- Height: 45px
- Border Radius: 8px
- Background: gradient from #ff4c39 to #ffb573 (on hover)
- Border: 1px solid #b1b1b1
- Text Color: #b1b1b1 (default), white (hover)
- Font: DM Sans, Bold
- Font Size: 1rem (16px)
- Transition: 0.3s ease
```

#### Secondary Button
```css
- Height: 40px
- Border Radius: 6px
- Background: transparent
- Border: 1px solid #b1b1b1
- Text Color: #373737
- Font: DM Sans, Medium
- Font Size: 0.875rem (14px)
```

### Cards

#### Service Card
```css
- Background: #eeeeee
- Border Radius: 16px
- Padding: 20px (p-5)
- Shadow: none
- Hover Transform: translateY(-2px)
- Transition: 0.2s ease-in-out
```

#### Image Container in Cards
```css
- Aspect Ratio: 386/304
- Border Radius: 16px
- Overflow: hidden
- Object Fit: cover
```

### Tabs
```css
- Container Border Radius: 20px
- Border: 1px solid #b1b1b1
- Height: auto
- Padding: 0.75rem 1rem (py-3 px-4)
- Font: DM Sans, Medium
- Font Size: 1rem (16px)
- Active State: gradient background
- Inactive State: text-[#b1b1b1]
- Icon Size: 16px (w-4 h-4)
```

## Animations

### Transitions
- Default Duration: `0.2s`
- Easing: `ease-in-out`
- Hover Transitions: `0.3s ease`

### Motion Effects
```javascript
// Fade Up Animation
fadeInUp: {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

// Scale Animation
fadeInScale: {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
}

// Stagger Children
staggerChildren: {
  transition: { staggerChildren: 0.08 }
}
```

## Layout Patterns

### Section Structure
```html
<section className="relative py-12 overflow-hidden">
  <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
    <!-- Section Header -->
    <div className="text-center relative mb-10">
      <span className="text-sm text-neutral-500">Section Label</span>
      <h2 className="mt-4 text-2xl font-semibold">Section Title</h2>
    </div>
    
    <!-- Section Content -->
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Content Cards -->
    </div>
  </div>
</section>
```

### Card Structure
```html
<div className="bg-[#eeeeee] rounded-[16px] overflow-hidden">
  <div className="p-5">
    <div className="aspect-[386/304] rounded-[16px] overflow-hidden mb-4">
      <!-- Image -->
    </div>
    <h3 className="text-xl font-medium text-[#373737] mb-2">
      <!-- Title -->
    </h3>
    <p className="text-base text-[#979797] mb-4">
      <!-- Description -->
    </p>
    <!-- Footer Content -->
  </div>
</div>
```

## Responsive Breakpoints

### Screen Sizes
- Mobile: `< 768px`
- Tablet: `768px - 1023px`
- Desktop: `1024px - 1199px`
- Large Desktop: `≥ 1200px`

### Grid Layouts
- Mobile: `1 column`
- Tablet: `2 columns`
- Desktop: `3 columns`
- Gap: `1.5rem`

## Best Practices

1. **Consistency**
   - Use defined color tokens
   - Maintain consistent spacing
   - Follow typography hierarchy
   - Keep components compact and efficient

2. **Accessibility**
   - Maintain color contrast ratios
   - Use semantic HTML
   - Include hover/focus states
   - Ensure clickable areas remain accessible (min 44px touch target)

3. **Performance**
   - Optimize images
   - Use responsive images
   - Implement lazy loading
   - Keep animations subtle and performant

4. **Responsiveness**
   - Mobile-first approach
   - Fluid typography
   - Flexible grid systems
   - Maintain readability at all sizes

5. **Animation**
   - Subtle transitions
   - Performance-conscious animations
   - Respect user preferences (reduce-motion)
   - Keep motion distances shorter for compact design 