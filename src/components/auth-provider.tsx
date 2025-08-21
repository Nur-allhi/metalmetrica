"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        // Only try to sign in anonymously once per session
        if (sessionStorage.getItem('anonymousSignInAttempted') !== 'true') {
            sessionStorage.setItem('anonymousSignInAttempted', 'true');
            signInAnonymously(auth)
                .then(userCredential => {
                    setUser(userCredential.user);
                    setLoading(false);
                })
                .catch((error) => {
                  console.error(
                    "Anonymous sign-in failed. Please go to your Firebase project console and enable Anonymous sign-in in the Authentication > Sign-in method tab.", 
                    error
                  );
                  // If it fails, we set user to null and stop loading.
                  setUser(null);
                  setLoading(false);
                });
        } else {
             // If we've already tried, don't try again.
             setUser(null);
             setLoading(false);
        }
      }
    });

    return () => {
        // This cleanup is for component unmount, but sessionStorage will persist for the session.
        unsubscribe();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
