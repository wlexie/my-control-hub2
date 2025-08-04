import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../utils/apiAuth'; // Adjust this path if necessary
import CreateRoleModal from './CreateRole';   // Adjust this path if necessary

// Define the type for a single role object for type safety
interface Role {
  roleKey: string;
  name: string;
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect hook to fetch data when the component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get<Role[]>('/role/roles');
        console.log('Fetched Roles:', response.data);
        setRoles(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(`Failed to fetch roles: ${err.message}`);
        } else {
          setError('An unexpected error occurred.');
        }
        console.error("Error fetching roles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to handle the delete action
  const handleDelete = async (roleToDelete: Role) => {
    // Confirm the action with the user
    if (!window.confirm(`Are you sure you want to delete the "${roleToDelete.name}" role?`)) {
      return; // Stop if the user cancels
    }

    try {
      // Make the API call to the delete endpoint
      // Note: The endpoint URL `/role/roles/${roleToDelete.roleKey}` is a standard RESTful pattern.
      // You may need to adjust this based on your actual API.
      await api.delete(`/role/roles/${roleToDelete.roleKey}`);
      
      // On success, update the UI by removing the role from the state
      setRoles(currentRoles => currentRoles.filter(role => role.roleKey !== roleToDelete.roleKey));
      console.log(`Successfully deleted role: ${roleToDelete.name}`);
      
    } catch (err) {
      // On failure, log the error and notify the user
      console.error(`Failed to delete role ${roleToDelete.name}:`, err);
      alert(`Failed to delete role: ${roleToDelete.name}. See console for details.`);
    }
  };

  // Callback function to add the new role to the state after it's created in the modal
  const handleRoleCreated = (newRole: Role) => {
    // Add the new role to the existing list for an instant UI update
    setRoles(currentRoles => [...currentRoles, newRole]);
  };

  // Conditional rendering for the loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Conditional rendering for the error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  // Main component render
  return (
    <>
      <div className="md:p-12 p-4 bg-gray-50 min-h-screen">
        <div className="max-w-7xl">
          {/* Header section with Title and Add Role button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">User Access Roles</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
            >
              Add Role
            </button>
          </div>

          {/* Table container */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Role Name</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Role Key</th>
                    <th scope="col" className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {roles.map((role, index) => (
                    <tr key={role.roleKey} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{role.name}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono">{role.roleKey}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(role)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Render the modal component, controlled by state */}
      <CreateRoleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleCreated={handleRoleCreated}
      />
    </>
  );
};

export default Roles;