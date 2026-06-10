import { Link } from "react-router-dom";

export default function LayoutWithMenu({ children }) {
  return (
    <div className="min-h-screen flex">

      {/* MENÚ LATERAL */}
      <aside className="w-56 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">Menú</h2>

        <nav className="space-y-2">
          <Link to="/Dashboard" className="block hover:text-blue-400">
            Dashboard
          </Link>

          <Link to="/clientes" className="block hover:text-blue-400">
            Clientes
          </Link>

          <Link to="/tecnicos" className="block hover:text-blue-400">
            Técnicos
          </Link>

          <Link to="/inspecciones" className="block hover:text-blue-400">
            Inspecciones
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>

    </div>
  );
}