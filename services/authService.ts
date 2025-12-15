
import { User, Role } from '../types';
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyDRQFJDaXTFcnYIYEn6ffqmMjleDTR8hug",
  authDomain: "professionalailogin.firebaseapp.com",
  projectId: "professionalailogin",
  storageBucket: "professionalailogin.firebasestorage.app",
  messagingSenderId: "17832503100",
  appId: "1:17832503100:web:16f4a52421fe09ba586039",
  measurementId: "G-J2QRGND48N"
};

// Initialize Firebase
let db: any;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const COLLECTION_NAME = 'users';

export const authService = {
  /**
   * Login using Firestore Query
   */
  login: async (username: string, pass: string): Promise<User | null> => {
    try {
      if (!db) throw new Error("Database connection failed. Please check your internet connection.");
      
      const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;

      let foundUser: User | null = null;
      let docRefId = '';

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        // In a real app, password should be hashed. Here we check plain text as per request.
        if (data.password === pass) {
           foundUser = { id: doc.id, ...data } as User;
           docRefId = doc.id;
        }
      });

      if (foundUser) {
        const u = foundUser as User;
        if (!u.isActive) throw new Error("Account is inactive.");
        if (u.expiryDate && new Date(u.expiryDate) < new Date()) {
          throw new Error("Account expired.");
        }

        // Generate Session Token & Update DB to invalidate other sessions if needed, 
        // or just track this session.
        const token = `sess-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        await updateDoc(doc(db, COLLECTION_NAME, docRefId), {
            sessionToken: token
        });
        
        u.sessionToken = token;
        return u;
      }
      return null;

    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  /**
   * Syncs user from Link (Cross-device support via Cloud)
   */
  loginViaShareLink: async (username: string, pass: string, expiryDate?: string): Promise<User | null> => {
     if (!db) throw new Error("Database connection failed.");
     
     // 1. Check if user exists
     const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
     const querySnapshot = await getDocs(q);

     if (querySnapshot.empty) {
        // 2. Create User if not exists (Auto Provisioning)
        const newUser = {
            username,
            password: pass,
            role: Role.MEMBER,
            isActive: true,
            expiryDate: expiryDate && expiryDate !== 'undefined' ? expiryDate : null,
            sessionToken: ''
        };
        await addDoc(collection(db, COLLECTION_NAME), newUser);
     } else {
        // 3. Update User if exists (Sync)
        const docRef = querySnapshot.docs[0].ref;
        const updates: any = { password: pass, isActive: true }; // Force active
        if (expiryDate && expiryDate !== 'undefined') {
            updates.expiryDate = expiryDate;
        }
        await updateDoc(docRef, updates);
     }

     // 4. Perform Login
     return authService.login(username, pass);
  },

  getAllUsers: async (): Promise<User[]> => {
    if (!db) return [];
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const users: User[] = [];
    querySnapshot.forEach((doc: any) => {
       const d = doc.data();
       // Exclude password from UI object if possible, but we need it for sharing logic in this specific app design
       users.push({ id: doc.id, ...d } as User);
    });
    return users;
  },

  addUser: async (username: string, pass: string, expiryDate?: string) => {
    if (!db) throw new Error("Database connection failed.");
    // Check duplicate
    const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) throw new Error("User exists");

    const newUser = {
      username,
      password: pass, // Storing plain text as requested for sharing feature
      role: Role.MEMBER,
      isActive: true,
      expiryDate: expiryDate || null
    };

    await addDoc(collection(db, COLLECTION_NAME), newUser);
  },

  deleteUser: async (username: string) => {
    if (!db) return;
    if (username === 'admin') return; // Protect admin
    const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d: any) => {
        await deleteDoc(d.ref);
    });
  },

  updatePassword: async (username: string, newPass: string) => {
    if (!db) return;
    const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (d: any) => {
        // Update password AND clear session token to force logout elsewhere
        await updateDoc(d.ref, { 
            password: newPass,
            sessionToken: null 
        });
    });
  },

  toggleStatus: async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    const userRef = doc(db, COLLECTION_NAME, userId);
    const newStatus = !currentStatus;
    // Update status AND clear session token if banning
    await updateDoc(userRef, { 
        isActive: newStatus,
        sessionToken: newStatus ? undefined : null // If active, keep token (undefined usually ignored in update), if ban, clear it
    });
  },

  getPassword: async (username: string): Promise<string> => {
     if (!db) return '';
     const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
     const snapshot = await getDocs(q);
     if (!snapshot.empty) {
         return snapshot.docs[0].data().password;
     }
     return '';
  },

  // Real-time Listener for App.tsx
  listenToUserSession: (userId: string, callback: (data: any) => void) => {
      if (!db) return () => {};
      return onSnapshot(doc(db, COLLECTION_NAME, userId), (doc: any) => {
          if (doc.exists()) {
              callback(doc.data());
          } else {
              callback(null); // User deleted
          }
      });
  }
};
