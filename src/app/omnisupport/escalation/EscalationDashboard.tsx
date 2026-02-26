"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  RefreshCcw,
  User,
  AlertTriangle
} from 'lucide-react';

// 1. Define the Interface to match your Spring Boot Entity
interface Escalation {
  id: number;
  ticketNumber: string;
  reason: string;
  priority: string;
  escalateTo: string;
  assignedBy: string;
  notes: string;
  status: 'UNRESOLVED' | 'RESOLVED';
  createdAt: string;
  resolvedAt: string | null;
  timeTaken: string | null;
}

const EscalationDashboard: React.FC = () => {
  // 2. Typed State
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const API_BASE_URL = 'https://com.tuma-app.com/api/escalations';

  // 3. Fetch Data with Authorization Header
  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Adjust based on where you store your JWT
      
      const response = await axios.get<Escalation[]>(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Sort: Unresolved first, then by ID descending
      const sortedData = response.data.sort((a, b) => {
        if (a.status === b.status) return b.id - a.id;
        return a.status === 'UNRESOLVED' ? -1 : 1;
      });

      setEscalations(sortedData);
    } catch (error) {
      console.error("Error fetching escalations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (id: number) => {
    if (!window.confirm("Mark this ticket as Resolved?")) return;
    
    setResolvingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEscalations();
    } catch (error) {
      alert("Failed to resolve ticket. Check console for details.");
    } finally {
      setResolvingId(null);
    }
  };

  const filteredEscalations = escalations.filter(e => 
    e.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.assignedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.escalateTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Escalation Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and resolve system escalations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search ticket, agent or target..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-72 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchEscalations}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin text-blue-500" : "text-gray-600"} />
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full"><Clock size={24}/></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Waiting Resolution</p>
                    <p className="text-2xl font-black text-gray-800">{escalations.filter(e => e.status === 'UNRESOLVED').length}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><CheckCircle size={24}/></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Resolved Today</p>
                    <p className="text-2xl font-black text-gray-800">{escalations.filter(e => e.status === 'RESOLVED').length}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full"><AlertTriangle size={24}/></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">High Priority</p>
                    <p className="text-2xl font-black text-gray-800">{escalations.filter(e => e.priority?.toLowerCase() === 'high' && e.status === 'UNRESOLVED').length}</p>
                </div>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ticket Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Participants</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Priority & Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Notes</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Resolution</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEscalations.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block text-sm">
                        {item.ticketNumber}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 font-medium">
                        Opened: {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <User size={12} className="text-gray-400"/>
                            <span className="font-semibold">{item.assignedBy}</span>
                        </div>
                        <div className="text-xs text-gray-400">Escalated to: <span className="text-gray-600 font-bold">@{item.escalateTo}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border w-fit ${getPriorityStyle(item.priority)}`}>
                        {item.priority.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'RESOLVED' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></span>
                            <span className={`text-xs font-bold ${item.status === 'RESOLVED' ? 'text-green-600' : 'text-orange-600'}`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs italic">
                        "{item.notes || 'No notes'}"
                    </p>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                    {item.timeTaken ? (
                        <div className="flex items-center gap-1 text-green-600">
                             <Clock size={14}/> {item.timeTaken}
                        </div>
                    ) : (
                        <span className="text-gray-300 italic text-xs tracking-tight">Awaiting fix...</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    {item.status === 'UNRESOLVED' ? (
                      <button 
                        onClick={() => handleResolve(item.id)}
                        disabled={resolvingId === item.id}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:bg-gray-300"
                      >
                        {resolvingId === item.id ? "Processing..." : "Resolve Ticket"}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                         Archived
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEscalations.length === 0 && !loading && (
            <div className="py-20 text-center">
                <Search size={48} className="mx-auto text-gray-200 mb-4"/>
                <p className="text-gray-400 font-medium">No escalation records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscalationDashboard;