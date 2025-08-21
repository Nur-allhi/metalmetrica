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
        signInAnonymously(auth)
            .then(userCredential => {
                setUser(userCredential.user);
                setLoading(false);
            })
            .catch((error) => {
              console.error(
                "Anonymous sign-in failed. Please check your Firebase project console to ensure Anonymous sign-in is enabled in the Authentication > Sign-in method tab.", 
                error
              );
              setUser(null);
              setLoading(false);
            });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
