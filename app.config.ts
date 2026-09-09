import type { ExpoConfig, ConfigContext } from "expo/config";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Agnus",
  slug: "agnus-mobile",
  scheme: "agnusapp",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.agnus.mobile",
  },
  android: {
    package: "com.agnus.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
      backgroundColor: "#E6F4FE",
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-secure-store",
    "expo-font",
    "expo-image",
    "expo-status-bar",
    "expo-web-browser",
    [
      "expo-splash-screen",
      {
        image: "./assets/splash-icon.png",
        imageWidth: 180,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
  ],
  extra: {
    apiUrl: API_URL,
    // Botão "Continuar com Google" na tela de login. Desligue com
    // EXPO_PUBLIC_GOOGLE_LOGIN=false se o backend não tiver o Google OAuth
    // configurado no ambiente. O fluxo é web (expo-auth-session), roda no Expo Go.
    googleLogin: process.env.EXPO_PUBLIC_GOOGLE_LOGIN !== "false",
  },
});
