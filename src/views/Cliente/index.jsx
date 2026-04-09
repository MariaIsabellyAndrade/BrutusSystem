import { useEffect, useState } from "react";
import "./index.css";
import BarbeiroCards from "./ClienteCards";
import {
  listarClientes,
  criarClientes,
  atualizarClientes,
  deletarClientes
} from "../../service/serviceCliente";

export default function ListarClientes() {

  const [clientes, setClientes] = useState([]);
  const [editando, setEditando] = useState(null);
  const [modo, setModo] = useState("editar");
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    dataNascimento: "",
    email: "",
    senha: "",
    cpf: "",
    rg: "",
    endereco: "",
    ativo: true,
    telefone: "",
    foto: ""
  });

  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
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

    // 📅 idade mínima
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

  // 🔍 FILTRO
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nome} ${c.sobrenome}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // 🔥 CARREGAR
  const carregarClientes = async () => {
    try {
      const res = await listarClientes();
      setClientes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    try {
      await deletarClientes(id);
      await carregarClientes();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const abrirConfirmacao = (id) => setConfirmarExclusao(id);
  const cancelarExclusao = () => setConfirmarExclusao(null);

  const confirmarEDeletar = () => {
    handleDelete(confirmarExclusao);
    setConfirmarExclusao(null);
  };

  // 🔥 MODAL
  const abrirCadastro = () => {
    setModo("criar");
    setForm({
      nome: "",
      sobrenome: "",
      dataNascimento: "",
      email: "",
      senha: "",
      cpf: "",
      rg: "",
      endereco: "",
      ativo: true,
      telefone: "",
      foto: ""
    });
    setEditando(true);
  };

  const abrirEdicao = (c) => {
    setModo("editar");
    setEditando(c._id);

    setForm({
      nome: c.nome || "",
      sobrenome: c.sobrenome || "",
      dataNascimento: c.dataNascimento
        ? c.dataNascimento.split("T")[0]
        : "",
      email: c.email || "",
      senha: c.senha || "",
      cpf: c.cpf || "",
      rg: c.rg || "",
      endereco: c.endereco || "",
      ativo: c.ativo ?? true,
      telefone: c.telefone || "",
      foto: ""
    });
  };

  const fecharModal = () => setEditando(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value
    });
  };

  // 🔥 SALVAR
  const handleSalvar = async () => {
    if (!validate()) return;

    try {
      if (modo === "editar") {
        await atualizarClientes(editando, form);
      } else {
        await criarClientes(form);
      }

      await carregarClientes();
      setEditando(null);

    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar");
    }
  };

  return (
    <div className="container">
<BarbeiroCards/>
      <div className="list-container">
      

        {/* 🔍 BUSCA */}
        <div className="controls">
          <input
            type="text"
            placeholder="Buscar cliente..."
            className="search-input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <button className="btn-add" onClick={abrirCadastro}>
            + Novo Cliente
          </button>
        </div>

        {/* 🔥 LISTA */}
        <div className="list">
          {clientesFiltrados.length === 0 ? (
            <p className="empty-msg">Nenhum cliente encontrado</p>
          ) : (
            clientesFiltrados.map((c) => (
              <div key={c._id} className="card">

                <img
                  src={
                    c.foto
                      ? `http://localhost:3000/uploads/${c.foto}`
                      : "/placeholder.png"
                  }
                  alt={c.nome}
                />

                <div className="info">
                  <h3>{c.nome} {c.sobrenome}</h3>
                  <span>{c.email}</span>
                  <span>{c.cpf}</span>
                  <span>{c.telefone}</span>

                  <span className={c.ativo ? "ativo" : "inativo"}>
                    {c.ativo ? "● Ativo" : "● Inativo"}
                  </span>
                </div>

                <div className="actions">
                  <button onClick={() => abrirEdicao(c)}>Editar</button>
                  <button onClick={() => abrirConfirmacao(c._id)}>Excluir</button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔥 MODAL FORM */}
      {editando !== null && (
        <div className="modal" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>{modo === "editar" ? "Editar Cliente" : "Novo Cliente"}</h2>

            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" />
            {errors.nome && <span className="error">{errors.nome}</span>}

            <input name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Sobrenome" />
            {errors.sobrenome && <span className="error">{errors.sobrenome}</span>}

            <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} />
            {errors.dataNascimento && <span className="error">{errors.dataNascimento}</span>}

            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            {errors.email && <span className="error">{errors.email}</span>}

            <input name="senha" value={form.senha} onChange={handleChange} placeholder="Senha" />
            {errors.senha && <span className="error">{errors.senha}</span>}

            <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF" />
            {errors.cpf && <span className="error">{errors.cpf}</span>}

            <input name="rg" value={form.rg} onChange={handleChange} placeholder="RG" />
            {errors.rg && <span className="error">{errors.rg}</span>}

            <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" />
            {errors.endereco && <span className="error">{errors.endereco}</span>}

            <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
            {errors.telefone && <span className="error">{errors.telefone}</span>}

            <input type="file" name="foto" onChange={handleChange} />

            <label className="checkbox">
              <input
                type="checkbox"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
              />
              Ativo
            </label>

            <div className="modal-buttons">
              <button onClick={handleSalvar}>Salvar</button>
              <button onClick={fecharModal}>Cancelar</button>
            </div>

          </div>
        </div>
      )}

      {/* 🔥 MODAL DELETE */}
      {confirmarExclusao && (
        <div className="modal" onClick={cancelarExclusao}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>Excluir Cliente?</h2>

            <div className="modal-buttons">
              <button onClick={confirmarEDeletar}>Sim</button>
              <button onClick={cancelarExclusao}>Cancelar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}