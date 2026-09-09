import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { updateProfile as updateProfileApi } from "../api/account";
import * as authApi from "../api/auth";
import { ApiError } from "../api/client";
import { API_URL, GOOGLE_LOGIN_ENABLED } from "../lib/env";
import type { ProfileInput } from "../types/account";
import { isAdmin, type LoginInput, type RegisterInput, type User } from "../types/user";

import { AdminNotAllowedError, GoogleSignInCancelledError } from "./errors";
import { clearToken, loadToken, saveToken } from "./tokenStore";

// Fecha a aba de auth se o app reabrir no meio do fluxo (necessário no web,
// inócuo no nativo).
WebBrowser.maybeCompleteAuthSession();

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" ? value : null;
}

interface AuthContextValue {
  user: User | null;
  /** true enquanto reidrata a sessão no boot. */
  initializing: boolean;
  isAuthenticated: boolean;
  /** true quando o botão "Continuar com Google" deve aparecer. */
  googleEnabled: boolean;
  signIn: (input: LoginInput) => Promise<User>;
  /** Login com Google via navegador (fluxo web do backend). */
  signInWithGoogle: () => Promise<User>;
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

  const signInWithGoogle = useCallback(async () => {
    const redirectUri = makeRedirectUri({ scheme: "agnusapp", path: "auth" });
    const authUrl = `${API_URL}/auth/google?redirect=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== "success") throw new GoogleSignInCancelledError();

    const { queryParams } = Linking.parse(result.url);
    const returnedError = firstParam(queryParams?.error);
    if (returnedError) throw new ApiError(400, returnedError);

    const token = firstParam(queryParams?.token);
    if (!token) throw new GoogleSignInCancelledError();

    await saveToken(token);
    try {
      const me = await authApi.me();
      if (isAdmin(me)) {
        await clearToken();
        throw new AdminNotAllowedError();
      }
      setUser(me);
      return me;
    } catch (err) {
      if (!(err instanceof AdminNotAllowedError)) await clearToken();
      throw err;
    }
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
      googleEnabled: GOOGLE_LOGIN_ENABLED,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      refresh,
      updateProfile,
    }),
    [user, initializing, signIn, signInWithGoogle, signUp, signOut, refresh, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
