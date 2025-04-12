
import { createContext, useContext, useEffect, useState } from "react";
import { AuthState, getCurrentSession, getCurrentUser } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
};

const AuthContext = createContext<AuthState>(initialState);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    async function loadUserData() {
      try {
        // Load initial session
        const session = await getCurrentSession();
        const user = session ? await getCurrentUser() : null;
        
        setState({
          session,
          user,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error loading user data:", error);
        setState({ ...initialState, isLoading: false });
      }
    }
    
    loadUserData();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(state => ({
          ...state,
          session,
          user: session?.user ?? null,
        }));
        
        // Avoid the deadlock by not making Supabase calls inside the callback
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            // You could fetch additional user data here if needed
          }, 0);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
