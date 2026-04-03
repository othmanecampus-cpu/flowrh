import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "employe" | "admin_gestionnaire" | "professeur" | "admin_simple";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  approved: boolean;
  soldeConges: { total: number; utilise: number; restant: number };
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, fullName: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchAppUser(supabaseUser: SupabaseUser): Promise<AppUser | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", supabaseUser.id)
    .single();

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supabaseUser.id)
    .single();

  const { data: solde } = await supabase
    .from("soldes_conges")
    .select("*")
    .eq("user_id", supabaseUser.id)
    .single();

  if (!profile || !roleData) return null;

  return {
    id: supabaseUser.id,
    email: profile.email || supabaseUser.email || "",
    fullName: profile.full_name,
    role: roleData.role as UserRole,
    approved: profile.approved ?? false,
    soldeConges: {
      total: solde?.total ?? 25,
      utilise: solde?.utilise ?? 0,
      restant: solde?.restant ?? 25,
    },
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const { data: { user: su } } = await supabase.auth.getUser();
    if (su) {
      setSupabaseUser(su);
      const appUser = await fetchAppUser(su);
      setUser(appUser);
    } else {
      setSupabaseUser(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setTimeout(async () => {
          const appUser = await fetchAppUser(session.user);
          setUser(appUser);
          setLoading(false);
        }, 0);
      } else {
        setSupabaseUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchAppUser(session.user).then((appUser) => {
          setUser(appUser);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signup = async (email: string, password: string, fullName: string): Promise<string | null> => {
    // Restrict to @elcdeparis.fr emails
    if (!email.endsWith("@elcdeparis.fr")) {
      return "Seuls les emails @elcdeparis.fr sont autorisés.";
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const isAdmin = user?.role === "admin_gestionnaire" || user?.role === "admin_simple";

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, login, signup, logout, refreshUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
