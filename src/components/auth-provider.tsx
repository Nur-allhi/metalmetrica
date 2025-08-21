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
        // Only try to sign in anonymously once
        if (sessionStorage.getItem('anonymousSignInAttempted') !== 'true') {
            sessionStorage.setItem('anonymousSignInAttempted', 'true');
            signInAnonymously(auth)
                .then(userCredential => {
                    setUser(userCredential.user);
                })
                .catch((error) => {
                  console.error(
                    "Anonymous sign-in failed. Please make sure Anonymous sign-in is enabled in your Firebase project's authentication settings.", 
                    error
                  );
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
             setUser(null);
             setLoading(false);
        }
      }
    });

    return () => {
        // Clean up session storage on component unmount
        sessionStorage.removeItem('anonymousSignInAttempted');
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