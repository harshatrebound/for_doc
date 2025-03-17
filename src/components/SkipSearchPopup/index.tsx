import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface SkipSearchPopupProps {
  onClose: () => void;
  isVisible: boolean;
}

const SkipSearchPopup = ({ onClose, isVisible }: SkipSearchPopupProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Popup Content */}
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: 20 }}
            className="relative bg-white rounded-xl shadow-xl w-[95%] max-w-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="md:w-[35%] h-[200px] md:h-auto">
                <img
                  src="https://cdn.prod.website-files.com/655e49f111202615f47a3d82/6631fb65afcee8415edaa6a8_Vaish.jpg"
                  alt="Team Building Expert"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Section */}
              <div className="md:w-[65%] p-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3">
                  <span className="bg-gradient-to-r from-[#FF4C39] to-[#FFB573] bg-clip-text text-transparent">
                    Skip the Search
                  </span>
                  <span className="text-[#313131]">—Your Ideal Teambuilding Plan is Just a Click Away!</span>
                </h2>

                <div className="mb-4">
                  <p className="text-base text-[#636363] mb-1">
                    We've been doing this for <span className="font-semibold">more than 10 years now</span>. Tell us what you need.
                  </p>
                  <p className="text-base text-[#636363]">
                    Skip the search, sit back, and relax.
                  </p>
                </div>

                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39]"
                  />
                  <input
                    type="email"
                    placeholder="Work Email"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39]"
                    />
                    <input
                      type="text"
                      placeholder="No of Pax"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Destination (Eg. Bangalore)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39]"
                  />
                  <textarea
                    placeholder="More details? (*For priority)"
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39] resize-none"
                  />
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF4C39] bg-white">
                    <option value="">Select type of activity</option>
                    <option value="team_outing">Team Outing</option>
                    <option value="team_building">Team Building</option>
                    <option value="corporate_event">Corporate Event</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#FF4C39] to-[#FFB573] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Submit
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <img
                      src="https://cdn.prod.website-files.com/655e49f111202615f47a3d82/6631fb65afcee8415edaa6a8_Vaish.jpg"
                      alt="Google Rating"
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="ml-2 text-[#636363]">Excellent</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#636363] font-semibold">4.9</span>
                    <span className="ml-1 text-[#636363]">out of 5</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SkipSearchPopup; 