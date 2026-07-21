import { useEffect, useState } from "react";

export default function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // chequeo periódico para evitar falsos positivos
    const interval = setInterval(updateStatus, 3000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      clearInterval(interval);
    };
  }, []);

  return online;
}
