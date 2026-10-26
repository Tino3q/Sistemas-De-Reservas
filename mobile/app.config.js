export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000"
    }
  }
};