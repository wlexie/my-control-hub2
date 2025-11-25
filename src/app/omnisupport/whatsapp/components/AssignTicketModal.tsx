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
export default function AssignTicketModal({ isOpen, onClose, onAssign, ticketId }) { // Destructure ticketId
  const [agents, setAgents] = useState(initialAgentsData);
  const [departments, setDepartments] = useState(initialDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [selectedAgentName, setSelectedAgentName] = useState(null); // New state for agent name
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

        // Filter only the roles you want
        const filteredData = data.filter(user => 
          user.role && 
          ['ADMIN', 'OMNISUPPORT', 'SUPPORT AGENT'].includes(user.role.roleName)
        );

        const transformedAgents = filteredData.map(user => ({
          id: user.id.toString(),
          name: `${user.firstName} ${user.lastName}`,
          department: user.department || 'Unassigned',
          activeTickets: Math.floor(Math.random() * 5) + 1,
          status: user.status ? 'Available' : 'Busy',
        }));

        setAgents(transformedAgents);

        const uniqueDepartments = [...new Set(transformedAgents.map(agent => agent.department))];
        setDepartments(['All Departments', ...uniqueDepartments]);

      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch agents:", e);
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

  // Handle agent selection to also store their name
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
    if (!ticketId) { // Check if ticketId is available
      alert('Ticket ID is missing. Cannot assign.');
      return;
    }

    const assignmentDetails = {
      ticketId: ticketId, // Include the ticketId
      agentId: selectedAgentId,
      agentName: selectedAgentName, // Include the selected agent's name
      dueDate, // This might not be used by your specific API endpoint, but good to pass if needed later
      note: assignmentNote,
    };
    onAssign(assignmentDetails);
    // onClose(); // Let the onAssign callback in Conversation.js handle closing the modal after API success
  };

  if (!isOpen) {
    return null;
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Busy':
      case 'Offline': // Assuming 'Busy' or 'Offline' for yellow
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">Assign Ticket <span className='text-pink-500 text-base ml-1'>#{ticketId}</span></h2> {/* Display ticketId */}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Available Agents List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Agents
            </label>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {isLoading && <p className="text-gray-500">Loading agents...</p>}
              {error && <p className="text-red-500">Error: {error}</p>}
              {!isLoading && !error && availableAgents.map((agent) => (
                <label
                  key={agent.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAgentId === agent.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="agent"
                      value={agent.id}
                      checked={selectedAgentId === agent.id}
                      onChange={() => handleAgentSelect(agent.id)} // Use new handler
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-sm text-gray-500">
                        {agent.department} &middot; Active Tickets: {agent.activeTickets}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(agent.status)}`}>
                    {agent.status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="due-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Assignment Note */}
          <div>
            <label htmlFor="assignment-note" className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Note
            </label>
            <textarea
              id="assignment-note"
              rows="4"
              value={assignmentNote}
              onChange={(e) => setAssignmentNote(e.target.value)}
              placeholder="Add any specific instructions or context..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 space-x-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignTicket}
            className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
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