import { useState } from "react";
import { Link } from "react-router-dom";

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
    foto: null,
  });

  const [errors, setErrors] = useState({});

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
    if (!form.dataNascimento) {
      newErrors.dataNascimento = "Obrigatório";
    }

    if (!form.foto) {
      newErrors.foto = "Foto obrigatória";
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (form.email && !emailRegex.test(form.email)) {
      newErrors.email = "E-mail inválido";
    }

    // Validação de telefone
    if (
      form.telefone &&
      !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(form.telefone)
    ) {
      newErrors.telefone = "Telefone inválido";
    }

    // Idade mínima
    if (form.dataNascimento) {
      const hoje = new Date();
      const nascimento = new Date(form.dataNascimento);

      let idade =
        hoje.getFullYear() - nascimento.getFullYear();

      const mes =
        hoje.getMonth() - nascimento.getMonth();

      if (
        mes < 0 ||
        (mes === 0 && hoje.getDate() < nascimento.getDate())
      ) {
        idade--;
      }

      if (idade < 16) {
        newErrors.dataNascimento = "Mínimo 16 anos";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

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
    <div className="cadastro-page">

      {/* IMAGEM */}
      <div className="cadastro-image">

        <div className="image-overlay"></div>

        <div className="image-content">
          <span>BARBEARIA BRUTUS</span>

          <h2>
            SEU ESTILO,
            <br />
            <strong>NO SEU TEMPO.</strong>
          </h2>
        </div>

      </div>

      {/* LADO DIREITO */}
      <div className="cadastro-content">

        <div className="cadastro-form-container">

          {/* VOLTAR */}
          <Link to="/" className="voltar-home">
            ← Voltar para a home
          </Link>

          {/* TÍTULO */}
          <div className="cadastro-header">

            <span className="cadastro-eyebrow">
              BEM-VINDO À BRUTUS
            </span>

            <h1>
              Crie sua <span>conta.</span>
            </h1>

            <p>
              Agende seu horário em poucos passos.
            </p>

          </div>

          {/* FORMULÁRIO */}
          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="cadastro-form"
          >

            {/* NOME */}
            <div className="form-group">
              <label>Nome</label>

              <input
                name="nome"
                placeholder="Seu nome"
                value={form.nome}
                onChange={handleChange}
              />

              {errors.nome && (
                <span className="error">
                  {errors.nome}
                </span>
              )}
            </div>

            {/* SOBRENOME */}
            <div className="form-group">
              <label>Sobrenome</label>

              <input
                name="sobrenome"
                placeholder="Seu sobrenome"
                value={form.sobrenome}
                onChange={handleChange}
              />

              {errors.sobrenome && (
                <span className="error">
                  {errors.sobrenome}
                </span>
              )}
            </div>

            {/* DATA NASCIMENTO */}
            <div className="form-group">
              <label>Data de nascimento</label>

              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
              />

              {errors.dataNascimento && (
                <span className="error">
                  {errors.dataNascimento}
                </span>
              )}
            </div>

            {/* CPF */}
            <div className="form-group">
              <label>CPF</label>

              <input
                name="cpf"
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={handleChange}
              />

              {errors.cpf && (
                <span className="error">
                  {errors.cpf}
                </span>
              )}
            </div>

            {/* RG */}
            <div className="form-group">
              <label>RG</label>

              <input
                name="rg"
                placeholder="00.000.000-0"
                value={form.rg}
                onChange={handleChange}
              />

              {errors.rg && (
                <span className="error">
                  {errors.rg}
                </span>
              )}
            </div>

            {/* TELEFONE */}
            <div className="form-group">
              <label>Telefone</label>

              <input
                name="telefone"
                placeholder="(11) 99999-9999"
                value={form.telefone}
                onChange={handleChange}
              />

              {errors.telefone && (
                <span className="error">
                  {errors.telefone}
                </span>
              )}
            </div>

            {/* EMAIL */}
            <div className="form-group full">
              <label>E-mail</label>

              <input
                type="email"
                name="email"
                placeholder="voce@email.com"
                value={form.email}
                onChange={handleChange}
              />

              {errors.email && (
                <span className="error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* ENDEREÇO */}
            <div className="form-group full">
              <label>Endereço</label>

              <input
                name="endereco"
                placeholder="Seu endereço"
                value={form.endereco}
                onChange={handleChange}
              />

              {errors.endereco && (
                <span className="error">
                  {errors.endereco}
                </span>
              )}
            </div>

            {/* SENHA */}
            <div className="form-group full">
              <label>Senha</label>

              <input
                type="password"
                minLength={8}
                name="senha"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
              />

              {errors.senha && (
                <span className="error">
                  {errors.senha}
                </span>
              )}
            </div>

            {/* FOTO */}
            <div className="form-group full">
              <label>Foto de perfil</label>

              <label className="file-input">

                <span>
                  {form.foto
                    ? form.foto.name
                    : "Selecionar foto"}
                </span>

                <input
                  type="file"
                  name="foto"
                  accept="image/*"
                  onChange={handleChange}
                />

                <strong>+</strong>

              </label>

              {errors.foto && (
                <span className="error">
                  {errors.foto}
                </span>
              )}
            </div>

            {/* BOTÃO */}
            <button
              type="submit"
              className="btn-cadastro"
            >
              <span>CRIAR CONTA</span>
              <strong>→</strong>
            </button>

          </form>

          {/* LOGIN */}
          <p className="login-text">
            Já possui uma conta?

            <Link to="/Login">
              Entrar
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}