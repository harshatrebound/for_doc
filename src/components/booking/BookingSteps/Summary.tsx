import { BookingFormData } from '@/types/booking';

interface SummaryProps {
  formData: BookingFormData;
  selectedDate: Date | null;
  selectedTime: string;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
}

export const Summary: React.FC<SummaryProps> = ({
  formData,
  selectedDate,
  selectedTime,
  onSubmit,
  onBack,
  isSubmitting,
}) => {
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <h3 className="text-lg font-semibold">Appointment Summary</h3>

      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Doctor</h4>
          <p className="mt-1">{formData.doctor?.name || 'Not selected'}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
          <p className="mt-1">
            {selectedDate?.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {selectedTime && ` at ${selectedTime}`}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Patient Name</h4>
          <p className="mt-1">{formData.patientName}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
          <p className="mt-1">Email: {formData.email}</p>
          <p className="mt-1">Phone: {formData.phone}</p>
        </div>

        {formData.notes && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Notes</h4>
            <p className="mt-1">{formData.notes}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </form>
  );
}; 