import { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
  User,
  Calendar,
  LayoutDashboard,
} from "lucide-react";
import "./PerfilMenu.css";
import { getUsuarioLogado } from "../service/loginService";

export default function PerfilMenu() {
  const token = localStorage.getItem("token");

  // 🔥 se não estiver logado, não renderiza
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  const [aberto, setAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // 🔥 buscar usuário no backend
  useEffect(() => {
    async function carregarUsuario() {
      try {
        const res = await getUsuarioLogado();
        setUsuario(res.data);
      } catch (err) {
        console.log("Erro ao buscar usuário:", err);
      }
    }

    carregarUsuario();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const tipo = usuario?.tipo || "Usuário";
  const email = usuario?.email || "email@exemplo.com";

  return (
    <div className="perfil-container">

      {/* BOTÃO PERFIL */}
      <button
        onClick={() => setAberto(!aberto)}
        className="perfil-botao"
      >


        <span className="perfil-texto">Minha Conta</span>

        <ChevronDown
          className={`perfil-icone ${aberto ? "aberto" : ""}`}
          size={16}
        />
      </button>

      {/* DROPDOWN */}
      {aberto && (
        <>
          <div
            className="perfil-overlay"
            onClick={() => setAberto(false)}
          />

          <div className="perfil-menu">

            <div className="perfil-header">
              <p className="perfil-tipo">{tipo}</p>
              <p className="perfil-email">{email}</p>
            </div>

            <div className="perfil-opcoes">

              {tipo === "ADMIN" && (
                <button className="perfil-item">
                  <LayoutDashboard size={18} />
                  Painel Admin
                </button>
              )}

              {tipo === "BARBEIRO" && (
                <button className="perfil-item">
                  <Calendar size={18} />
                  Minha Agenda
                </button>
              )}

              {tipo === "CLIENTE" && (
                <button className="perfil-item">
                  <User size={18} />
                  Meus Agendamentos
                </button>
              )}

              <hr className="perfil-linha" />

              <button className="perfil-sair" onClick={logout}>
                <LogOut size={18} />
                Sair da conta
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}