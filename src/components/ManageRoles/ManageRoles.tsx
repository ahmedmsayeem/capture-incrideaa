import React, { useState, useEffect } from 'react';
import { api } from '~/utils/api';
import { User } from '@prisma/client';
import ScrollableContainer from '../ScrollableDiv';
import SearchInput from '../ui/search-input';
import { ChangeRolePopUP } from './changeRolePopup';

/**
 * Role type definition for user management
 * Possible values: 'admin' | 'manager' | 'smc' | 'editor' | 'user'
 */
type Role = 'admin' | 'manager' | 'smc' | 'editor' | 'user';

/**
 * ManageRoles Component
 * Provides interface for managing user roles with search and filtering capabilities
 */
const ManageRoles = () => {
  // State management for users and UI controls
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch users data
  const { data: usersData, refetch } = api.user.getAllUsers.useQuery();

  // Update users when data is fetched
  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
      setFilteredUsers(usersData);
    }
  }, [usersData]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter((user) => {
          return (
            (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        })
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Calculate role counts
  const roleCounts: { [key in Role]: number } = users.reduce((counts, user) => {
    if (user.role) {
      counts[user.role] = (counts[user.role] || 0) + 1;
    }
    return counts;
  }, {} as { [key in Role]: number });

  return (
    <div className="p-4">
      {/* Header Section */}
      <h1 className="flex justify-center text-4xl font-Teknaf mb-8 py-5 text-center">
        Manage Roles
      </h1>

      {/* Dashboard Grid Layout */}
      <div className='dashboard-grid'>
        {/* Search Input */}
        <SearchInput
          type="text"
          placeholder="Search..."
          className="dashboard-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Role Count Display */}
        <div className="dashboard-controls flex flex-col gap-2 w-full justify-start md:items-center sitems-start">
          <div className='flex flex-row md:flex-col gap-2'>
            <div className="text-white text-center border-slate-700 border p-2 rounded-3xl w-28"> Admin-{roleCounts['admin'] || 0}</div>
            <div className="text-white text-center border-slate-700 border p-2 rounded-3xl w-28">Manager-{roleCounts['manager'] || 0} </div>
          </div>
          <div className='flex flex-row md:flex-col gap-2'>
            <div className="text-white text-center border-slate-700 border p-2 rounded-3xl w-28">Editor-{roleCounts['editor'] || 0} </div>
            <div className="text-white text-center border-slate-700 border p-2 rounded-3xl w-28">SMC-{roleCounts['smc'] || 0} </div>
          </div>
          <div className="text-white text-center border-slate-700 border p-2 rounded-3xl w-28">Users-{roleCounts['user'] || 0} </div>
        </div>

        {/* Users Table */}
        <ScrollableContainer className='dashboard-table'>
          <table className="min-w-full border border-gray-300 bg-neutral-950 font-Trap-Regular text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Name</th>
                <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Email</th>
                <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Role</th>
                <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-center hover:bg-gray-800/90">
                  <td className="py-2 px-4 border-b border-slate-700 text-center">{user.name}</td>
                  <td className="py-2 px-4 border-b border-slate-700 text-center">{user.email}</td>
                  <td className="py-2 px-4 border-b border-slate-700 text-center">{user.role}</td>
                  <td className="py-2 px-4 border-b border-slate-700 text-center">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsPopupOpen(true);
                      }}
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableContainer>
      </div>

      {/* Role Change Popup */}
      {isPopupOpen && (
        <ChangeRolePopUP 
          isOpen={isPopupOpen} 
          onClose={() => setIsPopupOpen(false)} 
          userId={selectedUserId!} 
        />
      )}
    </div>
  );
};

export default ManageRoles;
