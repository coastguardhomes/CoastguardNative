import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import "./styles/global.css";

export default function App() {
  useEffect(() => {
    console.log("CoastGuardApp iniciada");
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}
