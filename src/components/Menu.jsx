import { Link, useLocation, useNavigate } from "react-router-dom";
import PerfilMenu from "./PerfilMenu";
import "./Menu.css";

export default function Menu() {
  const tipo = localStorage.getItem("tipo");
  const token = localStorage.getItem("token");
  const logado = !!token;

  const location = useLocation();
  const navigate = useNavigate();

  const irParaSecao = (id) => {
    // Se já estiver na Home
    if (location.pathname === "/") {
      const elemento = document.getElementById(id);

      if (elemento) {
        elemento.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // Se estiver em outra página, volta para Home
    navigate(`/#${id}`);
  };

  return (
    <nav className="menu">

      {/* LINKS PRINCIPAIS */}
      <div className="menu-links">

        <button
          type="button"
          className="menu-link"
          onClick={() => irParaSecao("sobre")}
        >
          Sobre
        </button>

        <button
          type="button"
          className="menu-link"
          onClick={() => irParaSecao("servicos")}
        >
          Serviços
        </button>

        <button
          type="button"
          className="menu-link"
          onClick={() => irParaSecao("profissionais")}
        >
          Barbeiros
        </button>

        <button
          type="button"
          className="menu-link"
          onClick={() => irParaSecao("como-funciona")}
        >
          Como funciona
        </button>

      </div>

      {/* AÇÕES */}
{/* AÇÕES */}
<div className="menu-actions">

  {!logado && (
    <Link
      to="/Login"
      className="login-link"
    >
      Entrar
    </Link>
  )}

  {logado && (
    <>
      <Link
        to="/Agendamento"
        className="header-agendar"
      >
        <span>AGENDAR HORÁRIO</span>
        <span className="arrow">→</span>
      </Link>

      <PerfilMenu />
    </>
  )}

</div>

    </nav>
  );
}