import { useState, useEffect } from "react";
import {
  ChevronDown,
  LogOut,
} from "lucide-react";

import "./PerfilMenu.css";
import { getUsuarioLogado } from "../service/loginService";
import { useNavigate } from "react-router-dom";

export default function PerfilMenu() {
  const [aberto, setAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token || token === "null" || token === "undefined") {
      return;
    }

    async function carregarUsuario() {
      try {
        const res = await getUsuarioLogado();
        setUsuario(res.data);
      } catch (err) {
        console.log("Erro ao buscar usuário:", err);
      }
    }

    carregarUsuario();
  }, [token]);

  // Se não estiver logado, não mostra nada
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  const logout = () => {
    ["token", "tipo", "entidadeId"].forEach((chave) => sessionStorage.removeItem(chave));
    ["token", "tipo", "entidadeId", "cliente"].forEach((chave) => localStorage.removeItem(chave));
    navigate("/login", { replace: true });
  };

  const tipo = usuario?.tipo || "Usuário";
  const email = usuario?.email || "email@exemplo.com";

  return (
    <div className="perfil-container">

      <button
        onClick={() => setAberto(!aberto)}
        className="perfil-botao"
      >
        <span className="perfil-texto">
          Minha Conta
        </span>

        <ChevronDown
          className={`perfil-icone ${aberto ? "aberto" : ""}`}
          size={16}
        />
      </button>

      {aberto && (
        <>
          <div
            className="perfil-overlay"
            onClick={() => setAberto(false)}
          />

          <div className="perfil-menu">

            <div className="perfil-header">
              <p className="perfil-tipo">
                {tipo}
              </p>

              <p className="perfil-email">
                {email}
              </p>
            </div>

            <div className="perfil-opcoes">

              <hr className="perfil-linha" />

              <button
                className="perfil-sair"
                onClick={logout}
              >
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
