import React, { useState } from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../service/loginService";

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
    <div className="login-container">
      <div className="login-box">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Digite seu email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              placeholder="Digite sua senha"
              value={form.senha}
              onChange={handleChange}
            />
          </div>

          {erro && <p className="error">{erro}</p>}

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <p className="register-text">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}