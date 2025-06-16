import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, signInWithPopup, User, AuthProvider } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth(): {
  user: User | null;
  isLoading: boolean;
  handleSignIn: (provider: AuthProvider) => Promise<void>;
  handleSignOut: () => Promise<void>;
  } {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async (provider: AuthProvider): Promise<void> => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return { user, isLoading, handleSignIn, handleSignOut };
}