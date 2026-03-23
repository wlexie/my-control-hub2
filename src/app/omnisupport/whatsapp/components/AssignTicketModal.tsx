"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, UserCheck, ShieldCheck, Loader2, AlertCircle, Users, Building2 } from 'lucide-react';
import api from '../../../../utils/apiAuth';

// --- TypeScript Interfaces ---
interface Role {
  roleKey: string;
  roleName: string;
}

interface UserApiResponse {
  id: number;
  userKey: string;
  accountKey: string | null;
  firstName: string;
  lastName: string;
  department: string | null;
  status: boolean;
  role?: Role;
}

interface Agent {
  id: string; 
  name: string;
  departmentKey: string;
  departmentDisplay: string;
  status: 'Available' | 'Busy';
  roleName: string;
}

interface AssignmentDetails {
  ticketId: string;
  agentId: string;
  agentName: string;
  reason: string;
}

interface AssignTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (details: AssignmentDetails) => void;
  ticketId: string;
}

export default function AssignTicketModal({ isOpen, onClose, onAssign, ticketId }: AssignTicketModalProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<string[]>(['All Departments']);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [assignmentNote, setAssignmentNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAgents = async () => {
        setIsLoading(true);
        setError(null);
        try {
          /** 
           * SHOTGUN APPROACH FOR PAGINATION: 
           * We send all common keys in case the backend uses one specifically
           */
          const response = await api.get('/account/system-users-requests', {
            params: {
              limit: 100,
              pageSize: 100,
              per_page: 100,
              size: 100,
              page: 1 // Sometimes page is required for limit to work
            }
          });

          // Some APIs wrap the array in a "data" or "users" field if paginated
          let rawData: UserApiResponse[] = [];
          
          if (Array.isArray(response.data)) {
            rawData = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            rawData = response.data.data;
          } else if (response.data && Array.isArray(response.data.users)) {
            rawData = response.data.users;
          }

          console.log(`FETCHED ${rawData.length} USERS FROM API`);

          // 1. Role Filter: STRICT (Admin, Support Agent, Omnisupport)
          const filteredData = rawData.filter((user) => {
            if (!user.accountKey || !user.role) return false;
            const role = user.role.roleName.toUpperCase().trim();
            return ['ADMIN', 'SUPPORT AGENT', 'OMNISUPPORT'].includes(role);
          });

          // 2. Transform & Normalize
          const transformedAgents: Agent[] = filteredData.map((user) => {
            const rawDept = user.department ? user.department.trim() : 'General';
            const fName = user.firstName ? user.firstName.trim() : "";
            const lName = (user.lastName === "." || !user.lastName) ? "" : user.lastName.trim();

            return {
              id: user.accountKey as string,
              name: `${fName} ${lName}`.trim(),
              departmentKey: rawDept.toUpperCase(), 
              departmentDisplay: rawDept,
              status: user.status ? 'Available' : 'Busy',
              roleName: user.role?.roleName || 'Agent'
            };
          });

          setAgents(transformedAgents);

          // 3. Dynamic Department List (Unique names)
          const deptMap = new Map();
          transformedAgents.forEach(a => {
            if (!deptMap.has(a.departmentKey)) {
              deptMap.set(a.departmentKey, a.departmentDisplay);
            }
          });

          const uniqueDepts = Array.from(deptMap.values()).sort();
          setDepartments(['All Departments', ...uniqueDepts]);

        } catch (e: any) {
          setError(e.response?.data?.message || e.message || "Failed to load agents");
        } finally {
          setIsLoading(false);
        }
      };

      fetchAgents();
    }
  }, [isOpen]);

  const availableAgents = useMemo(() => {
    return agents.filter(agent => 
      selectedDepartment === 'All Departments' || agent.departmentDisplay === selectedDepartment
    );
  }, [selectedDepartment, agents]);

  const handleAssignTicket = () => {
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    if (!selectedAgent || !selectedAgentId) return;

    onAssign({
      ticketId,
      agentId: selectedAgentId,
      agentName: selectedAgent.name,
      reason: assignmentNote,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Assign Ticket</h2>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                Ref: {ticketId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-grow">
          
          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={12} /> Filter Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-14 px-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all cursor-pointer text-slate-700"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Directory */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={12} /> Eligible Personnel ({availableAgents.length})
            </label>
            
            <div className="grid grid-cols-1 gap-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Loader2 className="animate-spin mb-4 text-blue-600" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Accessing Directory...</span>
                </div>
              ) : availableAgents.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400 text-sm font-bold italic">
                  No agents matched your current filter.
                </div>
              ) : (
                availableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer ${
                      selectedAgentId === agent.id 
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                        : 'border-slate-50 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-3.5 rounded-2xl shadow-sm transition-all duration-300 ${
                        selectedAgentId === agent.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {agent.roleName.toUpperCase().includes('ADMIN') ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
                      </div>
                      <div>
                        <h4 className={`text-base font-black tracking-tight ${selectedAgentId === agent.id ? 'text-blue-900' : 'text-slate-800'}`}>
                          {agent.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tight ${
                            agent.departmentKey === 'FINANCE' ? 'bg-amber-100 text-amber-700' : 
                            agent.departmentKey.includes('SUPPORT') ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {agent.departmentDisplay}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{agent.roleName}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`h-3 w-3 rounded-full border-2 border-white ring-2 ring-transparent ${agent.status === 'Available' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Reason for assignment</label>
            <textarea
              rows={3}
              value={assignmentNote}
              onChange={(e) => setAssignmentNote(e.target.value)}
              placeholder="Provide context..."
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-400 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignTicket}
            disabled={!selectedAgentId || !assignmentNote.trim() || isLoading}
            className="flex-1 px-4 py-4 text-xs font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            Assign Ticket
          </button>
        </div>
      </div>
    </div>
  );
}