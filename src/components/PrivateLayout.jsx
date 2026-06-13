import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function PrivateLayout() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>
        <Outlet />
      </div>
    </div>
  );
}
