import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type User } from "./api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Auto sign-out after a stretch of inactivity, so a login left open on a
  // shared computer doesn't stay valid for its full 30-day life. We track the
  // last activity time and poll, rather than using one long timer, so it still
  // fires correctly after the machine sleeps or the tab is backgrounded.
  useEffect(() => {
    if (!user) return;
    const IDLE_MS = 8 * 60 * 60 * 1000; // 8 hours
    let lastActive = Date.now();
    const bump = () => {
      lastActive = Date.now();
    };
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActive >= IDLE_MS) {
        api.logout().catch(() => {});
        setUser(null); // cleanup below tears down listeners as user clears
      }
    }, 60 * 1000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      window.clearInterval(timer);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
