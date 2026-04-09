import { useEffect, useState } from "react";
import "./index.css";
import BarbeiroCards from "./BarbeiroCards";
import {
  listarBarbeiros,
  criarBarbeiros,
  atualizarBarbeiros,
  deletarBarbeiros
} from "../../service/serviceBarbeiro";

export default function ListarBarbeiros() {

  const [barbeiros, setBarbeiros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [modo, setModo] = useState("editar");
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    dataNascimento: "", 
    dataAdmissao:"", 
    email: "",
    senha:"", 
    cnpj:"", 
    endereco:"", 
    ativo:"",
    telefone: "",
    foto: ""
  });

  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [errors, setErrors] = useState({});



const validate = () => {
  let newErrors = {};

  if (!form.nome) newErrors.nome = "Obrigatório";
  if (!form.sobrenome) newErrors.sobrenome = "Obrigatório";
  if (!form.email) newErrors.email = "Obrigatório";
  if (!form.senha) newErrors.senha = "Obrigatório";
  if (!form.telefone) newErrors.telefone = "Obrigatório";
  if (!form.endereco) newErrors.endereco = "Obrigatório";
  if (!form.cnpj) newErrors.cnpj = "Obrigatório";
  if (!form.dataNascimento) newErrors.dataNascimento = "Obrigatório";
  if (!form.dataAdmissao) newErrors.dataAdmissao = "Obrigatório";

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

  // 📅 admissão
  if (form.dataAdmissao) {
    const hoje = new Date();
    const admissao = new Date(form.dataAdmissao);

    if (admissao > hoje) {
      newErrors.dataAdmissao = "Não pode ser futura";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // 🔥 FILTRO
  const barbeirosFiltrados = barbeiros.filter((b) =>
    `${b.nome} ${b.sobrenome}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  // 🔥 CARREGAR
  const carregarBarbeiros = async () => {
    try {
      const res = await listarBarbeiros();
      setBarbeiros(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  // 🔥 DELETE
  const handleDelete = async (id) => {
    try {
      await deletarBarbeiros(id);
      await carregarBarbeiros();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  // 🔥 MODAL DELETE
  const abrirConfirmacao = (id) => setConfirmarExclusao(id);
  const cancelarExclusao = () => setConfirmarExclusao(null);

  const confirmarEDeletar = () => {
    handleDelete(confirmarExclusao);
    setConfirmarExclusao(null);
  };

  // 🔥 MODAL FORM
  const abrirCadastro = () => {
    setModo("criar");
    setForm({
    nome: "",
    sobrenome: "",
    dataNascimento: "", 
    dataAdmissao:"", 
    email: "",
    senha:"", 
    cnpj:"", 
    endereco:"", 
    ativo:true,
    telefone: "",
    foto: ""
    });
    setEditando(true);
  };

  const abrirEdicao = (b) => {
    setModo("editar");
    setEditando(b._id);

    setForm({
      nome: b.nome || "",
      sobrenome: b.sobrenome || "",
dataNascimento: b.dataNascimento
    ? b.dataNascimento.split("T")[0]
    : "",
  dataAdmissao: b.dataAdmissao
    ? b.dataAdmissao.split("T")[0]
    : "",
      email: b.email || "",
      senha: b.senha || "",
      cnpj: b.cnpj || "",
      endereco: b.endereco || "",
      ativo: b.ativo ?? true,
      telefone: b.telefone || "",
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

  // 🔥 SALVAR (CREATE + UPDATE)
  const handleSalvar = async () => {
      if (!validate()) {
        return; // ❌ para aqui se tiver erro
      }
    try {
      if (modo === "editar") {
        await atualizarBarbeiros(editando, form);
      } else {
        await criarBarbeiros(form);
      }

      await carregarBarbeiros();
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
            placeholder="Buscar barbeiro..."
            className="search-input"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <button className="btn-add" onClick={abrirCadastro}>
            + Novo Barbeiro
          </button>
        </div>

        {/* 🔥 LISTA */}
        <div className="list">
          {barbeirosFiltrados.length === 0 ? (
            <p className="empty-msg">Nenhum barbeiro encontrado</p>
          ) : (
            barbeirosFiltrados.map((b) => (
              <div key={b._id} className="card">

                <img
                  src={
                    b.foto
                      ? `http://localhost:3000/uploads/${b.foto}`
                      : "/placeholder.png"
                  }
                  alt={b.nome}
                />

                <div className="info">
                  <h3>{b.nome} {b.sobrenome}</h3>
                  <span>{b.email}</span>
                  <span>{b.cnpj}</span>
                  <span>{b.telefone}</span>

                  <span className={b.ativo ? "ativo" : "inativo"}>
                    {b.ativo ? "● Ativo" : "● Inativo"}
                  </span>
                </div>

                <div className="actions">
                  <button onClick={() => abrirEdicao(b)}>Editar</button>
                  <button onClick={() => abrirConfirmacao(b._id)}>Excluir</button>
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

            <h2>{modo === "editar" ? "Editar Barbeiro" : "Novo Barbeiro"}</h2>

            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" />
            {errors.nome && <span className="error">{errors.nome}</span>}

            <input name="sobrenome" value={form.sobrenome} onChange={handleChange} placeholder="Sobrenome" />
            {errors.sobrenome && <span className="error">{errors.sobrenome}</span>}

            <input type="date" name="dataNascimento" value={form.dataNascimento} onChange={handleChange} placeholder="dataNascimento" />
            {errors.dataNascimento && <span className="error">{errors.dataNascimento}</span>}
           
            <input type="date" name="dataAdmissao" value={form.dataAdmissao} onChange={handleChange} placeholder="dataAdmissao" />
            {errors.dataAdmissao && <span className="error">{errors.dataAdmissao}</span>}        
           
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            {errors.email && <span className="error">{errors.email}</span>}
            
            <input name="senha" value={form.senha} onChange={handleChange} placeholder="senha" />
            {errors.senha && <span className="error">{errors.senha}</span>}
            
            <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="cnpj" />
            {errors.cnpj && <span className="error">{errors.cnpj}</span>}
            
            <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="endereco" />
            {errors.endereco && <span className="error">{errors.endereco}</span>}
            
            <input name="ativo" value={form.ativo} onChange={handleChange} placeholder="ativo" />
            {errors.ativo && <span className="error">{errors.ativo}</span>}
            
            <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
            {errors.telefone && <span className="error">{errors.telefone}</span>}
            
            <input type="file" name="foto" onChange={handleChange} />
            {errors.foto && <span className="error">{errors.foto}</span>}
            
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

            <h2>Excluir Barbeiro?</h2>
            <p>Tem certeza que deseja remover este barbeiro?</p>

            <div className="modal-buttons">
              <button onClick={confirmarEDeletar}>Sim, Excluir</button>
              <button onClick={cancelarExclusao}>Cancelar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}