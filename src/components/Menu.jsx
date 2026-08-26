import { Link, useLocation } from "react-router-dom";
import PerfilMenu from "./PerfilMenu";

export default function Menu() {
  const tipo = localStorage.getItem("tipo");
  const token = localStorage.getItem("token");

  const logado = !!token;

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className="menu">
      <ul>

        {/* 🔓 TODOS */}
        <li><Link to="/Agendamento">Agendamento</Link></li>

        {/* 💈 BARBEIRO + ADMIN */}
        {logado && (tipo === "BARBEIRO" || tipo === "ADMIN") && (
          <>
            <li><Link to="/servico">Serviços</Link></li>
            <li><Link to="/cliente">Clientes</Link></li>
          </>
        )}

        {/* 👑 ADMIN */}
        {logado && tipo === "ADMIN" && (
          <>
          <li><Link to="/barbeiro">Cadastrar Barbeiros</Link></li>
           <li><Link to="/cadastro-admin">ADMIN</Link></li>
           </>
        )}

        {/* 👤 PERFIL */}
        {!(isHome && !logado) && logado && <PerfilMenu />}

      </ul>
    </nav>
  );
}