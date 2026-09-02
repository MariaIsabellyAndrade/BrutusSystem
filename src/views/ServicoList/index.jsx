import { useEffect, useState } from "react";

import "./index.css";

import ServicoCards from "./ServicoCards";

import {
    atualizarServico,
    criarServico,
    listarServicos,
    deletarServico
} from "../../service/serviceServico";

export default function ListaServicos() {

    const [servicos, setServicos] = useState([]);

    const [editando, setEditando] = useState(null);

    const [modo, setModo] = useState("editar");

    const [busca, setBusca] = useState("");

    const [filtroStatus, setFiltroStatus] = useState("todos");

    const [confirmarExclusao, setConfirmarExclusao] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        valor: "",
        duracao: "",
        ativo: true,
        foto: ""
    });


    /* =========================================================
       CARREGAR SERVIÇOS
       ========================================================= */

    const carregarServicos = async () => {
        try {

            const res = await listarServicos();

            setServicos(res.data);

        } catch (err) {

            console.error("Erro ao carregar serviços:", err);

        }
    };


    useEffect(() => {
        carregarServicos();
    }, []);


    /* =========================================================
       FILTRO
       ========================================================= */

    const servicosFiltrados = servicos.filter((s) => {

        const matchBusca =
            s.nome
                ?.toLowerCase()
                .includes(busca.toLowerCase());

        if (!matchBusca) {
            return false;
        }

        if (filtroStatus === "ativos") {
            return s.ativo === true;
        }

        if (filtroStatus === "inativos") {
            return s.ativo === false;
        }

        return true;
    });


    /* =========================================================
       MODAL
       ========================================================= */

    const fecharModal = () => {
        setEditando(null);
    };


    /* =========================================================
       NOVO SERVIÇO
       ========================================================= */

    const abrirCadastro = () => {

        setModo("criar");

        setForm({
            nome: "",
            descricao: "",
            valor: "",
            duracao: "",
            ativo: true,
            foto: ""
        });

        setEditando("novo");
    };


    /* =========================================================
       EDITAR SERVIÇO
       ========================================================= */

    const abrirEdicao = (servico) => {

        setModo("editar");

        setEditando(servico._id);

        setForm({
            nome: servico.nome || "",
            descricao: servico.descricao || "",
            valor: servico.valor || "",
            duracao: servico.duracao || "",
            ativo: servico.ativo ?? true,
            foto: ""
        });
    };


    /* =========================================================
       ALTERAR CAMPOS
       ========================================================= */

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked,
            files
        } = e.target;

        let novoValor = value;

        if (type === "checkbox") {
            novoValor = checked;
        }

        if (type === "file") {
            novoValor = files?.[0] || "";
        }

        setForm((prev) => ({
            ...prev,
            [name]: novoValor
        }));
    };


    /* =========================================================
       SALVAR
       ========================================================= */

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

            alert("Erro ao salvar serviço");

        }
    };


    /* =========================================================
       EXCLUIR
       ========================================================= */

    const abrirConfirmacao = (id) => {
        setConfirmarExclusao(id);
    };


    const cancelarExclusao = () => {
        setConfirmarExclusao(null);
    };


    const handleDelete = async (id) => {

        try {

            await deletarServico(id);

            await carregarServicos();

        } catch (error) {

            console.error("Erro ao excluir serviço:", error);

            alert("Erro ao excluir serviço");

        }
    };


    const confirmarEDeletar = async () => {

        if (!confirmarExclusao) {
            return;
        }

        await handleDelete(confirmarExclusao);

        setConfirmarExclusao(null);
    };


    return (

        <div className="servicos-page">

            <div className="servicos-container">

                {/* =====================================================
                    CABEÇALHO
                   ===================================================== */}

                <div className="servicos-header">

                    <div className="servicos-title-area">

                        <h1>SERVIÇOS</h1>

                        <p>
                            Gerencie os serviços oferecidos pela barbearia.
                        </p>

                    </div>

                </div>


                {/* =====================================================
                    CARDS DE RESUMO
                   ===================================================== */}

                <ServicoCards
                    filtro={filtroStatus}
                    setFiltro={setFiltroStatus}
                />


                {/* =====================================================
                    BUSCA + NOVO
                   ===================================================== */}

                <div className="servicos-controls">

                    <input
                        type="text"
                        placeholder="Buscar serviço..."
                        className="servicos-search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                    <button
                        className="servicos-btn-add"
                        onClick={abrirCadastro}
                    >
                        + Novo Serviço
                    </button>

                </div>


                {/* =====================================================
                    LISTA
                   ===================================================== */}

                <div className="servicos-lista">

                    {servicosFiltrados.length === 0 ? (

                        <p className="servicos-empty">
                            Nenhum serviço encontrado
                        </p>

                    ) : (

                        servicosFiltrados.map((s) => (

                            <div
                                key={s._id}
                                className="servico-card"
                            >

                                {/* FOTO */}

                                <img
                                    src={
                                        s.foto
                                            ? `/uploads/${s.foto}`
                                            : "/placeholder.png"
                                    }
                                    alt={s.nome}
                                    className="servico-foto"
                                />


                                {/* INFORMAÇÕES */}

                                <div className="servico-info">

                                    <h3>
                                        {s.nome}
                                    </h3>

                                    <span className="servico-descricao">
                                        {s.descricao}
                                    </span>

                                    <span className="servico-preco">
                                        R$ {s.valor}
                                    </span>

                                    <span>
                                        Duração: {s.duracao} min
                                    </span>

                                    <span
                                        className={`servico-status ${
                                            s.ativo
                                                ? "ativo"
                                                : "inativo"
                                        }`}
                                    >
                                        {s.ativo
                                            ? "● Ativo"
                                            : "● Inativo"}
                                    </span>

                                </div>


                                {/* AÇÕES */}

                                <div className="servico-actions">

                                    <button
                                        className="servico-btn-editar"
                                        onClick={() =>
                                            abrirEdicao(s)
                                        }
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="servico-btn-excluir"
                                        onClick={() =>
                                            abrirConfirmacao(s._id)
                                        }
                                    >
                                        Excluir
                                    </button>

                                </div>

                            </div>

                        ))

                    )}

                </div>


                {/* =====================================================
                    MODAL CADASTRO / EDIÇÃO
                   ===================================================== */}

                {editando !== null && (

                    <div
                        className="servicos-modal"
                        onClick={fecharModal}
                    >

                        <div
                            className="servicos-modal-content"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                {modo === "editar"
                                    ? "Editar Serviço"
                                    : "Novo Serviço"}
                            </h2>


                            {/* NOME */}

                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                placeholder="Nome do serviço"
                            />


                            {/* DESCRIÇÃO */}

                            <textarea
                                name="descricao"
                                value={form.descricao}
                                onChange={handleChange}
                                placeholder="Descrição do serviço"
                                className="servicos-textarea"
                            />


                            {/* VALOR */}

                            <label className="servicos-modal-label">
                                Valor
                            </label>

                            <input
                                type="number"
                                name="valor"
                                value={form.valor}
                                onChange={handleChange}
                                placeholder="Valor"
                                min="0"
                                step="0.01"
                            />


                            {/* DURAÇÃO */}

                            <label className="servicos-modal-label">
                                Duração
                            </label>

                            <input
                                type="number"
                                name="duracao"
                                value={form.duracao}
                                onChange={handleChange}
                                placeholder="Duração em minutos"
                                min="1"
                            />


                            {/* FOTO */}

                            <label className="servicos-modal-label">
                                Foto
                            </label>

                            <input
                                type="file"
                                name="foto"
                                onChange={handleChange}
                            />


                            {/* ATIVO */}

                            <label className="servicos-checkbox">

                                <input
                                    type="checkbox"
                                    name="ativo"
                                    checked={form.ativo}
                                    onChange={handleChange}
                                />

                                Ativo

                            </label>


                            {/* BOTÕES */}

                            <div className="servicos-modal-buttons">

                                <button
                                    className="servicos-btn-primary"
                                    onClick={handleSalvar}
                                >
                                    Salvar
                                </button>

                                <button
                                    className="servicos-btn-secondary"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    MODAL EXCLUSÃO
                   ===================================================== */}

                {confirmarExclusao && (

                    <div
                        className="servicos-modal"
                        onClick={cancelarExclusao}
                    >

                        <div
                            className="servicos-modal-content servicos-confirm-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                Excluir Serviço?
                            </h2>

                            <p>
                                Tem certeza que deseja remover
                                este serviço?
                            </p>

                            <div className="servicos-modal-buttons">

                                <button
                                    className="servicos-btn-danger"
                                    onClick={confirmarEDeletar}
                                >
                                    Sim, Excluir
                                </button>

                                <button
                                    className="servicos-btn-secondary"
                                    onClick={cancelarExclusao}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}