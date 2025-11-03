import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

// Define the interface for your API response data
interface ApiResponse {
  status: string;
  message?: string;
  successCount?: number;
  failureCount?: number;
}

// Define the interface for the payload you send to the API
interface NotificationPayload {
  notificationTitle: string;
  notificationBody: string;
  targetUserId?: string; // Optional if sending to all
}

const NotificationSender: React.FC = () => {
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationBody, setNotificationBody] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [sendToAll, setSendToAll] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Idle');
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // IMPORTANT: Replace with your actual endpoint
  const API_ENDPOINT: string = 'http://tuma-dev-backend-alb-1553448571.us-east-1.elb.amazonaws.com/api/account/send-app-notification-to-all';

  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    setStatus('Sending...');
    setLoading(true);
    setSuccessCount(0); // Reset counts before new send attempt
    setFailureCount(0); // Reset counts before new send attempt

    const payload: NotificationPayload = {
      notificationTitle,
      notificationBody,
    };

    // Conditionally add targetUserId if not sending to all and a user ID is provided
    if (!sendToAll && targetUserId) {
      payload.targetUserId = targetUserId;
    }

    try {
      const response = await axios.post<ApiResponse>(API_ENDPOINT, payload, {
        headers: {
          'Content-Type': 'application/json',
          // Add any authorization headers if needed
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
        },
      });

      // Console log the full API response
      console.log('API Response:', response.data);

      if (response.data.status === '200') {
        // Set the success message from the API if available, otherwise a default
        setStatus(`Sent successfully! ${response.data.message || ''}`);
        setSuccessCount(response.data.successCount || 0);
        setFailureCount(response.data.failureCount || 0);
      } else {
        // Set the failure message from the API
        setStatus(`Failed: ${response.data.message || 'Unknown error'}`);
        setFailureCount(response.data.failureCount || 0);
        setSuccessCount(response.data.successCount || 0); // Still show success count if partially failed
      }
      } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error sending notification:', error.response?.data || error.message);
        setStatus(`Error: ${error.response?.data?.message || error.message}`);
      } else if (error instanceof Error) {
        console.error('General error sending notification:', error.message);
        setStatus(`Error: ${error.message}`);
      } else {
        console.error('Unknown error sending notification:', error);
        setStatus('Error: Unknown error occurred');
      }

      setFailureCount(0);
      setSuccessCount(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    // Adjusted styling to fill the space
    <div className="bg-black/20   items-center justify-center w-full h-screen flex flex-col border border-gray-700">
        <div className='max-w-5xl w-3xl p-8 bg-white mx-auto'>

      <h2 className="text-4xl font-semibold text-gray-500 mb-10 tracking-tight">Send In-App Notification</h2>

      <form onSubmit={handleSendNotification} className="flex-grow flex flex-col"> 
        <div className="flex-grow overflow-y-auto pr-5 -mr-4 custom-scrollbar"> 
          
          {/* Notification Title */}
          <div className="mb-7">
            <label htmlFor="notificationTitle" className="block text-gray-400 text-sm font-medium mb-2">
              Notification Title
            </label>
            <input
              type="text"
              id="notificationTitle"
              className="block w-full py-3 px-4 text-gray-950 bg-gray-50 text-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-base"
              placeholder="e.g., :alarm_clock: Sale This Friday!"
              value={notificationTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNotificationTitle(e.target.value)}
              required 
            />
          </div>

          {/* Notification Body */}
          <div className="mb-7">
            <label htmlFor="notificationBody" className="block text-gray-400 text-sm font-medium mb-2">
              Notification Body (Markdown supported)
            </label>
            <textarea
              id="notificationBody"
              rows={7} // Increased rows for more content
              className="block w-full py-3 px-4 text-gray-950 bg-gray-50 text-2xl border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200 ease-in-out resize-y placeholder-gray-500 text-base"
              placeholder="Type your message here"
              value={notificationBody}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotificationBody(e.target.value)}
              required // Added required attribute
            ></textarea>
          </div>

          {/* Target User ID */}
          <div className="mb-6">
            <label htmlFor="targetUserId" className="block text-gray-400 text-lg font-medium mb-2">
              Target User ID (optional)
            </label>
            <input
              type="text"
              id="targetUserId"
              className="block w-full py-3 px-4 text-gray-950 text-2xl bg-gray-50 border border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-500 text-base"
              placeholder="Enter user ID for a specific user (e.g., 'ysid_abcdef123')"
              value={targetUserId}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTargetUserId(e.target.value)}
              disabled={sendToAll} // Disable if 'send to all' is checked
            />
          </div>

          {/* Send to All Checkbox */}
          <div className="mb-10 flex items-center">
            <input
              type="checkbox"
              id="sendToAll"
              className="mr-3 h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded-md focus:ring-blue-500 cursor-pointer form-checkbox"
              checked={sendToAll}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSendToAll(e.target.checked)}
            />
            <label htmlFor="sendToAll" className="text-gray-900 text-base font-medium select-none">
              Send to all users (leave Target User ID blank)
            </label>
          </div>
        </div> {/* End of scrollable content area */}

        {/* Action and Status Footer */}
        <div className="mt-auto pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            type="submit" // Changed to type="submit" for form
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg  transition duration-200  disabled:cursor-not-allowed"
            disabled={loading || !notificationTitle || !notificationBody || (!targetUserId && !sendToAll)}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
          <div className="text-center sm:text-right">
            <p className={`text-lg font-semibold ${status.startsWith('Error') ? 'text-red-400' : status.startsWith('Sent') ? 'text-green-400' : 'text-gray-400'}`}>
              Status: <span className="font-bold">{status}</span>
            </p>
            <div className="flex gap-6 mt-2 text-gray-400 text-sm sm:justify-end">
              <div>Success: <span className="font-bold text-green-400">{successCount}</span></div>
              <div>Failed: <span className="font-bold text-red-400">{failureCount}</span></div>
            </div>
          </div>
        </div>
      </form>
    </div>
            </div>

  );
};

export default NotificationSender;