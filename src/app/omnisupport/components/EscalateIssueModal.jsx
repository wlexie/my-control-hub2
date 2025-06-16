import { ChevronLeft } from 'lucide-react';

export default function EscalateIssueModal({ closeModal, goBackToModal1 }) {
  return (
    <div className="fixed inset-0 flex justify-end bg-black/50 bg-opacity-50 z-50">
      <div className="w-2/7 h-full bg-white font-poppins text-lg px-4 shadow-lg transform  transition-transform duration-300 ease-in-out animate-slide-in">
        <button
          onClick={goBackToModal1}
          className="text-gray-600 hover:text-gray-800 mt-7 p-1"
        >
          <ChevronLeft size={30} />
        </button>

        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-7 right-5 text-gray-600 hover:text-gray-800 border-2 border-gray-600 rounded-full px-2 font-semibold"
        >
          ✕
        </button>

        {/* Escalate Issue Form */}
        <div className="p-6 mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Escalate Issue
          </h2>

          {/* Reason for Escalation */}
          <label className="block text-gray-400 mb-2">
            Reason for Escalation:
          </label>
          <select className="w-full border rounded-lg mb-3 p-2 focus:outline-none focus:ring focus:border-blue-300">
            <option>Technical Issue</option>
            <option>Customer Complaint</option>
            <option>Billing Issue</option>
            <option>Other</option>
          </select>

          {/* Priority Level */}
          <label className="block text-gray-400 mt-4 mb-2">
            Priority Level:
          </label>
          <select className="w-full border rounded-lg mb-3 p-2 focus:outline-none focus:ring focus:border-blue-300">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          {/* Escalate To */}
          <label className="block text-gray-400 mt-4 mb-2">Escalate To:</label>
          <select className="w-full border rounded-lg mb-3 p-2 focus:outline-none focus:ring focus:border-blue-300">
            <option>Support Team</option>
            <option>Manager</option>
            <option>Technical Lead</option>
          </select>

          {/* Additional Notes */}
          <label className="block text-gray-400 mt-4 mb-2">
            Additional Notes:
          </label>
          <textarea className="w-full border rounded-lg p-2 h-28 focus:outline-none focus:ring focus:border-blue-300"></textarea>

          {/* Submit Button */}
          <button
            onClick={closeModal}
            className="mt-6 bg-gray-800 text-white py-2 px-6 rounded-lg hover:bg-gray-700 w-full"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
