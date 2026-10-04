import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabaseClient";
import { getCurrentUser } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stores the current Supabase access token
  const [accessToken, setAccessToken] = useState(null);

  async function loadUser(session) {
    if (!session) {
      setUser(null);
      setProfile(null);
      setAccessToken(null);
      return;
    }

    // Save the token so other pages can use it
    setAccessToken(session.access_token);

    const currentUser = await getCurrentUser(
      session.access_token,
    );

    setUser(currentUser.user);
    setProfile(currentUser.profile);
  }

  async function login(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      throw error;
    }

    const currentUser = await getCurrentUser(
      data.session.access_token,
    );

    setUser(currentUser.user);
    setProfile(currentUser.profile);

    // Add this
    setAccessToken(data.session.access_token);

    return currentUser.profile;
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);

    // Add this
    setAccessToken(null);
  }

  useEffect(() => {
    async function initializeAuth() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await loadUser(session);
      } catch (error) {
        console.error("Unable to restore session:", error);

        setUser(null);
        setProfile(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          await loadUser(session);
        } catch (error) {
          console.error(
            "Authentication state error:",
            error,
          );
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,

        // Add this
        accessToken,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}