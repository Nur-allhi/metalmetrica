
"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    GoogleAuthProvider, 
    type User, 
    signInAnonymously,
    linkWithCredential,
    deleteUser
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getProjects, addProject as addProjectToDb } from "@/services/firestore";
import type { Project } from "@/types";
import useLocalStorage from "@/hooks/use-local-storage";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUser = async (rawUser: User | null) => {
    if (rawUser) {
      const userRef = doc(db, 'users', rawUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists() && !rawUser.isAnonymous) {
        // Create a new user profile in Firestore for non-anonymous users
        await setDoc(userRef, {
          displayName: rawUser.displayName,
          email: rawUser.email,
          photoURL: rawUser.photoURL,
          createdAt: serverTimestamp(),
        });
      }
      setUser(rawUser);
    } else {
      // No user signed in, so sign in anonymously
      try {
        const { user: anonymousUser } = await signInAnonymously(auth);
        setUser(anonymousUser);
      } catch (error) {
        console.error("Error signing in anonymously:", error);
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    const anonymousUser = auth.currentUser;

    try {
        const result = await signInWithPopup(auth, provider);
        if (anonymousUser && anonymousUser.isAnonymous) {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential) {
                const linkedUserCredential = await linkWithCredential(anonymousUser, credential);
                setUser(linkedUserCredential.user);
            }
        }
    } catch (error: any) {
        console.error("Error signing in with Google:", error);
        // Handle specific errors like popup closed by user gracefully
        if (error.code !== 'auth/popup-closed-by-user') {
            // Re-throw other errors or handle them as needed
        }
    } finally {
        setLoading(false);
    }
};


  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    // After logging out, a new anonymous user will be created by onAuthStateChanged
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
