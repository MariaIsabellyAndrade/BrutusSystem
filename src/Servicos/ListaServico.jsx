import { useEffect, useState } from "react";
import "./ListaServicos.css";

export default function ListaServicos() {
  const [servicos, setServicos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  // 🔥 carregar lista
  useEffect(() => {
    fetch("http://localhost:3000/servicos")
      .then((res) => res.json())
      .then((data) => setServicos(data));
  }, []);

  // 🔥 inativar (DELETE lógico)
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja inativar?")) return;

    await fetch(`http://localhost:3000/servicos/${id}`, {
      method: "DELETE",
    });

    setServicos((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, ativo: false } : s
      )
    );
  };

  // 🔥 abrir modal
  const abrirEdicao = (servico) => {
    setEditando(servico._id);

    setForm({
      nome: servico.nome || "",
      descricao: servico.descricao || "",
      valor: servico.valor || "",
      duracao: servico.duracao || "",
      ativo: servico.ativo || false
    });
  };

  // 🔥 fechar modal
  const fecharModal = () => {
    setEditando(null);
  };

  // 🔥 change inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // 🔥 salvar edição
const handleUpdate = async () => {
  try {
    const res = await fetch(
      `http://localhost:3000/servicos/${editando}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Erro ao atualizar");
      return;
    }

    // atualiza lista
    setServicos((prev) =>
      prev.map((s) =>
        s._id === editando ? { ...s, ...form } : s
      )
    );

    // ✅ FECHA MODAL CORRETAMENTE
    setEditando(null);

  } catch (err) {
    console.error("Erro no update:", err);
    alert("Erro na requisição");
  }
};
  return (
    <div className="container">

      <div className="right-bg"></div>

      <div className="list-container">
        <h1>Serviços</h1>
        <p>Lista de serviços cadastrados 💈</p>

        <div className="list">
          {servicos.map((s) => (
            <div key={s._id} className="card">

              <img
                src={`http://localhost:3000/uploads/${s.foto}`}
                alt={s.nome}
              />

              <div className="info">
                <h3>{s.nome}</h3>
                <span>{s.descricao}</span>
                <span>R$ {s.valor}</span>
                <span>Duração: {s.duracao} min</span>

                <span className={s.ativo ? "ativo" : "inativo"}>
                  {s.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="actions">
                <button onClick={() => abrirEdicao(s)}>Editar</button>
                <button onClick={() => handleDelete(s._id)}>Excluir</button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 🔥 MODAL */}
      {editando !== null && (
  <div className="modal">
    <div className="modal-content">

      <h2>Editar Serviço</h2>

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



      {/* ATIVO */}
      <label className="checkbox">
        <input
          type="checkbox"
          name="ativo"
          checked={form.ativo || false}
          onChange={(e) =>
            setForm({ ...form, ativo: e.target.checked })
          }
        />
        Ativo
      </label>

      <div className="modal-buttons">
        <button onClick={handleUpdate}>Salvar</button>
        <button onClick={fecharModal}>Cancelar</button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}