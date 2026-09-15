import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { LoginResult } from '../types';

/**
 * Safely extracts a user-facing string error message from any API response, error object, or status.
 * Guarantees that the returned value is ALWAYS a string and NEVER an object.
 */
export function normalizeAuthError(value: unknown, defaultMessage = 'Unable to sign in. Please try again.'): string {
  if (!value) {
    return defaultMessage;
  }

  // 1. Direct string
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : defaultMessage;
  }

  // 2. Objects: handle { error: { message: "..." } }, { error: "..." }, { code: "...", message: "..." }, etc.
  if (typeof value === 'object') {
    const obj = value as Record<string, any>;

    // Nested `error` property check
    if (obj.error !== undefined && obj.error !== null) {
      if (typeof obj.error === 'string' && obj.error.trim()) {
        return obj.error.trim();
      }
      if (typeof obj.error === 'object') {
        if (typeof obj.error.message === 'string' && obj.error.message.trim()) {
          return obj.error.message.trim();
        }
        if (typeof obj.error.description === 'string' && obj.error.description.trim()) {
          return obj.error.description.trim();
        }
      }
    }

    // Direct `message` property (e.g. { code: "...", message: "..." } or Error instance)
    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message.trim();
    }

    // Direct `description` property
    if (typeof obj.description === 'string' && obj.description.trim()) {
      return obj.description.trim();
    }
  }

  return defaultMessage;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      const data = await response.json().catch(() => null);
      const authenticated = Boolean(data?.authenticated);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      return authenticated;
    } catch {
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (password: string): Promise<LoginResult> => {
    try {
      const trimmedPassword = (password || '').trim();
      if (!trimmedPassword) {
        return {
          ok: false,
          message: 'Enter your password',
          error: 'Enter your password',
        };
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ password: trimmedPassword }),
        credentials: 'same-origin',
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!isJson) {
        if (response.status === 401) {
          return { ok: false, message: 'Incorrect password', error: 'Incorrect password' };
        }
        if (response.status === 429) {
          return {
            ok: false,
            message: 'Too many attempts. Please try again later.',
            error: 'Too many attempts. Please try again later.',
          };
        }
        return {
          ok: false,
          message: 'Unable to sign in. Please try again.',
          error: 'Unable to sign in. Please try again.',
        };
      }

      const data = await response.json().catch(() => null);

      if (response.ok && data?.ok) {
        setIsAuthenticated(true);
        return { ok: true };
      }

      // Safe normalization of message from response data
      let defaultFallback = 'Unable to sign in. Please try again.';
      if (response.status === 401) {
        defaultFallback = 'Incorrect password';
      } else if (response.status === 429) {
        defaultFallback = 'Too many attempts. Please try again later.';
      } else if (data?.code === 'AUTH_CONFIG_ERROR') {
        defaultFallback = 'Authentication service unavailable';
      }

      const safeMessage = normalizeAuthError(data, defaultFallback);

      return {
        ok: false,
        message: safeMessage,
        error: safeMessage,
        code: typeof data?.code === 'string' ? data.code : undefined,
      };
    } catch {
      return {
        ok: false,
        message: 'Unable to connect. Please try again.',
        error: 'Unable to connect. Please try again.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
      });
    } catch {
      // Proceed with client logout even if network request fails
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
