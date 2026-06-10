import React from "react";
import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UIProvider } from "./context/ui/UIContext.jsx";
import ErrorOverlay from "./ErrorOverlay.jsx";

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <ErrorOverlay />
        <AppRouter />
      </UIProvider>
    </AuthProvider>
  );
}
