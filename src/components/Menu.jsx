import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PerfilMenu from "./PerfilMenu";
import "./Menu.css";

export default function Menu() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = sessionStorage.getItem("token");
  const logado = !!token;

  const location = useLocation();
  const navigate = useNavigate();

  const irParaSecao = (id) => {
    setMobileMenuOpen(false);
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
    navigate(`/#${id}`);
  };

  return (
    <nav className="menu">
      {/* BOTÃO HAMBÚRGUER MOBILE */}
      <button
        type="button"
        className="header-mobile-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* LINKS PRINCIPAIS */}
      <div className={`menu-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
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

        {!logado && (
          <Link
            to="/login"
            className="menu-link mobile-only-login"
            onClick={() => setMobileMenuOpen(false)}
          >
            Entrar
          </Link>
        )}
      </div>

      {/* AÇÕES */}
      <div className="menu-actions">
        {!logado && (
          <Link to="/login" className="login-link">
            Entrar
          </Link>
        )}

        {logado && (
          <>
            <Link to="/Agendamento" className="header-agendar">
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
