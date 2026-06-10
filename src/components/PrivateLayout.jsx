import Navbar from "./Navbar";

export default function PrivateLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}
