import { useEffect, useState } from "react";
import "./ListaBarbeiros.css";

export default function ListaBarbeiros() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetch("http://localhost:3000/barbeiros")
      .then((res) => res.json())
      .then((data) => setBarbeiros(data));
  }, []);

const handleDelete = async (id) => {
  if (!window.confirm("Deseja inativar?")) return;

  await fetch(`http://localhost:3000/barbeiros/${id}`, {
    method: "DELETE",
  });

  // 🔥 NÃO REMOVE, só atualiza status
  setBarbeiros((prev) =>
    prev.map((b) =>
      b._id === id ? { ...b, ativo: false } : b
    )
  );
};

  // 🔥 abrir modal
  const abrirEdicao = (barbeiro) => {
    setEditando(barbeiro._id);
    setForm(barbeiro);
  };

  // 🔥 fechar modal
  const fecharModal = () => {
    setEditando(null);
  };

  // 🔥 change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🔥 salvar
  const handleUpdate = async () => {
    const res = await fetch(
      `http://localhost:3000/barbeiros/${editando}`,
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
      alert(data.error || "Erro ao atualizar");
      return;
    }

    // atualiza lista
    setBarbeiros((prev) =>
      prev.map((b) => (b._id === editando ? { ...b, ...form } : b))
    );

    fecharModal();
  };

  return (
    <div className="container">

      <div className="right-bg"></div>

      <div className="list-container">
        <h1>Barbeiros</h1>
        <p>Lista de profissionais cadastrados 💈</p>

        <div className="list">
          {barbeiros.map((b) => (
            <div key={b._id} className="card">

              <img src={`http://localhost:3000/uploads/${b.foto}`} />

              <div className="info">
                <h3>{b.nome} {b.sobrenome}</h3>
                <span>{b.email}</span>

                <span className={b.ativo ? "ativo" : "inativo"}>
                  {b.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="actions">
                <button onClick={() => abrirEdicao(b)}>Editar</button>
                <button onClick={() => handleDelete(b._id)}>Excluir</button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 🔥 MODAL */}
      {editando && (
  <div className="modal">
    <div className="modal-content">

      <h2>Editar Barbeiro</h2>

      <input
        name="nome"
        value={form.nome || ""}
        onChange={handleChange}
        placeholder="Nome"
      />

      <input
        name="sobrenome"
        value={form.sobrenome || ""}
        onChange={handleChange}
        placeholder="Sobrenome"
      />

      <input
        type="date"
        name="dataNascimento"
        value={form.dataNascimento?.substring(0,10) || ""}
        onChange={handleChange}
      />

      <input
        type="date"
        name="dataAdmissao"
        value={form.dataAdmissao?.substring(0,10) || ""}
        onChange={handleChange}
      />

      <input
        name="email"
        value={form.email || ""}
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        type="password"
        name="senha"
        value={form.senha || ""}
        onChange={handleChange}
        placeholder="Senha"
      />

      <input
        name="cnpj"
        value={form.cnpj || ""}
        onChange={handleChange}
        placeholder="CNPJ"
      />

      <input
        name="endereco"
        value={form.endereco || ""}
        onChange={handleChange}
        placeholder="Endereço"
      />

      <input
        name="telefone"
        value={form.telefone || ""}
        onChange={handleChange}
        placeholder="Telefone"
      />

      {/* 🔥 ATIVO */}
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