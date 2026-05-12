import { useState } from "react";
import "./index.css";
import api from "../../service/api";

export default function CadastroAdmin() {
  const [form, setForm] = useState({
    email: "",
    senha: ""
  });

  const [errors, setErrors] = useState({});

  // 🔥 validação
  const validate = () => {
    let newErrors = {};

    if (!form.email) newErrors.email = "Email obrigatório";
    if (!form.senha) newErrors.senha = "Senha obrigatória";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  // 🔥 submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await api.post("/registrar-admin", {
        email: form.email,
        senha: form.senha
      });

      alert("Admin cadastrado com sucesso!");
      window.location.href = "/login";

    } catch (err) {
      console.error("Erro ao cadastrar admin:", err);
      alert(err.response?.data?.erro || "Erro ao cadastrar admin");
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <h1>Cadastrar Admin</h1>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          {/* SENHA */}
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            onChange={handleChange}
            value={form.senha}
          />
          {errors.senha && <span className="error">{errors.senha}</span>}

          <button type="submit">Cadastrar Admin</button>
        </form>
      </div>
    </div>
  );
}