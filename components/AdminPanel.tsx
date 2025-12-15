
import React, { useState, useEffect } from 'react';
import { User, Language, DICTIONARY, Role } from '../types';
import { authService } from '../services/authService';

interface AdminPanelProps {
  user: User;
  lang: Language;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, lang, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [expiry, setExpiry] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setUsers(authService.getAllUsers());
  }, []);

  const t = DICTIONARY[lang];

  const handleAddUser = () => {
    try {
      if (!newUsername || !newPassword) {
         setMsg('Username and Password required');
         return;
      }
      
      let expiryDateStr = undefined;
      if (expiry) {
        // Fix: Set expiry to the END of the selected day (23:59:59)
        const d = new Date(expiry);
        d.setHours(23, 59, 59, 999);
        expiryDateStr = d.toISOString();
      }

      authService.addUser(newUsername, newPassword, expiryDateStr);
      setUsers(authService.getAllUsers());
      setMsg('User added successfully');
      setNewUsername('');
      setNewPassword('');
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const handleChangePassword = (username: string) => {
    const newPass = prompt(`Enter new password for ${username}:`);
    if (newPass) {
      authService.updatePassword(username, newPass);
      setMsg(`Password updated for ${username}`);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = authService.toggleStatus(id);
    setUsers(updated);
  };

  const handleDelete = (username: string) => {
    if (confirm(t.confirmDelete)) {
        const updated = authService.deleteUser(username);
        setUsers(updated);
        setMsg(`Deleted ${username}`);
    }
  };

  const handleShare = (u: User) => {
      const pass = authService.getPassword(u.username);
      // Create auto-login link
      // Use origin + pathname to get the clean base URL (no queries, no hash)
      const baseUrl = window.location.origin + window.location.pathname;
      const expiryParam = u.expiryDate ? `&e=${encodeURIComponent(u.expiryDate)}` : '';
      const loginLink = `${baseUrl}?u=${encodeURIComponent(u.username)}&p=${encodeURIComponent(pass)}${expiryParam}`;
      
      const shareText = `Professional AI Access\nLink: ${loginLink}\n\nID: ${u.username}\nPass: ${pass}\nValid until: ${u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'Forever'}`;
      
      navigator.clipboard.writeText(shareText);
      alert("Auto-login link & details copied to clipboard!");
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-brand-panel w-full max-w-5xl rounded-xl p-6 shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-brand-blue font-bold">{t.adminPanel}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Create User */}
        <div className="bg-black/20 p-4 rounded mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">{t.addUser}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              placeholder={t.username}
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white focus:border-brand-blue outline-none"
            />
            <input 
              type="password"
              placeholder={t.password}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white focus:border-brand-blue outline-none"
            />
            <input 
              type="date"
              placeholder={t.expiry}
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="p-2 bg-brand-dark border border-gray-600 rounded text-white focus:border-brand-blue outline-none"
            />
            <button onClick={handleAddUser} className="bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg">
              {t.addUser}
            </button>
          </div>
          {msg && <p className="mt-2 text-brand-blue">{msg}</p>}
        </div>

        {/* List Users */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Expiry</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white font-medium">{u.username}</td>
                  <td className="p-3 text-sm text-gray-300">{u.role}</td>
                  <td className="p-3 text-sm text-gray-300">
                    {u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'Lifetime'}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded font-bold ${u.isActive ? 'bg-green-900/60 text-green-300 border border-green-800' : 'bg-red-900/60 text-red-300 border border-red-800'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    {u.role !== Role.ADMIN && (
                      <>
                        <button onClick={() => handleChangePassword(u.username)} className="text-xs bg-blue-900/60 text-blue-200 border border-blue-800 px-3 py-1.5 rounded hover:bg-blue-800 transition-colors">Pass</button>
                        <button onClick={() => handleToggleStatus(u.id)} className="text-xs bg-yellow-900/60 text-yellow-200 border border-yellow-800 px-3 py-1.5 rounded hover:bg-yellow-800 transition-colors">Ban</button>
                        <button onClick={() => handleDelete(u.username)} className="text-xs bg-red-900/60 text-red-200 border border-red-800 px-3 py-1.5 rounded hover:bg-red-800 transition-colors">{t.deleteUser}</button>
                        <button onClick={() => handleShare(u)} className="text-xs bg-purple-900/60 text-purple-200 border border-purple-800 px-3 py-1.5 rounded hover:bg-purple-800 transition-colors flex items-center gap-1">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
                             </svg>
                             {t.shareId}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
