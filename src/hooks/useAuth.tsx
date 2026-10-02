import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/permissions";
import { getCurrentSession, getUserAuthData, signOutUser, type UserProfile } from "@/services/auth-service";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  isValidated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  isValidated: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const authData = await getUserAuthData(userId);
      setProfile(authData.profile);
      setRole(authData.role);
      setIsValidated(authData.isValidated);
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      setProfile(null);
      setRole(null);
      setIsValidated(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchUserData(user.id);
  }, [user, fetchUserData]);

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setIsValidated(false);
  };

  useEffect(() => {
    let isActive = true;
    let authStateChanged = false;

    void getCurrentSession()
      .then((currentSession) => {
        if (!isActive || authStateChanged) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) void fetchUserData(currentSession.user.id);
      })
      .catch((error) => {
        if (!isActive || authStateChanged) return;
        console.error("Erreur lors de l'initialisation de la session:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
        setIsValidated(false);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    // Écouter les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        authStateChanged = true;
        if (!isActive) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            // Utiliser setTimeout pour éviter les deadlocks avec le client Supabase
            setTimeout(() => {
              if (isActive) void fetchUserData(session.user.id);
            }, 0);
          }
        } else {
          setProfile(null);
          setRole(null);
          setIsValidated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, session, profile, role, isValidated, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
