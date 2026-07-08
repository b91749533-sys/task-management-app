
export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

// Determine if we are in mock mode based on placeholder env keys
export const isMockMode = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-supabase-project.supabase.co" ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project");

const COOKIE_NAME = "taskflow-mock-session";

export function createMockClient(cookieStore?: {
  get: (name: string) => any;
  set: (name: string, value: string, options?: any) => void;
  delete: (name: string) => void;
}) {
  // Helper to get cookies across environments (Server, Browser, Middleware)
  const getCookieVal = (): string | null => {
    if (cookieStore) {
      const cookie = cookieStore.get(COOKIE_NAME);
      return cookie ? (typeof cookie === "string" ? cookie : cookie.value) : null;
    }
    if (typeof document !== "undefined") {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${COOKIE_NAME}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  const setCookieVal = (value: string) => {
    if (cookieStore) {
      cookieStore.set(COOKIE_NAME, value, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      return;
    }
    if (typeof document !== "undefined") {
      const date = new Date();
      date.setTime(date.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `${COOKIE_NAME}=${value}; expires=${date.toUTCString()}; path=/`;
    }
  };

  const deleteCookieVal = () => {
    if (cookieStore) {
      cookieStore.delete(COOKIE_NAME);
      return;
    }
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  };

  const getUserObject = (): MockUser | null => {
    const val = getCookieVal();
    if (!val) return null;
    try {
      return JSON.parse(decodeURIComponent(val));
    } catch {
      return null;
    }
  };

  return {
    auth: {
      getUser: async () => {
        const user = getUserObject();
        if (!user) return { data: { user: null }, error: null };
        return { data: { user }, error: null };
      },
      signUp: async ({ email, password, options }: any) => {
        const name = options?.data?.name || email.split("@")[0] || "User";
        // Create deterministic mock user ID
        const cleanEmail = email.toLowerCase().trim();
        const id = `mock-uid-${Buffer.from(cleanEmail).toString("hex").slice(0, 16)}`;
        
        const mockUser: MockUser = {
          id,
          email: cleanEmail,
          user_metadata: { name },
        };

        // Persist session cookie
        setCookieVal(encodeURIComponent(JSON.stringify(mockUser)));
        return { data: { user: mockUser }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        const cleanEmail = email.toLowerCase().trim();
        const id = `mock-uid-${Buffer.from(cleanEmail).toString("hex").slice(0, 16)}`;
        const name = cleanEmail.split("@")[0] || "User";

        const mockUser: MockUser = {
          id,
          email: cleanEmail,
          user_metadata: { name },
        };

        setCookieVal(encodeURIComponent(JSON.stringify(mockUser)));
        return { data: { user: mockUser }, error: null };
      },
      signOut: async () => {
        deleteCookieVal();
        return { error: null };
      },
      resetPasswordForEmail: async (email: string) => {
        return { data: {}, error: null };
      },
      updateUser: async ({ password }: any) => {
        return { data: { user: getUserObject() }, error: null };
      }
    }
  };
}
