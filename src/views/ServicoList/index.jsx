import { useEffect, useState } from "react";
import "./index.css";
import ServicoCards from "./ServicoCards";
import { atualizarServico, criarServico, listarServicos,deletarServico  } from "../../service/serviceServico";
export default function ListaServicos() {
  
  const [servicos, setServicos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({
  nome: "",
  descricao: "",
  valor: "",
  duracao: "",
  ativo: true, 
  foto: ""
});
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState("editar");


  const [confirmarExclusao, setConfirmarExclusao] = useState(null); // Armazena o ID do serviço

// Função que substitui o window.confirm
const abrirConfirmacao = (id) => {
  setConfirmarExclusao(id);
};

const cancelarExclusao = () => {
  setConfirmarExclusao(null);
};

const confirmarEDeletar = () => {
  handleDelete(confirmarExclusao); // Chama sua função original de deletar
  setConfirmarExclusao(null); // Fecha o modal
};


const servicosFiltrados = servicos.filter((s) =>
  s.nome?.toLowerCase().includes(busca.toLowerCase())
);

  const fecharModal = () => {
  setEditando(null);
};
    const carregarServicos = async () => {
    try {
        const res = await listarServicos();
        setServicos(res.data);
    } catch (err) {
        console.error(err);
    }
    };
    useEffect(() => {
        carregarServicos();
    }, []);

const handleDelete = async (id) => {
  try {
    await deletarServico(id);
    await carregarServicos();
  } catch (error) {
    console.error("Erro ao inativar:", error);
  }
};


const abrirCadastro = () => {
  setModo("criar");
  setForm({ nome: '', descricao: '', valor: '', duracao: '', ativo: true, foto:''});
  setEditando(true);
};



const abrirEdicao = (servico) => {
  setModo("editar");
  setEditando(servico._id);

  setForm({
    nome: servico.nome || "",
    descricao: servico.descricao || "",
    valor: servico.valor || "",
    duracao: servico.duracao || "",
    ativo: servico.ativo || false
  });
};

  const handleChange = (e) => {
  const { name, value, type, checked,files } = e.target;
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

const handleSalvar = async () => {
  try {

    if (modo === "editar") {
      await atualizarServico(editando, form);
    } else {
      await criarServico(form);
    }

    await carregarServicos();
    setEditando(null);

  } catch (err) {
    console.error("Erro ao salvar:", err);
    alert("Erro ao salvar");
  }
};
return (
 <div className="container">
  <ServicoCards/>
    <div className="right-bg"></div>
    <div className="list-container">
  

      {/* 🔍 BARRA DE BUSCA E BOTÃO CADASTRAR */}
      <div className="controls">
        <input 
        type="text" 
        placeholder="Buscar serviço..." 
        className="search-input"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        />
        <button className="btn-add" onClick={abrirCadastro}>
          + Novo Serviço
        </button>
      </div>

      <div className="list">
        {servicosFiltrados.length === 0? (
          <p className="empty-msg">Nenhum serviço encontrado</p>
        ) : (
          servicosFiltrados.map((s) => (
            <div key={s._id} className="card">
              <img
                src={
                  s.foto
                    ? `http://localhost:3000/uploads/${s.foto}`
                    : "/placeholder.png"
                }
                alt={s.nome}
              />

              <div className="info">
                <h3>{s.nome}</h3>
                <span>{s.descricao}</span>
                <span className="price">R$ {s.valor}</span>
                <span>Duração: {s.duracao} min</span>

                <span className={s.ativo ? "ativo" : "inativo"}>
                  {s.ativo ? "● Ativo" : "● Inativo"}
                </span>
              </div>

              <div className="actions">
                <button className="btn-edit" onClick={() => abrirEdicao(s)}>Editar</button>
               <button className="btn-delete" onClick={() => abrirConfirmacao(s._id)}>Excluir</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* 🔥 MODAL */}
    {editando !== null && (
      <div className="modal" onClick={fecharModal}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >

            <h2>{modo === "editar" ? "Editar Cliente" : "Novo Cliente"}</h2>

          <input
            name="nome"
            value={form.nome || ""}
            onChange={handleChange}
            placeholder="Nome"
          />

          <input
            name="descricao"
            value={form.descricao || ""}
            onChange={handleChange}
            placeholder="Descrição"
          />

          <input
            type="number"
            name="valor"
            value={form.valor || ""}
            onChange={handleChange}
            placeholder="Valor"
          />

          <input
            type="number"
            name="duracao"
            value={form.duracao || ""}
            onChange={handleChange}
            placeholder="Duração (min)"
          />

            <input type="file" name="foto" onChange={handleChange} />

          {/* ATIVO */}
          <label className="checkbox">
            <input
              type="checkbox"
              name="ativo"
              checked={form.ativo || false}
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

    {confirmarExclusao && (
    <div className="modal" onClick={cancelarExclusao}>
        <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Excluir Serviço?</h2>
        <p>Tem certeza que deseja remover este serviço? Esta ação não pode ser desfeita.</p>
        
        <div className="modal-buttons">
            <button className="btn-confirm-delete" onClick={confirmarEDeletar}>
            Sim, Excluir
            </button>
            <button onClick={cancelarExclusao}>Cancelar</button>
        </div>
        </div>
    </div>
    )}

  </div>
);
}