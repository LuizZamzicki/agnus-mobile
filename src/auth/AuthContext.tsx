import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { updateProfile as updateProfileApi } from "../api/account";
import * as authApi from "../api/auth";
import { ApiError } from "../api/client";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "../lib/env";
import type { ProfileInput } from "../types/account";
import { isAdmin, type LoginInput, type RegisterInput, type User } from "../types/user";

import { AdminNotAllowedError, GoogleSignInCancelledError } from "./errors";
import { clearToken, loadToken, saveToken } from "./tokenStore";

// iOS só entra quando também há um client iOS configurado (o login nativo do
// Google no iOS exige o próprio client + URL scheme). Sem ele, o botão some no
// iOS e o app segue no Expo Go.
const googleEnabled = !!GOOGLE_WEB_CLIENT_ID && (Platform.OS !== "ios" || !!GOOGLE_IOS_CLIENT_ID);

if (googleEnabled) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
}

interface AuthContextValue {
  user: User | null;
  /** true enquanto reidrata a sessão no boot. */
  initializing: boolean;
  isAuthenticated: boolean;
  /** true quando o build tem os client IDs do Google configurados. */
  googleEnabled: boolean;
  signIn: (input: LoginInput) => Promise<User>;
  /** Login nativo com Google -> troca o id_token por sessão no backend. */
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
    if (googleEnabled) {
      await GoogleSignin.signOut().catch(() => {});
    }
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
    if (!googleEnabled) {
      throw new Error("Login com Google não está disponível neste build.");
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    let idToken: string | null | undefined;
    try {
      const result = await GoogleSignin.signIn();
      idToken = "data" in result ? result.data?.idToken : null;
    } catch (err) {
      if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new GoogleSignInCancelledError();
      }
      throw err;
    }

    if (!idToken) throw new GoogleSignInCancelledError();

    const { user: loggedUser, token } = await authApi.loginWithGoogle(idToken);
    if (isAdmin(loggedUser)) {
      await GoogleSignin.signOut().catch(() => {});
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
      googleEnabled,
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
