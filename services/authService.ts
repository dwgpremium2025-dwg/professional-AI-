
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

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

/**
 * HELPER: Deeply cleans an object to remove 'undefined' values, 
 * replacing them with 'null' which Firestore accepts.
 * This fixes the "Unsupported field value: undefined" error.
 */
const cleanData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (typeof data !== 'object') return data;
    if (data instanceof Date) return data;

    if (Array.isArray(data)) {
        return data.map(item => cleanData(item));
    }

    const cleaned: any = {};
    Object.keys(data).forEach(key => {
        const value = data[key];
        if (value === undefined) {
            cleaned[key] = null; // Convert undefined to null
        } else {
            cleaned[key] = cleanData(value); // Recurse
        }
    });
    return cleaned;
};

export const authService = {
  /**
   * Login using Firestore Query
   */
  login: async (username: string, pass: string): Promise<User | null> => {
    try {
      if (!db) throw new Error("Database connection failed. Please check your internet connection.");
      
      const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      // Auto-create Admin if missing
      if (querySnapshot.empty) {
        if (username === 'admin') {
            const newAdminData = {
                username: 'admin',
                password: pass, 
                role: Role.ADMIN,
                isActive: true,
                expiryDate: null,
                sessionToken: `sess-${Date.now()}`
            };
            // Use cleanData to be 100% sure
            const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanData(newAdminData));
            
            return { 
                id: docRef.id, 
                ...newAdminData 
            } as unknown as User;
        }
        return null;
      }

      let foundUser: User | null = null;
      let docRefId = '';

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
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

        const token = `sess-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        // Update session token safely
        await updateDoc(doc(db, COLLECTION_NAME, docRefId), cleanData({
            sessionToken: token
        }));
        
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
     
     // Normalize expiryDate
     let safeExpiry: string | null = null;
     if (expiryDate && typeof expiryDate === 'string' && expiryDate !== 'undefined' && expiryDate.trim() !== '') {
         safeExpiry = expiryDate;
     }

     const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
     const querySnapshot = await getDocs(q);

     if (querySnapshot.empty) {
        // Create User
        const newUser = {
            username,
            password: pass,
            role: Role.MEMBER,
            isActive: true,
            expiryDate: safeExpiry,
            sessionToken: null
        };
        // WRAP IN cleanData
        await addDoc(collection(db, COLLECTION_NAME), cleanData(newUser));
     } else {
        // Update User
        const docRef = querySnapshot.docs[0].ref;
        const updates: any = { password: pass, isActive: true };
        if (safeExpiry) {
            updates.expiryDate = safeExpiry;
        }
        // WRAP IN cleanData
        await updateDoc(docRef, cleanData(updates));
     }

     return authService.login(username, pass);
  },

  getAllUsers: async (): Promise<User[]> => {
    if (!db) return [];
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const users: User[] = [];
    querySnapshot.forEach((doc: any) => {
       const d = doc.data();
       users.push({ id: doc.id, ...d } as User);
    });
    return users;
  },

  addUser: async (username: string, pass: string, expiryDate?: string) => {
    if (!db) throw new Error("Database connection failed.");
    const q = query(collection(db, COLLECTION_NAME), where("username", "==", username));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) throw new Error("User exists");

    let safeExpiry: string | null = null;
    if (expiryDate && typeof expiryDate === 'string' && expiryDate !== 'undefined' && expiryDate.trim() !== '') {
        safeExpiry = expiryDate;
    }

    const newUser = {
      username,
      password: pass,
      role: Role.MEMBER,
      isActive: true,
      expiryDate: safeExpiry, // might be null
      sessionToken: null 
    };

    // WRAP IN cleanData: This is the critical fix for addDoc error
    await addDoc(collection(db, COLLECTION_NAME), cleanData(newUser));
  },

  deleteUser: async (username: string) => {
    if (!db) return;
    if (username === 'admin') return;
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
        await updateDoc(d.ref, cleanData({ 
            password: newPass,
            sessionToken: null 
        }));
    });
  },

  toggleStatus: async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    const userRef = doc(db, COLLECTION_NAME, userId);
    const newStatus = !currentStatus;
    
    const updates: any = { 
        isActive: newStatus
    };
    if (!newStatus) {
        updates.sessionToken = null;
    }
    
    // WRAP IN cleanData
    await updateDoc(userRef, cleanData(updates));
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

  listenToUserSession: (userId: string, callback: (data: any) => void) => {
      if (!db) return () => {};
      return onSnapshot(doc(db, COLLECTION_NAME, userId), (doc: any) => {
          if (doc.exists()) {
              callback(doc.data());
          } else {
              callback(null);
          }
      });
  }
};
