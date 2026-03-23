"use client";

import React, { useState, FormEvent } from 'react'; // Removed ChangeEvent
import api from '../../../../utils/apiService'; 
import axios from 'axios';
import { Bell, Send, User, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ApiResponse {
  status: string | number;
  message?: string;
  successCount?: number;
  failureCount?: number;
}

interface NotificationPayload {
  notificationTitle: string;
  notificationBody: string;
  targetUserId?: string;
}

const NotificationSender: React.FC = () => {
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationBody, setNotificationBody] = useState<string>('');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [sendToAll, setSendToAll] = useState<boolean>(false);
  
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  
  const [counts, setCounts] = useState({ success: 0, failure: 0 });

  const handleSendNotification = async (e: FormEvent) => {
    e.preventDefault();

    setStatus({ type: 'loading', message: 'Sending notifications...' });
    setCounts({ success: 0, failure: 0 });

    const payload: NotificationPayload = {
      notificationTitle,
      notificationBody,
    };

    if (!sendToAll && targetUserId) {
      payload.targetUserId = targetUserId;
    }

    try {
      const response = await api.post<ApiResponse>('/account/send-app-notification-to-all', payload);

      if (response.data.status === '200' || response.status === 200) {
        setStatus({ 
          type: 'success', 
          message: response.data.message || 'Notifications dispatched successfully!' 
        });
        setCounts({
          success: response.data.successCount || 0,
          failure: response.data.failureCount || 0
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to connect to the server.';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }

      setStatus({ type: 'error', message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 p-2 rounded-lg text-white">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Notification Center</h2>
          </div>
          <p className="text-slate-400 text-sm font-medium">Push real-time updates to your application users.</p>
        </div>

        <form onSubmit={handleSendNotification} className="p-8">
          <div className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Notification Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium"
                placeholder="e.g. System Maintenance Update"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                required
              />
            </div>

            {/* Body Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Message Body</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-slate-900 font-medium resize-none"
                placeholder="What would you like to say?"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                required
              />
            </div>

            {/* Targeting Section */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 font-bold text-slate-700 text-xs uppercase tracking-widest">
                  <Users size={14} className="text-slate-400" />
                  Target Audience
                </label>
                
                <div className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="sendToAll"
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={sendToAll}
                    onChange={(e) => setSendToAll(e.target.checked)}
                  />
                  <label htmlFor="sendToAll" className="text-xs font-bold text-slate-600 select-none cursor-pointer">Send to all users</label>
                </div>
              </div>

              {!sendToAll && (
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold shadow-sm"
                    placeholder="Specific User ID (ysid_...)"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {status.type !== 'idle' && (
            <div className={`mt-6 p-5 rounded-2xl flex items-start gap-4 ${
              status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 
              status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
              'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {status.type === 'loading' ? <Loader2 className="w-5 h-5 animate-spin mt-0.5" /> :
               status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5" /> :
               <AlertCircle className="w-5 h-5 mt-0.5" />}
              <div>
                <p className="text-sm font-bold tracking-tight">{status.message}</p>
                {status.type === 'success' && (
                  <div className="flex gap-4 mt-2 text-[10px] font-black uppercase tracking-widest opacity-70">
                    <span>Success: {counts.success}</span>
                    <span>Failed: {counts.failure}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={status.type === 'loading' || !notificationTitle || !notificationBody || (!targetUserId && !sendToAll)}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {status.type === 'loading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Dispatch Notification
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationSender;