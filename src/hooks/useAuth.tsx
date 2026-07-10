import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "bailleur" | "etudiant";

interface Profile {
  id: string;
  user_id: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_roles").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as Profile);
      }
      if (roleRes.data) {
        setRole(roleRes.data.role as AppRole);
        setIsValidated(roleRes.data.is_validated);
      } else {
        // Si pas de rôle trouvé, on ne bloque pas l'utilisateur
        setRole(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchUserData(user.id);
  }, [user, fetchUserData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setIsValidated(false);
  };

  useEffect(() => {
    // Initialisation de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'état
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            // Utiliser setTimeout pour éviter les deadlocks avec le client Supabase
            setTimeout(() => fetchUserData(session.user.id), 0);
          }
        } else {
          setProfile(null);
          setRole(null);
          setIsValidated(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, session, profile, role, isValidated, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
