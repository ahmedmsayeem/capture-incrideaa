import React, { useState, useEffect } from 'react';
import { api } from '~/utils/api';
import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';

const ManageRoles = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'smc' | 'editor' | 'user'>('user');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const auditLogMutation = api.audit.log.useMutation();
  const { data: session } = useSession();
  const { data: usersData, refetch } = api.user.getAllUsers.useQuery();
  const changeRoleMutation = api.user.changeUserRole.useMutation({
    onSuccess: () => {
      refetch();
      setIsPopupOpen(false);
    },
  });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  const handleChangeRole = async () => {
    if (selectedUserId) {
      try {
        await changeRoleMutation.mutateAsync({ userId: selectedUserId, role: newRole });
        await auditLogMutation.mutateAsync({
          sessionUser: session?.user.name || "Invalid User", //Invalid user is not reachable
          description: `RoleManagementAudit - ${session?.user.name} has changed the role of ${selectedUserName} to ${newRole}`,
        });
      } catch (error) {
        console.error("Error changing role", error);
      }
    }
  };
  

  return (
    <div className="p-4">
      <h1 className="flex justify-center text-6xl font-Hunters mb-8 py-5 text-center">Manage Roles</h1>
      <table className="min-w-full border border-gray-300 bg-black">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Name</th>
            <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Email</th>
            <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Role</th>
            <th className="text-black border border-gr py-2 px-4 border-b border-slate-700 text-center">Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="py-2 px-4 border-b border-slate-700 text-center">{user.name}</td>
              <td className="py-2 px-4 border-b border-slate-700 text-center">{user.email}</td>
              <td className="py-2 px-4 border-b border-slate-700 text-center">{user.role}</td>
              <td className="py-2 px-4 border-b border-slate-700 text-center">
                <button 
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedUserName(user.name);
                    setNewRole(user.role);  // Set the default role to the user's current role
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

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur z-50">
          <div className="bg-black p-10 rounded-3xl shadow-lg relative text-center w-96">
            <h2 className="text-2xl font-bold text-white mb-4">Select New Role</h2>
            <select 
              className="w-full p-2 border rounded mb-4 bg-black text-white"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'manager' | 'editor' | 'user')}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="editor">Editor</option>
              <option value="smc">SMC</option>
              <option value="user">User</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleChangeRole}
              >
                Submit
              </button>
              <button 
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setIsPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
