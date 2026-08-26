import React, { useState } from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../service/loginService";

import {
  Mail,
  Lock,
  Eye,
  LogIn,
  UserPlus,
  CalendarDays,
  Users,
  Scissors,
  ShieldCheck,
  Cloud,
  Headphones
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: ""
  });

  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(form);

      // 🔐 salva token e tipo
localStorage.setItem("token", res.data.token);
localStorage.setItem("tipo", res.data.tipo);
localStorage.setItem("entidadeId", res.data.entidadeId);

      // 🔥 REDIRECIONAMENTO
      if (res.data.tipo === "ADMIN") {
        navigate("/barbeiro");
      } else if (res.data.tipo === "BARBEIRO") {
        navigate("/barbeiro");
      } else {
        navigate("/cliente");
      }

    } catch (err) {
      console.error(err);
      setErro(err.response?.data?.erro || "Erro ao fazer login");
    }
  };

return (
  <div className="login-page">

    <div className="login-main">

      {/* LADO ESQUERDO */}
      <div className="login-left">

        <div className="login-left-content">

          <div className="login-logo">
            <div className="login-logo-icon">
              ✂
            </div>

            <h1>BRUTUS</h1>

            <span>SISTEMA DE GESTÃO</span>
          </div>

          <div className="login-description">

            <h2>Gestão completa para sua barbearia</h2>

            <p>
              Agendamentos, clientes, serviços e barbeiros
              organizados em um só lugar.
            </p>

          </div>

          <div className="login-benefits">

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <CalendarDays />
              </div>

              <h3>Agendamentos</h3>
              <p>inteligentes</p>
            </div>

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <Users />
              </div>

              <h3>Clientes</h3>
              <p>satisfeitos</p>
            </div>

            <div className="login-benefit">
              <div className="login-benefit-icon">
                <Scissors />
              </div>

              <h3>Barbearia</h3>
              <p>organizada</p>
            </div>

          </div>

        </div>

      </div>


      {/* LADO DIREITO */}
      <div className="login-right">

        <div className="login-box">

          <div className="login-header">

            <h2>Bem-vindo de volta!</h2>

            <p>
              Faça login para acessar sua conta
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="input-group">

              <label>E-mail</label>

              <div className="input-wrapper">

                <Mail className="input-icon" size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="Digite seu e-mail"
                  value={form.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* SENHA */}
            <div className="input-group">

              <label>Senha</label>

              <div className="input-wrapper">

                <Lock className="input-icon" size={17} />

                <input
                  type="password"
                  name="senha"
                  placeholder="Digite sua senha"
                  value={form.senha}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                >
                  <Eye size={17} />
                </button>

              </div>

            </div>


            {erro && (
              <p className="error">
                {erro}
              </p>
            )}


            {/* LEMBRAR / ESQUECI */}
            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>Lembrar-me</span>

              </label>

              <a
                href="#"
                className="forgot-password"
              >
                Esqueci minha senha
              </a>

            </div>


            {/* ENTRAR */}
            <button
              type="submit"
              className="btn-login"
            >
              <LogIn size={16} />

              <span>Entrar</span>
            </button>


            {/* OU */}
            <div className="login-divider">
              ou
            </div>


            {/* CADASTRO */}
            <Link
              to="/cadastro"
              className="register-button"
            >
              <UserPlus size={16} />

              <span>Cadastre-se</span>
            </Link>

          </form>


          <p className="register-text">
            Ainda não tem conta?{" "}
            <Link to="/cadastro">
              Cadastre-se
            </Link>
          </p>

        </div>

      </div>

    </div>


    {/* RODAPÉ */}
    <footer className="login-footer">

      <div className="footer-item">

        <ShieldCheck className="footer-icon" />

        <div>
          <strong>Seguro</strong>
          <span>Seus dados protegidos</span>
        </div>

      </div>


      <div className="footer-item">

        <Cloud className="footer-icon" />

        <div>
          <strong>Em qualquer lugar</strong>
          <span>Acesse de onde estiver</span>
        </div>

      </div>


      <div className="footer-item">

        <Headphones className="footer-icon" />

        <div>
          <strong>Suporte</strong>
          <span>Estamos aqui para ajudar</span>
        </div>

      </div>


      <div className="footer-item">

        <div>
          <strong>Versão 1.0.0</strong>
          <span>Sistema sempre atualizado</span>
        </div>

      </div>

    </footer>

  </div>
);
}