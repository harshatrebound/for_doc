# Modern Design Plan for Appointments Page

## 1. List View
- Use a card-based or modern table layout for each appointment.
- Each card/table row should have:
  - Patient name, doctor, date/time, status chip, and action buttons.
  - Subtle shadow, rounded corners, and spacing for separation.
- Status chips use brand colors (purple for confirmed, red for cancelled, etc.).
- Responsive: On mobile, cards stack vertically with clear touch targets.
- Pagination:
  - Use a modern, accessible pagination bar.
  - On mobile, show clear "Previous" and "Next" buttons, with page numbers if space allows.
  - Pagination controls should match the style of the view switcher and calendar controls.

## 2. Calendar View
- Already implemented: week view on mobile, month grid on desktop, brand colors, and modern look.

## 3. Header & Controls
- View switcher (List/Calendar) uses consistent button styles (brand purple, white text, rounded, shadow on active).
- Controls are sticky or always visible on mobile for easy navigation.
- Use icons and text for clarity.

## 4. Appointment Details
- Status chips are visually distinct and color-coded.
- Action buttons (edit, view, book again) are clear, accessible, and use brand colors.
- Use icons for status and actions where appropriate.
- Consistent spacing and alignment for all fields.

## 5. Accessibility
- Ensure high color contrast for all text and backgrounds.
- Large, easy-to-tap buttons and controls on mobile.
- Readable font sizes (min 14px on mobile).
- Keyboard and screen reader accessible.

## 6. General Design Principles
- Use Tailwind or your design system for all spacing, colors, and typography.
- Subtle hover/tap animations for interactive elements.
- Consistent use of brand purple (#8B5C9E), white, and accent backgrounds.
- Minimalist, clean, and modern look throughout.

---

**Next Steps:**
- Redesign List View for modern, mobile-friendly, and brand-consistent appearance.
- Fix and unify pagination on mobile and desktop.
- Unify design language between List and Calendar views (headers, buttons, cards, etc.).
- Polish overall Appointments page layout and controls. 