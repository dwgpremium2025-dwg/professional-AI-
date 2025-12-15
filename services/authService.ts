
import { User, Role } from '../types';

// Simulating Firebase Database with LocalStorage
const STORAGE_KEY = 'perpect_ai_users';

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  username: 'admin',
  role: Role.ADMIN,
  isActive: true
};

// Initial setup
const initDB = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Seed with admin and one test user
    const initialUsers = [
      DEFAULT_ADMIN,
      {
        id: 'user-001',
        username: 'member1',
        role: Role.MEMBER,
        isActive: true,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
    
    // Initial creds setup
    localStorage.setItem('perpect_ai_creds', JSON.stringify({
      'admin': '1234',
      'member1': '123456'
    }));
  } else {
    // Ensure admin password is consistent (for dev/demo purposes)
    // In a real app, we wouldn't reset this on reload.
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    if (!creds['admin']) {
        creds['admin'] = '1234';
        localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    }
  }
};

initDB();

export const authService = {
  login: (username: string, pass: string): User | null => {
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    if (creds[username] === pass) {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const userIndex = users.findIndex((u: User) => u.username === username);
      
      if (userIndex !== -1) {
        const user = users[userIndex];
        if (!user.isActive) throw new Error("Account is inactive.");
        if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
          throw new Error("Account expired.");
        }

        // Generate Session Token
        const token = `sess-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        users[userIndex].sessionToken = token;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        
        return users[userIndex];
      }
    }
    return null;
  },

  getAllUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  addUser: (username: string, pass: string, expiryDate?: string) => {
    const users = authService.getAllUsers();
    if (users.find(u => u.username === username)) throw new Error("User exists");

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      role: Role.MEMBER,
      isActive: true,
      expiryDate
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    creds[username] = pass;
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    
    return newUser;
  },

  deleteUser: (username: string) => {
    const users = authService.getAllUsers();
    // Cannot delete admin
    if (username === 'admin') return users;

    const newUsers = users.filter(u => u.username !== username);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsers));

    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    delete creds[username];
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    
    return newUsers;
  },

  updatePassword: (username: string, newPass: string) => {
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    creds[username] = newPass;
    localStorage.setItem('perpect_ai_creds', JSON.stringify(creds));
    
    // Invalidate existing sessions by clearing the token
    const users = authService.getAllUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx !== -1) {
        users[idx].sessionToken = undefined; // Clear token
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  },

  toggleStatus: (userId: string) => {
    const users = authService.getAllUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1 && users[idx].role !== Role.ADMIN) {
      users[idx].isActive = !users[idx].isActive;
      // Also invalidate session if banning
      if (!users[idx].isActive) {
          users[idx].sessionToken = undefined;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  },

  validateSession: (username: string, token?: string): boolean => {
    if (!token) return false;
    const users = authService.getAllUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) return false;
    if (!user.isActive) return false;
    if (user.expiryDate && new Date(user.expiryDate) < new Date()) return false;
    
    // Check if the token provided matches the one in DB
    // If admin changed password or banned user, DB token would be different or null
    return user.sessionToken === token;
  },

  // Helper for Admin to get password for sharing link
  getPassword: (username: string): string => {
    const creds = JSON.parse(localStorage.getItem('perpect_ai_creds') || '{}');
    return creds[username] || '';
  }
};
