import { Link } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu";

export default function TecnicosHome() {
  return (
    <LayoutWithMenu>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Técnicos</h1>

        <div className="space-y-3">
          <Link
            to="/tecnicos/lista"
            className="block bg-blue-600 text-white p-3 rounded text-center"
          >
            Ver lista de técnicos
          </Link>

          <Link
            to="/tecnicos/nuevo"
            className="block bg-green-600 text-white p-3 rounded text-center"
          >
            Registrar nuevo técnico
          </Link>
        </div>
      </div>
    </LayoutWithMenu>
  );
}