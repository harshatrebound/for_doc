# Trebound App Structure Documentation

## Overview
Trebound is a modern React application built with TypeScript, focusing on team building and corporate experiences. The application uses a component-based architecture with styled-components and Framer Motion for animations.

## Directory Structure

```
src/
├── components/           # All React components
│   ├── Navbar/          # Navigation component
│   ├── GradientHero/    # Hero section with stats
│   ├── ServicesSection/ # Services showcase
│   ├── StepsSection/    # Process steps
│   ├── OutboundSection/ # Outbound activities
│   ├── DestinationsSection/ # Destinations showcase
│   ├── InboundSection/  # Inbound activities
│   ├── DiariesSection/  # Experience diaries
│   ├── TestimonialsSection/ # Client testimonials
│   ├── PartnersSection/ # Partner logos
│   ├── ContactSection/  # Contact form
│   └── Footer/         # Footer component
├── assets/             # Static assets
├── App.tsx            # Main application component
├── main.tsx          # Application entry point
├── index.css         # Global styles
└── vite-env.d.ts    # TypeScript declarations
```

## Components Breakdown

### 1. Navigation
- **Navbar**: Main navigation component with responsive design

### 2. Landing Sections
- **GradientHero**
  - Hero section with background image
  - Animated stats display
  - Main headline and subtitle
  - Components:
    - `HeroContainer`
    - `ContentContainer`
    - `StatsContainer`
    - `StatCard`

### 3. Main Content Sections
- **ServicesSection**
  - Service offerings display
  - Service cards with icons

- **StepsSection**
  - Process explanation
  - Step-by-step guide

- **OutboundSection**
  - Outbound activities showcase
  - Experience cards

- **DestinationsSection**
  - Popular destinations
  - Location cards

- **InboundSection**
  - Inbound activities
  - Activity cards

### 4. Social Proof Sections
- **DiariesSection**
  - Experience stories
  - Photo galleries

- **TestimonialsSection**
  - Client reviews
  - Testimonial cards

- **PartnersSection**
  - Partner logos
  - Brand showcase

### 5. Contact & Footer
- **ContactSection**
  - Contact form
  - Contact information

- **Footer**
  - Navigation links
  - Social media links
  - Newsletter subscription
  - Copyright information

## Technical Stack

### Core Technologies
- React
- TypeScript
- Vite

### Styling
- Emotion (Styled Components)
- Tailwind CSS
- CSS Modules

### Animations
- Framer Motion
- CSS Transitions

### State Management
- React Hooks
- Context API (where needed)

## Component Features

### Common Features
- Responsive design
- Animation support
- TypeScript type safety
- Modular styling
- Accessibility compliance

### Special Features
1. **GradientHero**
   - Parallax background
   - Animated stat cards
   - Responsive text sizing

2. **Navigation**
   - Mobile-responsive menu
   - Smooth scroll links
   - Active state indicators

3. **Content Sections**
   - Lazy loading
   - Intersection observer animations
   - Dynamic content rendering

4. **Footer**
   - Newsletter integration
   - Social media links
   - Responsive grid layout

## Best Practices
- Component-based architecture
- TypeScript for type safety
- Responsive design principles
- Performance optimization
- SEO-friendly structure
- Accessibility standards
- Clean code organization