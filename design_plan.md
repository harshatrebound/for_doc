I'll create a comprehensive audit and optimization plan for each admin page, focusing on mobile responsiveness and design. Let's break this down page by page:

1. **Admin Dashboard (/admin)**
Current Issues:
- Analytics cards may be too cramped on mobile
- Charts might not scale well
- Navigation could be difficult to access

Optimization Plan:
```typescript
// Dashboard Layout Improvements
<div className="p-4 md:p-6">
  {/* Mobile-First Stats Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard 
      className="p-4 flex flex-col space-y-2"
      mobileLayout={true} // New prop for mobile optimization
    />
  </div>

  {/* Responsive Charts */}
  <div className="mt-6">
    <ResponsiveChart
      height={300}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          position: 'bottom',
          labels: { padding: 20 }
        }
      }}
    />
  </div>
</div>
```

2. **Schedule Management (/admin/schedule)**
Current Issues:
- Table view is difficult to read on mobile
- Actions are hard to tap
- Schedule details overflow

Optimization Plan:
```typescript
// Card-based Layout for Mobile
<div className="space-y-4">
  {doctors.map(doctor => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{doctor.name}</h3>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
        </div>
        <ExpandButton onClick={() => toggleSchedule(doctor.id)} />
      </div>
      
      {/* Collapsible Schedule */}
      <Collapsible>
        <div className="mt-4 space-y-2">
          {doctor.schedule.map(day => (
            <div className="flex justify-between text-sm">
              <span>{day.name}</span>
              <span>{day.hours}</span>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  ))}
</div>
```

3. **Doctor Management (/admin/doctors)**
Current Issues:
- Form fields take up too much space
- Image upload is not mobile-friendly
- Action buttons are too small

Optimization Plan:
```typescript
// Mobile-Optimized Doctor Form
<form className="space-y-6">
  {/* Responsive Image Upload */}
  <div className="flex flex-col items-center">
    <ImageUpload
      className="w-32 h-32 rounded-full"
      mobileControls={true}
    />
  </div>

  {/* Stacked Form Fields */}
  <div className="space-y-4">
    <Input
      label="Name"
      fullWidth
      className="text-base py-3" // Larger touch target
    />
    <Select
      label="Specialty"
      fullWidth
      className="text-base py-3"
      menuPosition="fixed" // Better mobile dropdown
    />
  </div>

  {/* Fixed Bottom Actions */}
  <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t">
    <Button
      fullWidth
      size="large"
      className="mb-2"
    >
      Save Changes
    </Button>
  </div>
</form>
```

4. **Appointments (/admin/appointments)**
Current Issues:
- Calendar view is not optimized for small screens
- Appointment details are hard to read
- Filtering options take up too much space

Optimization Plan:
```typescript
// Mobile-First Appointments View
<div className="flex flex-col h-full">
  {/* Collapsible Filters */}
  <FilterDrawer
    position="top"
    className="lg:hidden"
  >
    <FilterOptions compact={true} />
  </FilterDrawer>

  {/* List View for Mobile */}
  <div className="flex-1 overflow-auto">
    {appointments.map(apt => (
      <AppointmentCard
        className="p-4 border-b"
        layout="stacked" // Mobile-optimized layout
      >
        <div className="flex justify-between mb-2">
          <Time format="compact">{apt.time}</Time>
          <Status compact>{apt.status}</Status>
        </div>
        <PatientInfo compact />
      </AppointmentCard>
    ))}
  </div>

  {/* Mobile FAB */}
  <FloatingActionButton
    icon={<Plus />}
    onClick={() => openNewAppointment()}
  />
</div>
```

5. **Settings (/admin/settings)**
Current Issues:
- Too many options visible at once
- Complex forms are difficult to navigate
- Save actions are not easily accessible

Optimization Plan:
```typescript
// Mobile-Optimized Settings
<div className="divide-y">
  {/* Accordion-style sections */}
  <SettingsSection
    title="General"
    expandable
    mobileLayout
  >
    <div className="space-y-4 p-4">
      <Switch
        label="Enable Notifications"
        labelPosition="left"
        touchFriendly
      />
    </div>
  </SettingsSection>

  {/* Bottom Save Bar */}
  <SaveBar
    position="sticky"
    className="bottom-0 bg-white p-4"
  >
    <Button fullWidth>Save Changes</Button>
  </SaveBar>
</div>
```

Global Mobile Optimizations:
1. **Navigation**:
```typescript
// Mobile Navigation Component
<MobileNav>
  <Drawer
    position="left"
    breakpoint="lg"
  >
    <NavList compact />
  </Drawer>
  <AppBar>
    <MenuButton />
    <PageTitle />
    <Actions />
  </AppBar>
</MobileNav>
```

2. **Typography**:
```css
/* Mobile Typography Scale */
.text-heading {
  @apply text-xl md:text-2xl font-bold;
}

.text-subheading {
  @apply text-base md:text-lg font-medium;
}

.text-body {
  @apply text-sm md:text-base;
}
```

3. **Touch Targets**:
```css
/* Enhanced Touch Targets */
.touch-target {
  @apply min-h-[48px] min-w-[48px];
  @apply flex items-center justify-center;
}
```

Implementation Strategy:
1. Start with the most frequently used pages (Dashboard, Schedule)
2. Implement global navigation changes
3. Update typography and touch targets
4. Add mobile-specific features (drawers, FABs)
5. Test on various devices and screen sizes
6. Gather user feedback and iterate

Would you like me to focus on any specific page or aspect of the mobile optimization plan?
