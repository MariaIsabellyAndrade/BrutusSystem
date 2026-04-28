import { Link } from "react-router-dom";

export default function Menu() {
  const tipo = localStorage.getItem("tipo");

  return (
    <nav className="menu">
      <ul>

        {/* 🔓 TODOS */}
        <li><Link to="/">Agendamento</Link></li>

        {/* 💈 BARBEIRO + ADMIN */}
        {(tipo === "BARBEIRO" || tipo === "ADMIN") && (
          <>
            <li><Link to="/servico">Serviços</Link></li>
            <li><Link to="/cliente">Clientes</Link></li>
          </>
        )}

        {/* 👑 SOMENTE ADMIN */}
        {tipo === "ADMIN" && (
          <li><Link to="/barbeiro">Cadastrar Barbeiros</Link></li>
        )}

      </ul>
    </nav>
  );
}