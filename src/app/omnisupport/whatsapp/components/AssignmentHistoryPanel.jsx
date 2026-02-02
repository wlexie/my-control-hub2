import React from 'react';
import { X, Clock } from 'lucide-react';

const AssignmentHistoryPanel = ({ isOpen, onClose, history = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b bg-white flex items-center justify-between">
          <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">
            Assignment & Participation
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X size={20}/>
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-10">
            {/* We show history. History from your API is newest first. 
                We reverse it to show the "First Agent" at the top of the timeline. */}
            {[...history].reverse().map((item, idx) => {
              const isFirst = !item.previousAgentName;
              
              return (
                <div key={idx} className="relative ml-8">
                  {/* Timeline Indicator (Dot) */}
                  <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-slate-50 shadow-sm 
                    ${isFirst ? 'bg-indigo-600' : 'bg-emerald-500'}`} 
                  />
                  
                  {/* Header Row: Action + Date */}
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">
                      {isFirst ? `First Agent: ${item.newAgentName}` : `Handover to ${item.newAgentName}`}
                    </h4>
                    <span className="text-xs text-slate-400 font-semibold">
                      {new Date(item.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  {/* Time Row */}
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-4 font-medium">
                    <Clock size={12} />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>

                  {/* Reason Box */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-2">
                      Reason for handover:
                    </p>
                    <p className="text-sm text-slate-600 italic font-medium leading-relaxed">
                      "{item.reason || 'No specific reason provided'}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {history.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm italic">
              No assignment history recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentHistoryPanel;