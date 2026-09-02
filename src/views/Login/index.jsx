import React, { useState } from "react";
import "./index.css";

import { Link, useNavigate } from "react-router-dom";
import { login } from "../../service/loginService";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("tipo", res.data.tipo);
      localStorage.setItem("entidadeId", res.data.entidadeId);

      if (res.data.tipo === "ADMIN") {
        navigate("/barbeiro");
      } else if (res.data.tipo === "BARBEIRO") {
        navigate("/barbeiro");
      } else {
        navigate("/cliente");
      }
    } catch (err) {
      console.error(err);

      setErro(
        err.response?.data?.erro ||
        "E-mail ou senha inválidos"
      );
    }
  };

  return (
    <div className="login-page">

      {/* ========================= */}
      {/* LADO ESQUERDO */}
      {/* ========================= */}

      <div className="login-image">

        <div className="login-image-overlay"></div>

        <div className="login-image-content">

          <span>BARBEARIA BRUTUS</span>

          <h2>
            SEU ESTILO,
            <br />
            <strong>NO SEU TEMPO.</strong>
          </h2>

        </div>

      </div>


      {/* ========================= */}
      {/* LADO DIREITO */}
      {/* ========================= */}

      <div className="login-content">

        <div className="login-form-container">

          {/* VOLTAR */}
          <Link to="/" className="login-voltar">
            ← Voltar para a home
          </Link>




          {/* CABEÇALHO */}
          <div className="login-header">

            <span className="login-eyebrow">
              BEM-VINDO DE VOLTA
            </span>

            <h1>
              Entre na sua <span>conta.</span>
            </h1>

            <p>
              Acesse sua conta para continuar.
            </p>

          </div>


          {/* FORMULÁRIO */}
          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {/* E-MAIL */}
            <div className="login-form-group">

              <label>E-mail</label>

              <div className="login-input-wrapper">

                <Mail
                  className="login-input-icon"
                  size={15}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="voce@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* SENHA */}
            <div className="login-form-group">

              <label>Senha</label>

              <div className="login-input-wrapper">

                <Lock
                  className="login-input-icon"
                  size={15}
                />

                <input
                  type={mostrarSenha ? "text" : "password"}
                  name="senha"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setMostrarSenha(!mostrarSenha)
                  }
                >
                  {mostrarSenha ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>

              </div>

            </div>


            {/* ERRO */}
            {erro && (
              <p className="login-error">
                {erro}
              </p>
            )}


            {/* OPÇÕES */}
            <div className="login-options">

              <label className="login-remember">

                <input type="checkbox" />

                <span>Lembrar-me</span>

              </label>

              <a
                href="#"
                className="login-forgot"
                onClick={(e) => e.preventDefault()}
              >
                Esqueci minha senha
              </a>

            </div>


            {/* ENTRAR */}
            <button
              type="submit"
              className="login-button"
            >
              <span>ENTRAR</span>

              <strong>→</strong>
            </button>

          </form>


          {/* CADASTRO */}
          <p className="login-register">

            Ainda não possui uma conta?

            <Link to="/cadastro">
              Criar conta
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}