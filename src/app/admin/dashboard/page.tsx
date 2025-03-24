export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#8B5C9E] text-white rounded-lg text-sm sm:text-base hover:bg-[#7A4B8D]">
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Stat Cards */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm sm:text-base text-gray-500">Today's Appointments</h3>
          <p className="text-2xl sm:text-3xl font-bold mt-2">12</p>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">Patient</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Table rows with responsive padding */}
            <tr>
              <td className="px-4 py-3 text-sm sm:text-base">John Doe</td>
              <td className="px-4 py-3 text-sm sm:text-base">10:00 AM</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs sm:text-sm bg-green-100 text-green-800 rounded-full">
                  Confirmed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Form Elements */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input 
          type="text" 
          placeholder="Search patients..." 
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5C9E] text-sm sm:text-base"
        />
        <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#8B5C9E] text-sm sm:text-base">
          <option>Filter by status</option>
          <option>Confirmed</option>
          <option>Pending</option>
        </select>
      </div>
    </div>
  );
} 