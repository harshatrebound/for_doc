{selectedDate && (
  <div 
    onClick={() => !isLoadingSlots && slots && slots.length > 0 && setShowTimeSheet(true)}
    className={cn(
      'p-4 bg-gray-50 rounded-xl transition-colors',
      slots && slots.length > 0 ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default',
      'focus:outline-none focus:ring-2 focus:ring-primary/20'
    )}
  >
    <p className="text-sm text-gray-600">
      Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')} <span className="text-xs bg-gray-100 px-1 rounded">IST</span>
      {state.selectedTime ? ` at ${state.selectedTime}` : (slots && slots.length === 0 && !isLoadingSlots) ? ' - No slots available' : ''}
    </p>
  </div>
)}

<MobileSheet
  isOpen={showTimeSheet}
  onClose={() => setShowTimeSheet(false)}
  title={`Select Time - ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''} (IST)`}
>
  // ... existing code ...
</MobileSheet> 