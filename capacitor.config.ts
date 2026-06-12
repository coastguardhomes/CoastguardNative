import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.coastguard.app",
  appName: "CoastGuard",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    cleartext: true
  },
  loggingBehavior: "debug"
};

export default config;
