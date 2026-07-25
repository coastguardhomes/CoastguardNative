import React, { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  return (
    <UIContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        loading,
        showLoading,
        hideLoading,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
