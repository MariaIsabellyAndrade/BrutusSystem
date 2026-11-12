import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import AtualizarAgendamento from "../Agendar/AtualizarAgendamento";
import {
    listarAgendamentosPorCliente,
    atualizarClientes,
    buscarConsentimentoWhatsApp,
    atualizarConsentimentoWhatsApp
} from "../../service/serviceCliente";
import {
    deletarAgendamento,
    atualizarAgendamento
} from "../../service/serviceAgenda";
import { formatarCPF, formatarRG, formatarTelefone } from "../../utils/masks";
import { formatarDataSemFuso, formatarMoedaExibicao } from "../../utils/formatters";

function HomeCliente() {
    const navigate = useNavigate();

    const [agendamentos, setAgendamentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [modo, setModo] = useState("visualizar");
    const [consentimentoWhatsApp, setConsentimentoWhatsApp] = useState(false);
    const [salvandoConsentimento, setSalvandoConsentimento] = useState(false);
    const [erroConsentimento, setErroConsentimento] = useState("");

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
    const [modalAtualizarAberta, setModalAtualizarAberta] = useState(false);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

    const clienteSalvo = JSON.parse(
        localStorage.getItem("cliente") || "{}"
    );

    const cliente =
        agendamentos.length > 0 && agendamentos[0].Cliente
            ? agendamentos[0].Cliente
            : clienteSalvo;

    const nome = cliente?.nome || "Cliente";
    const sobrenome = cliente?.sobrenome || "";
    const iniciais = `${nome.charAt(0)}${sobrenome.charAt(0)}`.toUpperCase();

    const dataAtual = new Date();
    const dataFormatada = dataAtual
        .toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        .toUpperCase();

    const handleLogout = () => {
        ["token", "tipo", "entidadeId"].forEach((chave) => sessionStorage.removeItem(chave));
        ["token", "tipo", "entidadeId"].forEach((chave) => localStorage.removeItem(chave));
        localStorage.removeItem("cliente");
        navigate("/login");
    };

    const handleEditarPerfil = () => {
        setForm({
            nome: cliente?.nome || "",
            sobrenome: cliente?.sobrenome || "",
            telefone: cliente?.telefone ? formatarTelefone(cliente.telefone) : "",
            cpf: cliente?.cpf ? formatarCPF(cliente.cpf) : "",
            rg: cliente?.rg ? formatarRG(cliente.rg) : "",
            endereco: cliente?.endereco || "",
            email: cliente?.email || "",
            dataNascimento: cliente?.dataNascimento
                ? cliente.dataNascimento.split("T")[0]
                : "",
            foto: null
        });
        setModo("editar");
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        let newValue = value;

        if (name === "cpf") newValue = formatarCPF(value);
        if (name === "rg") newValue = formatarRG(value);
        if (name === "telefone") newValue = formatarTelefone(value);

        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : newValue
        }));
    };

        const handleSalvarPerfil = async () => {
        try {
            setSalvando(true);
            setErro("");

            const dados = { ...form };
            if (!dados.senha) delete dados.senha;

            await atualizarClientes(cliente._id, dados);

            // Atualiza o localStorage com os novos dados do perfil
            const clienteAtualizado = {
                ...clienteSalvo,
                nome: form.nome,
                sobrenome: form.sobrenome,
                telefone: form.telefone,
                email: form.email,
                endereco: form.endereco,
            };
            localStorage.setItem("cliente", JSON.stringify(clienteAtualizado));

            setModo("visualizar");

            const response = await listarAgendamentosPorCliente();
            setAgendamentos(response.data || []);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            setErro("Não foi possível atualizar seu perfil.");
        } finally {
            setSalvando(false);
        }
    };

    const handleDeletarAgendamento = async (id) => {
        const confirmar = window.confirm(
            "Tem certeza que deseja deletar este agendamento?"
        );
        if (!confirmar) return;

        try {
            await deletarAgendamento(id);
            setAgendamentos((prev) =>
                prev.filter((agendamento) => agendamento._id !== id)
            );
        } catch (error) {
            console.error("Erro ao deletar agendamento:", error);
            alert("Não foi possível deletar o agendamento.");
        }
    };

    const handleAtualizarAgendamento = (agendamento) => {
        setAgendamentoSelecionado(agendamento);
        setModalAtualizarAberta(true);
    };

    const handleFecharModal = () => {
        setModalAtualizarAberta(false);
        setAgendamentoSelecionado(null);
    };

    const handleSalvarAgendamento = async (dados) => {
        try {
            await atualizarAgendamento(
                dados.id,
                dados.data,
                dados.hora,
                dados.servicoIds
            );
            setModalAtualizarAberta(false);
            setAgendamentoSelecionado(null);

            const response = await listarAgendamentosPorCliente();
            setAgendamentos(response.data || []);
        } catch (error) {
            console.error("Erro ao atualizar agendamento:", error);
            alert(
                error.response?.data?.message ||
                "Não foi possível atualizar o agendamento."
            );
        }
    };

    useEffect(() => {
        const carregarAgendamentos = async () => {
            try {
                setCarregando(true);
                setErro("");
                const response = await listarAgendamentosPorCliente();
                setAgendamentos(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar agendamentos do cliente:", error);
                setErro("Não foi possível carregar seus agendamentos.");
            } finally {
                setCarregando(false);
            }
        };

        carregarAgendamentos();
    }, []);

    useEffect(() => {
        buscarConsentimentoWhatsApp()
            .then(({ data }) => setConsentimentoWhatsApp(data.consentimento === true))
            .catch((error) => {
                console.error("Erro ao carregar autorização do WhatsApp:", error);
                setErroConsentimento("Não foi possível carregar sua autorização para lembretes.");
            });
    }, []);

    const handleAlterarConsentimentoWhatsApp = async (event) => {
        const valor = event.target.checked;
        setSalvandoConsentimento(true);
        setErroConsentimento("");
        try {
            const { data } = await atualizarConsentimentoWhatsApp(valor);
            setConsentimentoWhatsApp(data.consentimento === true);
        } catch (error) {
            event.target.checked = consentimentoWhatsApp;
            setErroConsentimento(error.response?.data?.erro || "Não foi possível salvar sua preferência.");
        } finally {
            setSalvandoConsentimento(false);
        }
    };

    const agora = new Date();
    const proximosAgendamentos = agendamentos
        .filter((agendamento) => {
            const status = String(agendamento.status || "").toUpperCase();
            if (status === "CANCELADO") return false;
            if (!agendamento.data || !agendamento.hora) return false;

            const dataHoraAgendamento = new Date(
                `${agendamento.data.split("T")[0]}T${agendamento.hora}:00`
            );
            return dataHoraAgendamento >= agora;
        })
        .sort((a, b) => {
            const dataA = new Date(`${a.data.split("T")[0]}T${a.hora}:00`);
            const dataB = new Date(`${b.data.split("T")[0]}T${b.hora}:00`);
            return dataA - dataB;
        });

    const proximoAgendamento = proximosAgendamentos[0];

    const historico = [...agendamentos]
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .filter((agendamento) => agendamento._id !== proximoAgendamento?._id)
        .slice(0, 4);

    const obterNomeServico = (agendamento) => {
        return agendamento?.Servicos?.[0]?.Servico?.nome || "Serviço";
    };

    const obterNomeBarbeiro = (agendamento) => {
        if (!agendamento?.Barbeiro) return "Barbeiro";
        return `${agendamento.Barbeiro.nome || ""} ${agendamento.Barbeiro.sobrenome || ""}`.trim();
    };

    const obterStatusClass = (status) => {
        const statusNormalizado = String(status || "").toUpperCase();
        if (statusNormalizado === "CONFIRMADO") return "status-confirmado";
        if (statusNormalizado === "PENDENTE") return "status-pendente";
        if (statusNormalizado === "CANCELADO") return "status-cancelado";
        if (statusNormalizado === "CONCLUIDO") return "status-concluido";
        return "status-agendado";
    };

    const formatarStatus = (status) => {
        const statusNormalizado = String(status || "").toUpperCase();
        if (statusNormalizado === "CONFIRMADO") return "CONFIRMADO";
        if (statusNormalizado === "PENDENTE") return "PENDENTE";
        if (statusNormalizado === "CANCELADO") return "CANCELADO";
        if (statusNormalizado === "CONCLUIDO") return "CONCLUÍDO";
        return status || "AGENDADO";
    };

    return (
        <div className="cliente-dashboard">
            {/* SIDEBAR */}
            <aside className="cliente-sidebar">
                <div>
                    <div className="perfil-ativo">
                        <span>PERFIL ATIVO</span>
                        <strong>
                            CLIENTE
                            <span className="perfil-arrow">⌄</span>
                        </strong>
                    </div>

                    <nav className="cliente-menu">
                        <Link to="/cliente-home" className="menu-item active">
                            <span>▦</span>
                            Início
                        </Link>
                        <Link to="/agendar" className="menu-item">
                            <span>◫</span>
                            Agendar
                        </Link>
                    </nav>
                </div>

                {/* USUÁRIO */}
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{iniciais || "CL"}</div>
                    <div>
                        <strong>{nome} {sobrenome}</strong>
                        <button onClick={handleLogout}>Sair</button>
                    </div>
                </div>
            </aside>

            {/* CONTEÚDO */}
            <main className="cliente-main">
                {/* HEADER */}
                <header className="cliente-header">
                    <div>
                        <span className="cliente-date">{dataFormatada}</span>
                        <h1>Olá, {nome}.</h1>
                        <p>Seu próximo atendimento está reservado.</p>
                    </div>

                    <Link to="/agendar" className="novo-agendamento">
                        <span>+</span>
                        NOVO AGENDAMENTO
                    </Link>
                </header>

                {/* PRÓXIMO AGENDAMENTO */}
                <section className="proximo-card">
                    <div className="proximo-label">PRÓXIMO AGENDAMENTO</div>

                    {carregando ? (
                        <div className="proximo-content">
                            <p>Carregando...</p>
                        </div>
                    ) : erro ? (
                        <div className="proximo-content">
                            <p>{erro}</p>
                        </div>
                    ) : !proximoAgendamento ? (
                        <div className="proximo-content">
                            <div>
                                <h2>Nenhum agendamento futuro</h2>
                                <p>Você ainda não possui um próximo atendimento agendado.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="proximo-content">
                            <div>
                                <h2>{obterNomeServico(proximoAgendamento)}</h2>
                                <p>
                                    {obterNomeBarbeiro(proximoAgendamento)}
                                    {" · "}
                                    {formatarDataSemFuso(proximoAgendamento.data)}
                                    {" · "}
                                    {proximoAgendamento.hora}
                                </p>
                            </div>

                            <div className="proximo-right">
                                <strong>
                                    {formatarMoedaExibicao(proximoAgendamento.valorTotal || 0)}
                                </strong>
                                <span className={`status ${obterStatusClass(proximoAgendamento.status)}`}>
                                    • {formatarStatus(proximoAgendamento.status)}
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* GRID */}
                <div className="dashboard-grid">
                    {/* HISTÓRICO */}
                    <section className="historico-card">
                        <div className="card-header">
                            <div>
                                <span>HISTÓRICO</span>
                                <h2>Meus agendamentos</h2>
                            </div>
                        </div>

                        <div className="historico-list">
                            {carregando ? (
                                <p>Carregando agendamentos...</p>
                            ) : historico.length === 0 ? (
                                <p>Nenhum agendamento encontrado.</p>
                            ) : (
                                historico.map((agendamento) => (
                                    <div className="historico-item" key={agendamento._id}>
                                        <div className="historico-hora">{agendamento.hora}</div>

                                        <div className="historico-info">
                                            <strong>{obterNomeServico(agendamento)}</strong>
                                            <span>{obterNomeBarbeiro(agendamento)}</span>
                                            <small>{formatarDataSemFuso(agendamento.data)}</small>
                                        </div>

                                        <span className={`status ${obterStatusClass(agendamento.status)}`}>
                                            • {formatarStatus(agendamento.status)}
                                        </span>

                                        <div className="agendamento-acoes">
                                            <button
                                                type="button"
                                                className="btn-atualizar"
                                                onClick={() => handleAtualizarAgendamento(agendamento)}
                                            >
                                                EDITAR
                                            </button>

                                            <button
                                                type="button"
                                                className="btn-deletar"
                                                onClick={() => handleDeletarAgendamento(agendamento._id)}
                                            >
                                                CANCELAR
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                <section className="whatsapp-consentimento-card">
                    <div>
                        <span className="whatsapp-consentimento-kicker">LEMBRETES DE AGENDAMENTO</span>
                        <h2>Receber lembretes pelo WhatsApp</h2>
                        <p>Enviaremos uma mensagem um dia antes dos seus horários confirmados.</p>
                        {erroConsentimento && <small className="whatsapp-consentimento-erro">{erroConsentimento}</small>}
                    </div>
                    <label className="whatsapp-consentimento-toggle">
                        <input type="checkbox" checked={consentimentoWhatsApp} disabled={salvandoConsentimento} onChange={handleAlterarConsentimentoWhatsApp} />
                        <span>{salvandoConsentimento ? "Salvando..." : consentimentoWhatsApp ? "Autorizado" : "Desativado"}</span>
                    </label>
                </section>
            </main>

            {/* MODAL DE ATUALIZAÇÃO */}
            {modalAtualizarAberta && (
                <AtualizarAgendamento
                    agendamento={agendamentoSelecionado}
                    onFechar={handleFecharModal}
                    onSalvar={handleSalvarAgendamento}
                />
            )}
        </div>
    );
}

export default HomeCliente;
