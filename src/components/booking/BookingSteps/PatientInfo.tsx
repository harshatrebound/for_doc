import { BookingFormData } from '@/types/booking';
import { DatePicker } from '../DatePicker';

interface PatientInfoProps {
  formData: BookingFormData;
  onChange: (updates: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  TimeSlotSelector: React.FC;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({
  formData,
  onChange,
  onNext,
  onBack,
  selectedDate,
  setSelectedDate,
  TimeSlotSelector,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Appointment Date & Time</h3>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          minDate={new Date()}
          placeholderText="Select date"
          className="w-full p-2 border rounded-lg"
        />
        {selectedDate && <TimeSlotSelector />}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Patient Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => onChange({ patientName: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full p-2 border rounded-lg"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="w-full p-2 border rounded-lg"
            rows={3}
            placeholder="Any additional notes or concerns"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}; 