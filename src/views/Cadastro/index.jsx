import { useState } from "react";
import "./index.css";
import { registrarCliente } from "../../service/loginService";

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    dataNascimento: "",
    email: "",
    senha: "",
    cpf: "",
    rg: "",
    endereco: "",
    telefone: "",
    ativo: true,
    foto: null
  });

  const [errors, setErrors] = useState({});

  // 🔥 VALIDAÇÃO
  const validate = () => {
    let newErrors = {};

    if (!form.nome) newErrors.nome = "Obrigatório";
    if (!form.sobrenome) newErrors.sobrenome = "Obrigatório";
    if (!form.email) newErrors.email = "Obrigatório";
    if (!form.senha) newErrors.senha = "Obrigatório";
    if (!form.telefone) newErrors.telefone = "Obrigatório";
    if (!form.endereco) newErrors.endereco = "Obrigatório";
    if (!form.cpf) newErrors.cpf = "Obrigatório";
    if (!form.rg) newErrors.rg = "Obrigatório";
    if (!form.dataNascimento) newErrors.dataNascimento = "Obrigatório";
    if (!form.foto) newErrors.foto = "Foto obrigatória";

    // email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "Email inválido";
    }

    // telefone
    if (
      form.telefone &&
      !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(form.telefone)
    ) {
      newErrors.telefone = "Telefone inválido";
    }

    // idade mínima
    if (form.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(form.dataNascimento);

      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();

      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      if (idade < 16) {
        newErrors.dataNascimento = "Mínimo 16 anos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔥 HANDLE CHANGE (com suporte a file)
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  // 🔥 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await registrarCliente(form);
      alert("Cadastro realizado com sucesso!");
      window.location.href = "/login";
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      alert("Erro ao cadastrar");
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-box">
        <h1>Cadastro</h1>

        <form onSubmit={handleSubmit} encType="multipart/form-data">

          <input name="nome" placeholder="Nome" onChange={handleChange} />
          {errors.nome && <span className="error">{errors.nome}</span>}

          <input name="sobrenome" placeholder="Sobrenome" onChange={handleChange} />
          {errors.sobrenome && <span className="error">{errors.sobrenome}</span>}

          <input type="date" name="dataNascimento" onChange={handleChange} />
          {errors.dataNascimento && <span className="error">{errors.dataNascimento}</span>}

          <input name="email" placeholder="Email" onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}

          <input type="password" name="senha" placeholder="Senha" onChange={handleChange} />
          {errors.senha && <span className="error">{errors.senha}</span>}

          <input name="cpf" placeholder="CPF" onChange={handleChange} />
          {errors.cpf && <span className="error">{errors.cpf}</span>}

          <input name="rg" placeholder="RG" onChange={handleChange} />
          {errors.rg && <span className="error">{errors.rg}</span>}

          <input name="endereco" placeholder="Endereço" onChange={handleChange} />
          {errors.endereco && <span className="error">{errors.endereco}</span>}

          <input name="telefone" placeholder="Telefone" onChange={handleChange} />
          {errors.telefone && <span className="error">{errors.telefone}</span>}

          {/* 📸 FOTO */}
          <input type="file" name="foto" onChange={handleChange} />
          {errors.foto && <span className="error">{errors.foto}</span>}

          <button type="submit">Cadastrar</button>
        </form>
      </div>
    </div>
  );
}