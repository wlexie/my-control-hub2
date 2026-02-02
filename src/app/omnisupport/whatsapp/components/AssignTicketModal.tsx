"use client";

import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../../../utils/apiAuth'; // Adjust the import path as needed

// Initial empty state for data
const initialAgentsData = [];
const initialDepartments = ['All Departments'];

/**
 * A modal component for assigning a support ticket to an available agent.
 */
export default function AssignTicketModal({ isOpen, onClose, onAssign, ticketId }) {
  const [agents, setAgents] = useState(initialAgentsData);
  const [departments, setDepartments] = useState(initialDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedAgentId, setSelectedAgentId] = useState(null); // This will store the accountKey
  const [selectedAgentName, setSelectedAgentName] = useState(null); // This will store FirstName + LastName
  const [dueDate, setDueDate] = useState('');
  const [assignmentNote, setAssignmentNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const fetchAgents = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get('/account/system-users-requests');
          const data = response.data;

          // DEBUG LOG: Verify the incoming accountKey and Names
          console.log("1. Raw API Response for Agents:", data);

          // Filter only the roles allowed to handle tickets
          const filteredData = data.filter(user => 
            user.role && 
            ['OMNISUPPORT', 'SUPPORT AGENT',].includes(user.role.roleName)
          );

          const transformedAgents = filteredData.map(user => ({
            // We use accountKey as the ID because the assignment endpoint requires it
            id: user.accountKey, 
            name: `${user.firstName} ${user.lastName}`,
            department: user.department || 'Unassigned',
            // Display logic for status
            status: user.status === true ? 'Available' : 'Busy',
          }));

          console.log("2. Transformed Agents (using accountKey as id):", transformedAgents);

          setAgents(transformedAgents);

          const uniqueDepartments = [...new Set(transformedAgents.map(agent => agent.department))];
          setDepartments(['All Departments', ...uniqueDepartments]);

        } catch (e) {
          setError(e.message);
          console.error("❌ Failed to fetch agents:", e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchAgents();
    }
  }, [isOpen]);

  const availableAgents = useMemo(() => {
    if (selectedDepartment === 'All Departments') {
      return agents;
    }
    return agents.filter(agent => agent.department === selectedDepartment);
  }, [selectedDepartment, agents]);

  const handleAgentSelect = (agentId) => {
    setSelectedAgentId(agentId);
    const agent = agents.find(a => a.id === agentId);
    setSelectedAgentName(agent ? agent.name : null);
  };

  const handleAssignTicket = () => {
    if (!selectedAgentId) {
      alert('Please select an agent.');
      return;
    }
    if (!ticketId) {
      alert('Ticket ID is missing. Cannot assign.');
      return;
    }

    // This object matches your Swagger requirements: agentId, agentName, reason
    const assignmentDetails = {
      ticketId: ticketId,
      agentId: selectedAgentId,   // This is the accountKey
      agentName: selectedAgentName, // This is "First Last"
      reason: assignmentNote,      // Mapping internal note to "reason"
    };

    console.log("📤 Sending assignment details to API:", assignmentDetails);
    onAssign(assignmentDetails);
  };

  if (!isOpen) return null;

  const getStatusClass = (status) => {
    return status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Assign Ticket</h2>
            <p className="text-sm text-gray-500">Ticket ID: <span className='text-pink-600 font-bold'>#{ticketId}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1.5">
              Filter by Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Available Agents List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Select Agent
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {isLoading && (
                <div className="py-10 text-center text-gray-500 animate-pulse">
                  Fetching available agents...
                </div>
              )}
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
                  Error loading agents: {error}
                </div>
              )}
              {!isLoading && !error && availableAgents.length === 0 && (
                <div className="py-10 text-center text-gray-500 italic">
                  No agents found.
                </div>
              )}
              {!isLoading && !error && availableAgents.map((agent) => (
                <label
                  key={agent.id}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedAgentId === agent.id 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="agent"
                      value={agent.id}
                      checked={selectedAgentId === agent.id}
                      onChange={() => handleAgentSelect(agent.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-bold text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.department}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full ${getStatusClass(agent.status)}`}>
                    {agent.status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Assignment Note / Reason */}
            <div>
              <label htmlFor="assignment-note" className="block text-sm font-medium text-gray-700 mb-1.5">
                Assignment Reason (Required)
              </label>
              <textarea
                id="assignment-note"
                rows="3"
                value={assignmentNote}
                onChange={(e) => setAssignmentNote(e.target.value)}
                placeholder="e.g. Needs Admin Assistance"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 space-x-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignTicket}
            disabled={!selectedAgentId || !assignmentNote.trim()}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Assign Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

AssignTicketModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  ticketId: PropTypes.string,
};