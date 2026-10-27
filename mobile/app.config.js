export default {
  expo: {
    name: "mobile",
    slug: "mobile",
    version: "1.0.0",
    scheme: "sistemareservas",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.107:3000"
    }
  }
};