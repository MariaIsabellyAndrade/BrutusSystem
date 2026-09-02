import { useEffect, useState } from "react";

import "./index.css";

import ClienteCards from "./ClienteCards";

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

    const [filtroStatus, setFiltroStatus] = useState("todos");

    const [confirmarExclusao, setConfirmarExclusao] = useState(null);

    const [errors, setErrors] = useState({});


    const [form, setForm] = useState({
        nome: "",
        sobrenome: "",
        dataNascimento: "",
        cpf: "",
        rg: "",
        endereco: "",
        ativo: true,
        telefone: "",
        foto: "",
        email: "",
        senha: ""
    });


    /* =========================================================
       VALIDAÇÕES
       ========================================================= */

    const validarEmail = (email) => {

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        return regex.test(email);
    };


    const validarCPF = (cpf) => {

        cpf = cpf.replace(/\D/g, "");

        if (cpf.length !== 11) {
            return false;
        }

        if (/^(\d)\1+$/.test(cpf)) {
            return false;
        }

        let soma = 0;
        let resto;


        for (let i = 1; i <= 9; i++) {

            soma +=
                parseInt(cpf.substring(i - 1, i)) *
                (11 - i);

        }


        resto = (soma * 10) % 11;

        if (resto === 10 || resto === 11) {
            resto = 0;
        }


        if (
            resto !==
            parseInt(cpf.substring(9, 10))
        ) {
            return false;
        }


        soma = 0;


        for (let i = 1; i <= 10; i++) {

            soma +=
                parseInt(cpf.substring(i - 1, i)) *
                (12 - i);

        }


        resto = (soma * 10) % 11;

        if (resto === 10 || resto === 11) {
            resto = 0;
        }


        return (
            resto ===
            parseInt(cpf.substring(10, 11))
        );
    };


    const validarRG = (rg) => {

        rg = rg.replace(/[^\dXx]/g, "");

        if (rg.length < 8 || rg.length > 9) {
            return false;
        }

        if (/^(\d)\1+$/.test(rg)) {
            return false;
        }

        return true;
    };


    const validate = () => {

        const newErrors = {};


        if (!form.nome) {
            newErrors.nome = "Obrigatório";
        }


        if (!form.sobrenome) {
            newErrors.sobrenome = "Obrigatório";
        }


        if (!form.telefone) {

            newErrors.telefone = "Obrigatório";

        } else if (
            !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(
                form.telefone
            )
        ) {

            newErrors.telefone = "Telefone inválido";

        }


        if (!form.endereco) {
            newErrors.endereco = "Obrigatório";
        }


        if (!form.cpf) {

            newErrors.cpf = "Obrigatório";

        } else if (!validarCPF(form.cpf)) {

            newErrors.cpf = "CPF inválido";

        }


        if (!form.rg) {

            newErrors.rg = "Obrigatório";

        } else if (!validarRG(form.rg)) {

            newErrors.rg = "RG inválido";

        }


        if (!form.dataNascimento) {

            newErrors.dataNascimento = "Obrigatório";

        } else {

            const hoje = new Date();

            const nascimento = new Date(
                form.dataNascimento
            );

            let idade =
                hoje.getFullYear() -
                nascimento.getFullYear();

            const mes =
                hoje.getMonth() -
                nascimento.getMonth();


            if (
                mes < 0 ||
                (
                    mes === 0 &&
                    hoje.getDate() < nascimento.getDate()
                )
            ) {

                idade--;

            }


            if (idade < 16) {

                newErrors.dataNascimento =
                    "Mínimo 16 anos";

            }

        }


        if (!form.email) {

            newErrors.email = "Obrigatório";

        } else if (!validarEmail(form.email)) {

            newErrors.email = "Email inválido";

        }


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    /* =========================================================
       FORMATAÇÃO
       ========================================================= */

    const formatarTelefone = (value) => {

        let tel = value.replace(/\D/g, "");

        tel = tel.slice(0, 11);


        if (tel.length <= 2) {
            return tel;
        }


        if (tel.length <= 6) {

            return tel.replace(
                /^(\d{2})(\d+)/,
                "($1) $2"
            );

        }


        if (tel.length <= 10) {

            return tel.replace(
                /^(\d{2})(\d{4})(\d+)/,
                "($1) $2-$3"
            );

        }


        return tel.replace(
            /^(\d{2})(\d{5})(\d+)/,
            "($1) $2-$3"
        );
    };


    const formatarCPF = (value) => {

        value = value.replace(/\D/g, "");

        value = value.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d{1,2})$/,
            "$1-$2"
        );

        return value.slice(0, 14);
    };


    const formatarRG = (value) => {

        value = value.replace(/\D/g, "");

        value = value.replace(
            /(\d{2})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /(\d{3})(\d{1})$/,
            "$1-$2"
        );

        return value.slice(0, 12);
    };


    /* =========================================================
       FILTRO
       ========================================================= */

    const clientesFiltrados = clientes.filter((c) => {

        const correspondeBusca =
            `${c.nome} ${c.sobrenome}`
                .toLowerCase()
                .includes(busca.toLowerCase());


        if (!correspondeBusca) {
            return false;
        }


        if (filtroStatus === "ativos") {
            return c.ativo === true;
        }


        if (filtroStatus === "inativos") {
            return c.ativo === false;
        }


        return true;
    });


    /* =========================================================
       CARREGAR CLIENTES
       ========================================================= */

    const carregarClientes = async () => {

        try {

            const res = await listarClientes();

            setClientes(res.data);

        } catch (err) {

            console.error(
                "Erro ao carregar clientes:",
                err
            );

        }
    };


    useEffect(() => {

        carregarClientes();

    }, []);


    /* =========================================================
       EXCLUSÃO
       ========================================================= */

    const handleDelete = async (id) => {

        try {

            await deletarClientes(id);

            await carregarClientes();

        } catch (error) {

            console.error(
                "Erro ao deletar:",
                error
            );

        }
    };


    const abrirConfirmacao = (id) => {

        setConfirmarExclusao(id);

    };


    const cancelarExclusao = () => {

        setConfirmarExclusao(null);

    };


    const confirmarEDeletar = async () => {

        if (!confirmarExclusao) {
            return;
        }

        await handleDelete(confirmarExclusao);

        setConfirmarExclusao(null);

    };


    /* =========================================================
       CADASTRO
       ========================================================= */

    const abrirCadastro = () => {

        setModo("criar");

        setErrors({});

        setForm({
            nome: "",
            sobrenome: "",
            dataNascimento: "",
            cpf: "",
            rg: "",
            endereco: "",
            ativo: true,
            telefone: "",
            foto: "",
            email: "",
            senha: ""
        });

        setEditando("novo");

    };


    /* =========================================================
       EDIÇÃO
       ========================================================= */

    const abrirEdicao = (c) => {

        setModo("editar");

        setErrors({});

        setEditando(c._id);

        setForm({

            nome: c.nome || "",

            sobrenome: c.sobrenome || "",

            dataNascimento:
                c.dataNascimento
                    ? c.dataNascimento.split("T")[0]
                    : "",

            cpf: c.cpf || "",

            rg: c.rg || "",

            endereco: c.endereco || "",

            ativo: c.ativo ?? true,

            telefone: c.telefone || "",

            foto: "",

            email: c.email || "",

            senha: ""

        });

    };


    /* =========================================================
       FECHAR MODAL
       ========================================================= */

    const fecharModal = () => {

        setEditando(null);

        setErrors({});

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


        let newValue = value;


        if (name === "telefone") {

            newValue =
                formatarTelefone(value);

        }


        if (name === "cpf") {

            newValue =
                formatarCPF(value);

        }


        if (name === "rg") {

            newValue =
                formatarRG(value);

        }


        if (type === "file") {

            newValue =
                files?.[0] || "";

        }


        if (type === "checkbox") {

            newValue = checked;

        }


        setForm((prev) => ({

            ...prev,

            [name]: newValue

        }));


        setErrors((prev) => ({

            ...prev,

            [name]: ""

        }));

    };


    /* =========================================================
       SALVAR
       ========================================================= */

    const handleSalvar = async () => {

        if (!validate()) {
            return;
        }


        try {

            if (modo === "editar") {

                const dados = {
                    ...form
                };


                /*
                 * Não manda senha vazia durante edição.
                 */

                if (!dados.senha) {

                    delete dados.senha;

                }


                await atualizarClientes(
                    editando,
                    dados
                );

            } else {

                await criarClientes(form);

            }


            await carregarClientes();

            setEditando(null);

            setErrors({});

        } catch (err) {

            console.error(
                "Erro ao salvar:",
                err
            );

            alert("Erro ao salvar cliente");

        }
    };


    return (

        <div className="clientes-page">

            <div className="clientes-container">


                {/* =====================================================
                    CABEÇALHO
                   ===================================================== */}

                <div className="clientes-header">

                    <div className="clientes-title-area">

         <span className="eyebrow">
                CLIENTES BRUTUS
              </span>

              <h1> CLIENTES</h1>

                    </div>

                </div>


                {/* =====================================================
                    CARDS
                   ===================================================== */}

                <ClienteCards
                    filtro={filtroStatus}
                    setFiltro={setFiltroStatus}
                />


                {/* =====================================================
                    CONTROLES
                   ===================================================== */}

                <div className="clientes-controls">

                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="clientes-search"
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                    />


                    <button
                        className="clientes-btn-add"
                        onClick={abrirCadastro}
                    >
                        + Novo Cliente
                    </button>

                </div>


                {/* =====================================================
                    LISTA
                   ===================================================== */}

                <div className="clientes-lista">

                    {clientesFiltrados.length === 0 ? (

                        <p className="clientes-empty">
                            Nenhum cliente encontrado
                        </p>

                    ) : (

                        clientesFiltrados.map((c) => (

                            <div
                                key={c._id}
                                className="cliente-card"
                            >

                                {/* FOTO */}

                                <img
                                    src={
                                        c.foto
                                            ? `/uploads/${c.foto}`
                                            : "/placeholder.png"
                                    }
                                    alt={c.nome}
                                    className="cliente-foto"
                                />


                                {/* INFORMAÇÕES */}

                                <div className="cliente-info">

                                    <h3>
                                        {c.nome} {c.sobrenome}
                                    </h3>

                                    <span>
                                        {c.email}
                                    </span>

                                    <span>
                                        CPF: {c.cpf}
                                    </span>

                                    <span>
                                        {c.telefone}
                                    </span>

                                    <span
                                        className={`cliente-status ${
                                            c.ativo
                                                ? "ativo"
                                                : "inativo"
                                        }`}
                                    >
                                        {c.ativo
                                            ? "● Ativo"
                                            : "● Inativo"}
                                    </span>

                                </div>


                                {/* AÇÕES */}

                                <div className="cliente-actions">

                                    <button
                                        className="cliente-btn-editar"
                                        onClick={() =>
                                            abrirEdicao(c)
                                        }
                                    >
                                        Editar
                                    </button>


                                    <button
                                        className="cliente-btn-excluir"
                                        onClick={() =>
                                            abrirConfirmacao(
                                                c._id
                                            )
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
                        className="clientes-modal"
                        onClick={fecharModal}
                    >

                        <div
                            className="clientes-modal-content"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                {modo === "editar"
                                    ? "Editar Cliente"
                                    : "Novo Cliente"}
                            </h2>


                            {/* NOME */}

                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                placeholder="Nome"
                            />

                            {errors.nome && (
                                <span className="clientes-error">
                                    {errors.nome}
                                </span>
                            )}


                            {/* SOBRENOME */}

                            <input
                                name="sobrenome"
                                value={form.sobrenome}
                                onChange={handleChange}
                                placeholder="Sobrenome"
                            />

                            {errors.sobrenome && (
                                <span className="clientes-error">
                                    {errors.sobrenome}
                                </span>
                            )}


                            {/* DATA NASCIMENTO */}

                            <label className="clientes-modal-label">
                                Data de nascimento
                            </label>

                            <input
                                type="date"
                                name="dataNascimento"
                                value={form.dataNascimento}
                                onChange={handleChange}
                            />

                            {errors.dataNascimento && (
                                <span className="clientes-error">
                                    {errors.dataNascimento}
                                </span>
                            )}


                            {/* CPF */}

                            <input
                                name="cpf"
                                value={form.cpf}
                                onChange={handleChange}
                                placeholder="CPF"
                            />

                            {errors.cpf && (
                                <span className="clientes-error">
                                    {errors.cpf}
                                </span>
                            )}


                            {/* RG */}

                            <input
                                name="rg"
                                value={form.rg}
                                onChange={handleChange}
                                placeholder="RG"
                            />

                            {errors.rg && (
                                <span className="clientes-error">
                                    {errors.rg}
                                </span>
                            )}


                            {/* ENDEREÇO */}

                            <input
                                name="endereco"
                                value={form.endereco}
                                onChange={handleChange}
                                placeholder="Endereço"
                            />

                            {errors.endereco && (
                                <span className="clientes-error">
                                    {errors.endereco}
                                </span>
                            )}


                            {/* TELEFONE */}

                            <input
                                name="telefone"
                                value={form.telefone}
                                onChange={handleChange}
                                placeholder="Telefone"
                            />

                            {errors.telefone && (
                                <span className="clientes-error">
                                    {errors.telefone}
                                </span>
                            )}


                            {/* EMAIL */}

                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />

                            {errors.email && (
                                <span className="clientes-error">
                                    {errors.email}
                                </span>
                            )}


                            {/* SENHA */}

                            <input
                                type="password"
                                name="senha"
                                value={form.senha}
                                onChange={handleChange}
                                placeholder={
                                    modo === "editar"
                                        ? "Nova senha (opcional)"
                                        : "Senha"
                                }
                            />


                            {/* FOTO */}

                            <label className="clientes-modal-label">
                                Foto
                            </label>

                            <input
                                type="file"
                                name="foto"
                                onChange={handleChange}
                            />


                            {/* ATIVO */}

                            <label className="clientes-checkbox">

                                <input
                                    type="checkbox"
                                    name="ativo"
                                    checked={form.ativo}
                                    onChange={handleChange}
                                />

                                Ativo

                            </label>


                            {/* BOTÕES */}

                            <div className="clientes-modal-buttons">

                                <button
                                    className="clientes-btn-primary"
                                    onClick={handleSalvar}
                                >
                                    Salvar
                                </button>


                                <button
                                    className="clientes-btn-secondary"
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
                        className="clientes-modal"
                        onClick={cancelarExclusao}
                    >

                        <div
                            className="clientes-modal-content clientes-confirm-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                Excluir Cliente?
                            </h2>

                            <p>
                                Tem certeza que deseja remover
                                este cliente?
                            </p>


                            <div className="clientes-modal-buttons">

                                <button
                                    className="clientes-btn-danger"
                                    onClick={
                                        confirmarEDeletar
                                    }
                                >
                                    Sim, Excluir
                                </button>


                                <button
                                    className="clientes-btn-secondary"
                                    onClick={
                                        cancelarExclusao
                                    }
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