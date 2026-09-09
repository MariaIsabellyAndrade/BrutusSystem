import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

import {
  listarAgendamentosPorCliente,
  atualizarClientes
} from "../../service/serviceCliente";

 import {
   deletarAgendamento
 } from "../../service/serviceAgenda";

function HomeCliente() {
  const navigate = useNavigate();

  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // ================= PERFIL =================

  const [modo, setModo] = useState("visualizar");

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    cpf: "",
    rg: "",
    endereco: "",
    email: "",
    dataNascimento: "",
    foto: null
  });

  const [salvando, setSalvando] = useState(false);

  // ================= CLIENTE =================

  const clienteSalvo = JSON.parse(
    localStorage.getItem("cliente") || "{}"
  );

  const cliente =
    agendamentos.length > 0 && agendamentos[0].Cliente
      ? agendamentos[0].Cliente
      : clienteSalvo;

  const nome = cliente?.nome || "Cliente";
  const sobrenome = cliente?.sobrenome || "";

  const iniciais = `${nome.charAt(0)}${sobrenome.charAt(0)}`
    .toUpperCase();

  // ================= DATA ATUAL =================

  const dataAtual = new Date();

  const dataFormatada = dataAtual
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
    .toUpperCase();

  // ================= LOGOUT =================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cliente");
    localStorage.removeItem("entidadeId");

    navigate("/login");
  };

  // ================= EDITAR PERFIL =================

  const handleEditarPerfil = () => {
    setForm({
      nome: cliente?.nome || "",
      sobrenome: cliente?.sobrenome || "",
      telefone: cliente?.telefone || "",
      cpf: cliente?.cpf || "",
      rg: cliente?.rg || "",
      endereco: cliente?.endereco || "",
      email: cliente?.email || "",
      dataNascimento: cliente?.dataNascimento
        ? cliente.dataNascimento.split("T")[0]
        : "",
      foto: null
    });

    setModo("editar");
  };

  // ================= ALTERAR CAMPOS =================

  const handleChange = (e) => {
    const {
      name,
      value,
      files
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // ================= SALVAR PERFIL =================

  const handleSalvarPerfil = async () => {
    try {
      setSalvando(true);
      setErro("");

      const dados = {
        ...form
      };

      if (!dados.senha) {
        delete dados.senha;
      }

      await atualizarClientes(
        cliente._id,
        dados
      );

      setModo("visualizar");

      // Atualiza os dados da tela
      const response =
        await listarAgendamentosPorCliente();

      setAgendamentos(
        response.data || []
      );

    } catch (error) {
      console.error(
        "Erro ao atualizar perfil:",
        error
      );

      setErro(
        "Não foi possível atualizar seu perfil."
      );
    } finally {
      setSalvando(false);
    }
  };

  // ================= ATUALIZAR AGENDAMENTO =================

  const handleAtualizarAgendamento = (agendamento) => {
    navigate("/agendamento", {
      state: {
        modo: "editar",
        agendamento: agendamento
      }
    });
  };

  // ================= DELETAR AGENDAMENTO =================

  const handleDeletarAgendamento = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja deletar este agendamento?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await deletarAgendamento(id);

      // Remove da tela sem precisar recarregar
      setAgendamentos((prev) =>
        prev.filter(
          (agendamento) =>
            agendamento._id !== id
        )
      );

      alert(
        "Agendamento deletado com sucesso!"
      );

    } catch (error) {
      console.error(
        "Erro ao deletar agendamento:",
        error
      );

      alert(
        "Não foi possível deletar o agendamento."
      );
    }
  };

  // ================= BUSCAR AGENDAMENTOS =================

  useEffect(() => {
    const carregarAgendamentos = async () => {
      try {
        setCarregando(true);
        setErro("");

        const response =
          await listarAgendamentosPorCliente();

        setAgendamentos(
          response.data || []
        );

      } catch (error) {
        console.error(
          "Erro ao buscar agendamentos do cliente:",
          error
        );

        setErro(
          "Não foi possível carregar seus agendamentos."
        );

      } finally {
        setCarregando(false);
      }
    };

    carregarAgendamentos();
  }, []);

  // ================= PRÓXIMO AGENDAMENTO =================

  const agora = new Date();

  const proximosAgendamentos = agendamentos
    .filter((agendamento) => {

      const status =
        String(agendamento.status || "")
          .toUpperCase();

      if (status === "CANCELADO") {
        return false;
      }

      if (!agendamento.data || !agendamento.hora) {
        return false;
      }

      const dataHoraAgendamento =
        new Date(
          `${agendamento.data.split("T")[0]}T${agendamento.hora}:00`
        );

      return dataHoraAgendamento >= agora;
    })
    .sort((a, b) => {

      const dataA = new Date(
        `${a.data.split("T")[0]}T${a.hora}:00`
      );

      const dataB = new Date(
        `${b.data.split("T")[0]}T${b.hora}:00`
      );

      return dataA - dataB;
    });

  const proximoAgendamento =
    proximosAgendamentos[0];

  // ================= HISTÓRICO =================

  const historico = [...agendamentos]
    .sort((a, b) => {
      return (
        new Date(b.data) -
        new Date(a.data)
      );
    })
    .filter(
      (agendamento) =>
        agendamento._id !==
        proximoAgendamento?._id
    )
    .slice(0, 4);

  // ================= FUNÇÕES AUXILIARES =================

  const formatarData = (data) => {
    if (!data) {
      return "";
    }

    return new Date(data).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  };

  const formatarValor = (valor) => {
    return Number(valor || 0)
      .toFixed(2)
      .replace(".", ",");
  };

  const obterNomeServico = (agendamento) => {
    return (
      agendamento?.Servicos?.[0]?.Servico?.nome ||
      "Serviço"
    );
  };

  const obterNomeBarbeiro = (agendamento) => {
    if (!agendamento?.Barbeiro) {
      return "Barbeiro";
    }

    return `${agendamento.Barbeiro.nome || ""} ${
      agendamento.Barbeiro.sobrenome || ""
    }`.trim();
  };

  // ================= STATUS =================

  const obterStatusClass = (status) => {
    const statusNormalizado =
      String(status || "").toUpperCase();

    if (statusNormalizado === "CONFIRMADO") {
      return "status-confirmado";
    }

    if (statusNormalizado === "PENDENTE") {
      return "status-pendente";
    }

    if (statusNormalizado === "CANCELADO") {
      return "status-cancelado";
    }

    if (statusNormalizado === "CONCLUIDO") {
      return "status-concluido";
    }

    if (statusNormalizado === "AGENDADO") {
      return "status-agendado";
    }

    return "status-agendado";
  };

  const formatarStatus = (status) => {
    const statusNormalizado =
      String(status || "").toUpperCase();

    if (statusNormalizado === "CONFIRMADO") {
      return "CONFIRMADO";
    }

    if (statusNormalizado === "PENDENTE") {
      return "PENDENTE";
    }

    if (statusNormalizado === "CANCELADO") {
      return "CANCELADO";
    }

    if (statusNormalizado === "CONCLUIDO") {
      return "CONCLUÍDO";
    }

    if (statusNormalizado === "AGENDADO") {
      return "AGENDADO";
    }

    return status || "AGENDADO";
  };

  // ================= HTML =================

  return (
    <div className="cliente-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="cliente-sidebar">

        <div>

          <div className="perfil-ativo">

            <span>
              PERFIL ATIVO
            </span>

            <strong>
              CLIENTE
              <span className="perfil-arrow">
                ⌄
              </span>
            </strong>

          </div>

          <nav className="cliente-menu">

            <Link
              to="/cliente"
              className="menu-item active"
            >
              <span>▦</span>
              Início
            </Link>

            <Link
              to="/agendamentos"
              className="menu-item"
            >
              <span>◫</span>
              Meus agendamentos
            </Link>

            <Link
              to="/perfil"
              className="menu-item"
            >
              <span>⚙</span>
              Meu perfil
            </Link>

          </nav>

        </div>

        <div className="sidebar-user">

          <div className="sidebar-avatar">
            {iniciais || "CL"}
          </div>

          <div>

            <strong>
              {nome} {sobrenome}
            </strong>

            <button
              onClick={handleLogout}
            >
              Sair
            </button>

          </div>

        </div>

      </aside>

      {/* ================= CONTEÚDO ================= */}

      <main className="cliente-main">

        {/* ================= CABEÇALHO ================= */}

        <header className="cliente-header">

          <div>

            <span className="cliente-date">
              {dataFormatada}
            </span>

            <h1>
              Olá, {nome}.
            </h1>

            <p>
              Seu próximo atendimento está reservado.
            </p>

          </div>

          <Link
            to="/agendamento"
            className="novo-agendamento"
          >
            <span>+</span>
            NOVO AGENDAMENTO
          </Link>

        </header>

        {/* ================= PRÓXIMO AGENDAMENTO ================= */}

        <section className="proximo-card">

          <div className="proximo-label">
            PRÓXIMO AGENDAMENTO
          </div>

          {carregando ? (

            <div className="proximo-content">
              <p>
                Carregando...
              </p>
            </div>

          ) : erro ? (

            <div className="proximo-content">
              <p>
                {erro}
              </p>
            </div>

          ) : !proximoAgendamento ? (

            <div className="proximo-content">

              <div>

                <h2>
                  Nenhum agendamento
                </h2>

                <p>
                  Você ainda não possui um próximo
                  atendimento.
                </p>

              </div>

            </div>

          ) : (

            <div className="proximo-content">

              <div>

                <h2>
                  {obterNomeServico(
                    proximoAgendamento
                  )}
                </h2>

                <p>
                  {obterNomeBarbeiro(
                    proximoAgendamento
                  )}

                  {" · "}

                  {formatarData(
                    proximoAgendamento.data
                  )}

                  {" · "}

                  {proximoAgendamento.hora}
                </p>

              </div>

              <div className="proximo-right">

                <strong>
                  R${" "}
                  {formatarValor(
                    proximoAgendamento.valorTotal
                  )}
                </strong>

                <span
                  className={`status ${obterStatusClass(
                    proximoAgendamento.status
                  )}`}
                >
                  •{" "}
                  {formatarStatus(
                    proximoAgendamento.status
                  )}
                </span>

              </div>

            </div>

          )}

        </section>

        {/* ================= GRID INFERIOR ================= */}

        <div className="dashboard-grid">

          {/* ================= HISTÓRICO ================= */}

          <section className="historico-card">

            <div className="card-header">

              <div>

                <span>
                  HISTÓRICO
                </span>

                <h2>
                  Meus agendamentos
                </h2>

              </div>

              <Link to="/agendamentos">
                Ver todos
                <span>›</span>
              </Link>

            </div>

            <div className="historico-list">

              {carregando ? (

                <p>
                  Carregando agendamentos...
                </p>

              ) : historico.length === 0 ? (

                <p>
                  Nenhum agendamento encontrado.
                </p>

              ) : (

                historico.map((agendamento) => (

                  <div
                    className="historico-item"
                    key={agendamento._id}
                  >

                    {/* HORA */}

                    <div className="historico-hora">
                      {agendamento.hora}
                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="historico-info">

                      <strong>
                        {obterNomeServico(
                          agendamento
                        )}
                      </strong>

                      <span>
                        {obterNomeBarbeiro(
                          agendamento
                        )}
                      </span>

                      <small>
                        {formatarData(
                          agendamento.data
                        )}
                      </small>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`status ${obterStatusClass(
                        agendamento.status
                      )}`}
                    >
                      •{" "}
                      {formatarStatus(
                        agendamento.status
                      )}
                    </span>

                    {/* AÇÕES */}

                    <div className="agendamento-acoes">

                      <button
                        type="button"
                        className="btn-atualizar"
                        onClick={() =>
                          handleAtualizarAgendamento(
                            agendamento
                          )
                        }
                      >
                        ATUALIZAR
                      </button>

                      <button
                        type="button"
                        className="btn-deletar"
                        onClick={() =>
                          handleDeletarAgendamento(
                            agendamento._id
                          )
                        }
                      >
                        DELETAR
                      </button>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

          {/* ================= PERFIL ================= */}

          <section className="perfil-card">

            {modo === "visualizar" ? (

              <>

                <span className="perfil-label">
                  SEU PERFIL
                </span>

                <h2>
                  {nome} {sobrenome}
                </h2>

                <div className="cliente-avatar">
                  {iniciais || "CL"}
                </div>

                <p className="cliente-desde">

                  Cliente desde{" "}

                  {cliente?.createdAt
                    ? new Date(
                        cliente.createdAt
                      ).toLocaleDateString(
                        "pt-BR",
                        {
                          month: "long",
                          year: "numeric"
                        }
                      )
                    : "recentemente"}

                </p>

                <button
                  type="button"
                  className="editar-perfil"
                  onClick={handleEditarPerfil}
                >
                  EDITAR PERFIL
                </button>

              </>

            ) : (

              <>

                <span className="perfil-label">
                  EDITAR PERFIL
                </span>

                <h2>
                  Meus dados
                </h2>

                <div className="perfil-form">

                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={form.nome}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="sobrenome"
                    placeholder="Sobrenome"
                    value={form.sobrenome}
                    onChange={handleChange}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="telefone"
                    placeholder="Telefone"
                    value={form.telefone}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="cpf"
                    placeholder="CPF"
                    value={form.cpf}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="rg"
                    placeholder="RG"
                    value={form.rg}
                    onChange={handleChange}
                  />

                  <input
                    type="text"
                    name="endereco"
                    placeholder="Endereço"
                    value={form.endereco}
                    onChange={handleChange}
                  />

                  <input
                    type="date"
                    name="dataNascimento"
                    value={form.dataNascimento}
                    onChange={handleChange}
                  />

                  <input
                    type="file"
                    name="foto"
                    accept="image/*"
                    onChange={handleChange}
                  />

                </div>

                {erro && (

                  <p className="erro-perfil">
                    {erro}
                  </p>

                )}

                <div className="perfil-acoes">

                  <button
                    type="button"
                    onClick={() =>
                      setModo("visualizar")
                    }
                  >
                    CANCELAR
                  </button>

                  <button
                    type="button"
                    onClick={handleSalvarPerfil}
                    disabled={salvando}
                  >
                    {salvando
                      ? "SALVANDO..."
                      : "SALVAR ALTERAÇÕES"}
                  </button>

                </div>

              </>

            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default HomeCliente;