import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { updateProfile as updateProfileApi } from "../api/account";
import * as authApi from "../api/auth";
import { ApiError } from "../api/client";
import type { ProfileInput } from "../types/account";
import { isAdmin, type LoginInput, type RegisterInput, type User } from "../types/user";

import { AdminNotAllowedError } from "./errors";
import { clearToken, loadToken, saveToken } from "./tokenStore";

interface AuthContextValue {
  user: User | null;
  /** true enquanto reidrata a sessão no boot. */
  initializing: boolean;
  isAuthenticated: boolean;
  signIn: (input: LoginInput) => Promise<User>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Atualiza os dados do usuário (`PUT /users/:id`) e o estado local. */
  updateProfile: (input: ProfileInput) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await authApi.me();
      if (isAdmin(me)) {
        await signOut();
        return;
      }
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut();
      } else {
        throw err;
      }
    }
  }, [signOut]);

  // Boot: se houver token salvo, reidrata via /auth/me (e desloga em 401).
  useEffect(() => {
    let active = true;
    (async () => {
      const token = await loadToken();
      if (token && active) {
        try {
          await refresh();
        } catch {
          // erro de rede: mantém sessão, telas tratam o retry
        }
      }
      if (active) setInitializing(false);
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const signIn = useCallback(async (input: LoginInput) => {
    const { user: loggedUser, token } = await authApi.login(input);
    if (isAdmin(loggedUser)) {
      await clearToken();
      throw new AdminNotAllowedError();
    }
    await saveToken(token);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    await authApi.register(input);
  }, []);

  const updateProfile = useCallback(
    async (input: ProfileInput) => {
      if (!user) throw new Error("Sem sessão.");
      const updated = await updateProfileApi(user.id_usuario, input);
      setUser(updated);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      refresh,
      updateProfile,
    }),
    [user, initializing, signIn, signUp, signOut, refresh, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
