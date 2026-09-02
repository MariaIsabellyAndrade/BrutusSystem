import { useEffect, useState } from "react";
import "./index.css";
import BarbeiroCards from "./BarbeiroCards";
import {
    listarBarbeiros,
    criarBarbeiros,
    atualizarBarbeiros,
    deletarBarbeiros,
    getUrlFotoBarbeiro
} from "../../service/serviceBarbeiro";
import { useNavigate } from "react-router-dom";


export default function ListarBarbeiros() {

    const navigate = useNavigate();
    const [barbeiros, setBarbeiros] = useState([]);
    const [editando, setEditando] = useState(null);
    const [modo, setModo] = useState("editar");
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState("todos");

    const [form, setForm] = useState({
        nome: "",
        sobrenome: "",
        dataNascimento: "",
        dataAdmissao: "",
        email: "",
        senha: "",
        cnpj: "",
        endereco: "",
        ativo: true,
        telefone: "",
        foto: ""
    });

    const [confirmarExclusao, setConfirmarExclusao] = useState(null);
    const [errors, setErrors] = useState({});


    /* =========================================================
       VALIDAÇÃO
       ========================================================= */

    const validarEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return regex.test(email);
    };


    const validarCNPJ = (cnpj) => {

        cnpj = cnpj.replace(/[^\d]+/g, "");

        if (cnpj.length !== 14) return false;

        if (/^(\d)\1+$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);

        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {

            soma += numeros.charAt(tamanho - i) * pos--;

            if (pos < 2) {
                pos = 9;
            }
        }

        let resultado =
            soma % 11 < 2
                ? 0
                : 11 - (soma % 11);

        if (resultado != digitos.charAt(0)) {
            return false;
        }

        tamanho++;

        numeros = cnpj.substring(0, tamanho);

        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {

            soma += numeros.charAt(tamanho - i) * pos--;

            if (pos < 2) {
                pos = 9;
            }
        }

        resultado =
            soma % 11 < 2
                ? 0
                : 11 - (soma % 11);

        return resultado == digitos.charAt(1);
    };


    const validate = () => {

        let newErrors = {};

        if (!form.nome) {
            newErrors.nome = "Obrigatório";
        }

        if (!form.sobrenome) {
            newErrors.sobrenome = "Obrigatório";
        }

        /*
         * Senha obrigatória somente ao criar.
         * Na edição, pode permanecer vazia.
         */
        if (modo === "criar" && !form.senha) {
            newErrors.senha = "Obrigatório";
        }

        if (!form.email) {

            newErrors.email = "Obrigatório";

        } else if (!validarEmail(form.email)) {

            newErrors.email = "Email inválido";
        }


        if (!form.telefone) {

            newErrors.telefone = "Obrigatório";

        } else if (
            !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(form.telefone)
        ) {

            newErrors.telefone = "Telefone inválido";
        }


        if (!form.endereco) {
            newErrors.endereco = "Obrigatório";
        }


        if (!form.cnpj) {

            newErrors.cnpj = "Obrigatório";

        } else if (!validarCNPJ(form.cnpj)) {

            newErrors.cnpj = "CNPJ inválido";
        }


        if (!form.dataNascimento) {
            newErrors.dataNascimento = "Obrigatório";
        }


        if (!form.dataAdmissao) {
            newErrors.dataAdmissao = "Obrigatório";
        }


        /* =====================================================
           IDADE
           ===================================================== */

        if (form.dataNascimento) {

            const hoje = new Date();
            const nascimento = new Date(form.dataNascimento);

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
                newErrors.dataNascimento = "Mínimo 16 anos";
            }
        }


        /* =====================================================
           DATA DE ADMISSÃO
           ===================================================== */

        if (form.dataAdmissao) {

            const hoje = new Date();
            const admissao = new Date(form.dataAdmissao);

            if (admissao > hoje) {
                newErrors.dataAdmissao =
                    "Não pode ser futura";
            }
        }


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    /* =========================================================
       FORMATAÇÕES
       ========================================================= */

    const formatarCNPJ = (value) => {

        value = value.replace(/\D/g, "");

        value = value.replace(
            /^(\d{2})(\d)/,
            "$1.$2"
        );

        value = value.replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        );

        value = value.replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        );

        value = value.replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );

        return value.slice(0, 18);
    };


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


const barbeirosFiltrados = barbeiros.filter((b) => {
    const correspondeBusca =
        `${b.nome} ${b.sobrenome}`
            .toLowerCase()
            .includes(busca.toLowerCase());

    if (!correspondeBusca) {
        return false;
    }

    if (filtro === "ativos") {
        return b.ativo === true;
    }

    if (filtro === "inativos") {
        return b.ativo === false;
    }

    return true;
});


    /* =========================================================
       CARREGAR BARBEIROS
       ========================================================= */

    const carregarBarbeiros = async () => {

        try {

            const res = await listarBarbeiros();

            setBarbeiros(res.data);

        } catch (err) {

            console.error(
                "Erro ao carregar barbeiros:",
                err
            );
        }
    };


    useEffect(() => {
        carregarBarbeiros();
    }, []);


    /* =========================================================
       EXCLUIR
       ========================================================= */

    const handleDelete = async (id) => {

        try {

            await deletarBarbeiros(id);

            await carregarBarbeiros();

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

        await handleDelete(confirmarExclusao);

        setConfirmarExclusao(null);
    };


    /* =========================================================
       ABRIR CADASTRO
       ========================================================= */

    const abrirCadastro = () => {

        setModo("criar");

        setErrors({});

        setForm({
            nome: "",
            sobrenome: "",
            dataNascimento: "",
            dataAdmissao: "",
            email: "",
            senha: "",
            cnpj: "",
            endereco: "",
            ativo: true,
            telefone: "",
            foto: ""
        });

        setEditando("novo");
    };


    /* =========================================================
       ABRIR EDIÇÃO
       ========================================================= */

    const abrirEdicao = (b) => {

        setModo("editar");

        setErrors({});

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

            /*
             * NÃO colocamos b.senha aqui.
             * A senha armazenada é um hash bcrypt.
             */
            senha: "",

            cnpj: b.cnpj || "",

            endereco: b.endereco || "",

            ativo: b.ativo ?? true,

            telefone: b.telefone || "",

            foto: ""
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
       ALTERAÇÃO DOS CAMPOS
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


        if (name === "cnpj") {
            newValue = formatarCNPJ(value);
        }


        if (name === "telefone") {
            newValue = formatarTelefone(value);
        }


        if (type === "file") {

            newValue = files?.[0] || "";
        }


        setForm((prev) => ({
            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : newValue
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

                /*
                 * Na edição, se a senha estiver vazia,
                 * não mandamos senha.
                 */
                const dados = {
                    ...form
                };

                if (!dados.senha) {
                    delete dados.senha;
                }

                await atualizarBarbeiros(
                    editando,
                    dados
                );

            } else {

                await criarBarbeiros(form);
            }


            await carregarBarbeiros();

            setEditando(null);

            setErrors({});

        } catch (err) {

            console.error(
                "Erro ao salvar:",
                err
            );

            alert("Erro ao salvar");
        }
    };


    /* =========================================================
       RENDER
       ========================================================= */

    return (

        <div className="barbeiros-page">

            <div className="barbeiros-container">

                {/* CABEÇALHO */}

                <div className="barbeiros-header">

                    <div className="barbeiros-title-area">

         <span className="eyebrow">
                EQUIPE BRUTUS
              </span>

              <h1>
                BARBEIROS 
              </h1>

                    </div>

                </div>


                {/* CARDS DE RESUMO */}

          <BarbeiroCards
    filtro={filtro}
    setFiltro={setFiltro}
/>


                {/* CONTROLES */}

                <div className="barbeiros-controls">

                    <input
                        type="text"
                        placeholder="Buscar barbeiro..."
                        className="barbeiros-search"
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                    />

                    <button
                        className="barbeiros-btn-add"
                        onClick={abrirCadastro}
                    >
                        + Novo Barbeiro
                    </button>

                </div>


                {/* LISTA */}

                <div className="barbeiros-lista">

                    {barbeirosFiltrados.length === 0 ? (

                        <p className="barbeiros-empty">
                            Nenhum barbeiro encontrado
                        </p>

                    ) : (

                        barbeirosFiltrados.map((b) => (

                      <div
                          key={b._id}
                          className="barbeiro-card"
                          onClick={() => navigate(`/barbeiros/${b._id}`)}
                      >

                                {/* FOTO */}
<img
    src={getUrlFotoBarbeiro(b.foto)}
    alt={`${b.nome} ${b.sobrenome}`}
    className="barbeiro-foto"
    onError={(e) => {
        console.log("❌ ERRO NA FOTO:", e.currentTarget.src);
    }}
/>

                                {/* INFORMAÇÕES */}

                                <div className="barbeiro-info">

                                    <h3>
                                        {b.nome} {b.sobrenome}
                                    </h3>

                                    <span className="barbeiro-email">
                                        {b.email}
                                    </span>

                                    <span>
                                        {b.cnpj}
                                    </span>

                                    <span>
                                        {b.telefone}
                                    </span>

                                    <span
                                        className={`barbeiro-status ${
                                            b.ativo
                                                ? "ativo"
                                                : "inativo"
                                        }`}
                                    >
                                        {b.ativo
                                            ? "● Ativo"
                                            : "● Inativo"}
                                    </span>

                                </div>


                                {/* AÇÕES */}

                                <div className="barbeiro-actions">

                                    <button
                                        className="barbeiro-btn-editar"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirEdicao(b);
                                        }}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="barbeiro-btn-excluir"
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      abrirConfirmacao(b._id);
                                  }}
                                    >
                                        Excluir
                                    </button>

                                </div>

                            </div>

                        ))
                    )}

                </div>


                {/* =================================================
                    MODAL CADASTRO / EDIÇÃO
                   ================================================= */}

                {editando !== null && (

                    <div
                        className="barbeiros-modal"
                        onClick={fecharModal}
                    >

                        <div
                            className="barbeiros-modal-content"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                {modo === "editar"
                                    ? "Editar Barbeiro"
                                    : "Novo Barbeiro"}
                            </h2>


                            {/* NOME */}

                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                placeholder="Nome"
                            />

                            {errors.nome && (
                                <span className="barbeiros-error">
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
                                <span className="barbeiros-error">
                                    {errors.sobrenome}
                                </span>
                            )}


                            {/* DATA NASCIMENTO */}

                            <label className="barbeiros-modal-label">
                                Data de nascimento
                            </label>

                            <input
                                type="date"
                                name="dataNascimento"
                                value={form.dataNascimento}
                                onChange={handleChange}
                            />

                            {errors.dataNascimento && (
                                <span className="barbeiros-error">
                                    {errors.dataNascimento}
                                </span>
                            )}


                            {/* DATA ADMISSÃO */}

                            <label className="barbeiros-modal-label">
                                Data de admissão
                            </label>

                            <input
                                type="date"
                                name="dataAdmissao"
                                value={form.dataAdmissao}
                                onChange={handleChange}
                            />

                            {errors.dataAdmissao && (
                                <span className="barbeiros-error">
                                    {errors.dataAdmissao}
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
                                <span className="barbeiros-error">
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

                            {errors.senha && (
                                <span className="barbeiros-error">
                                    {errors.senha}
                                </span>
                            )}


                            {/* CNPJ */}

                            <input
                                name="cnpj"
                                value={form.cnpj || ""}
                                onChange={handleChange}
                                placeholder="CNPJ"
                            />

                            {errors.cnpj && (
                                <span className="barbeiros-error">
                                    {errors.cnpj}
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
                                <span className="barbeiros-error">
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
                                <span className="barbeiros-error">
                                    {errors.telefone}
                                </span>
                            )}


                            {/* FOTO */}

                            <label className="barbeiros-modal-label">
                                Foto
                            </label>

                            <input
                                type="file"
                                name="foto"
                                onChange={handleChange}
                            />


                            {/* ATIVO */}

                            <label className="barbeiros-checkbox">

                                <input
                                    type="checkbox"
                                    name="ativo"
                                    checked={form.ativo}
                                    onChange={handleChange}
                                />

                                Ativo

                            </label>


                            {/* BOTÕES */}

                            <div className="barbeiros-modal-buttons">

                                <button
                                    className="barbeiros-btn-primary"
                                    onClick={handleSalvar}
                                >
                                    Salvar
                                </button>

                                <button
                                    className="barbeiros-btn-secondary"
                                    onClick={fecharModal}
                                >
                                    Cancelar
                                </button>

                            </div>

                        </div>

                    </div>
                )}


                {/* =================================================
                    MODAL EXCLUSÃO
                   ================================================= */}

                {confirmarExclusao && (

                    <div
                        className="barbeiros-modal"
                        onClick={cancelarExclusao}
                    >

                        <div
                            className="barbeiros-modal-content"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <h2>
                                Excluir Barbeiro?
                            </h2>

                            <p>
                                Tem certeza que deseja remover
                                este barbeiro?
                            </p>


                            <div className="barbeiros-modal-buttons">

                                <button
                                    className="barbeiros-btn-danger"
                                    onClick={confirmarEDeletar}
                                >
                                    Sim, Excluir
                                </button>

                                <button
                                    className="barbeiros-btn-secondary"
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