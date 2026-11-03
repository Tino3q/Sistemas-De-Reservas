module.exports = {
  expo: {
    name: "Sistema de Reservas",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "sistemareservas",
    userInterfaceStyle: "light",
    ios: { supportsTablet: true },
    android: {
      usesCleartextTraffic: true,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png"
      }
    },
    web: { favicon: "./assets/favicon.png" },
    plugins: [
      "expo-router",
      ["expo-notifications", { color: "#0F766E" }]
    ],
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://172.16.22.143:3000"
    }
  }
};