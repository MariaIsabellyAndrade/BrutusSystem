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
import { formatarCNPJ, formatarTelefone, somenteNumeros } from "../../utils/masks";

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
        const cleanCNPJ = somenteNumeros(cnpj);
        if (cleanCNPJ.length !== 14) return false;
        if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

        let tamanho = cleanCNPJ.length - 2;
        let numeros = cleanCNPJ.substring(0, tamanho);
        let digitos = cleanCNPJ.substring(tamanho);

        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado != digitos.charAt(0)) return false;

        tamanho++;
        numeros = cleanCNPJ.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        return resultado == digitos.charAt(1);
    };

    const validate = () => {
        let newErrors = {};

        if (!form.nome) newErrors.nome = "Obrigatório";
        if (!form.sobrenome) newErrors.sobrenome = "Obrigatório";
        if (modo === "criar" && !form.senha) newErrors.senha = "Obrigatório";

        if (!form.email) {
            newErrors.email = "Obrigatório";
        } else if (!validarEmail(form.email)) {
            newErrors.email = "Email inválido";
        }

        if (!form.telefone) {
            newErrors.telefone = "Obrigatório";
        } else if (somenteNumeros(form.telefone).length < 10) {
            newErrors.telefone = "Telefone inválido";
        }

        if (!form.endereco) newErrors.endereco = "Obrigatório";

        if (!form.cnpj) {
            newErrors.cnpj = "Obrigatório";
        } else if (!validarCNPJ(form.cnpj)) {
            newErrors.cnpj = "CNPJ inválido";
        }

        if (!form.dataNascimento) newErrors.dataNascimento = "Obrigatório";
        if (!form.dataAdmissao) newErrors.dataAdmissao = "Obrigatório";

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

    const barbeirosFiltrados = barbeiros.filter((b) => {
        const correspondeBusca = `${b.nome} ${b.sobrenome}`
            .toLowerCase()
            .includes(busca.toLowerCase());

        if (!correspondeBusca) return false;
        if (filtro === "ativos") return b.ativo === true;
        if (filtro === "inativos") return b.ativo === false;
        return true;
    });

    const carregarBarbeiros = async () => {
        try {
            const res = await listarBarbeiros();
            setBarbeiros(res.data || []);
        } catch (err) {
            console.error("Erro ao carregar barbeiros:", err);
        }
    };

    useEffect(() => {
        carregarBarbeiros();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deletarBarbeiros(id);
            await carregarBarbeiros();
        } catch (error) {
            console.error("Erro ao deletar:", error);
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

    const abrirEdicao = (b) => {
        setModo("editar");
        setErrors({});
        setEditando(b._id);
        setForm({
            nome: b.nome || "",
            sobrenome: b.sobrenome || "",
            dataNascimento: b.dataNascimento ? b.dataNascimento.split("T")[0] : "",
            dataAdmissao: b.dataAdmissao ? b.dataAdmissao.split("T")[0] : "",
            email: b.email || "",
            senha: "",
            cnpj: b.cnpj ? formatarCNPJ(b.cnpj) : "",
            endereco: b.endereco || "",
            ativo: b.ativo ?? true,
            telefone: b.telefone ? formatarTelefone(b.telefone) : "",
            foto: ""
        });
    };

    const fecharModal = () => {
        setEditando(null);
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
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
            [name]: type === "checkbox" ? checked : newValue
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleSalvar = async () => {
        if (!validate()) return;

        try {
            if (modo === "editar") {
                const dados = { ...form };
                if (!dados.senha) delete dados.senha;
                await atualizarBarbeiros(editando, dados);
            } else {
                await criarBarbeiros(form);
            }

            await carregarBarbeiros();
            setEditando(null);
            setErrors({});
        } catch (err) {
            console.error("Erro ao salvar:", err);
            alert(err?.response?.data?.message || "Erro ao salvar");
        }
    };

    return (
        <div className="barbeiros-page">
            <div className="barbeiros-container">
                {/* CABEÇALHO */}
                <div className="barbeiros-header">
                    <div className="barbeiros-title-area">
                        <span className="eyebrow">EQUIPE BRUTUS</span>
                        <h1>BARBEIROS</h1>
                    </div>
                </div>

                {/* CARDS DE RESUMO */}
                <BarbeiroCards filtro={filtro} setFiltro={setFiltro} />

                {/* CONTROLES */}
                <div className="barbeiros-controls">
                    <input
                        type="text"
                        placeholder="Buscar barbeiro..."
                        className="barbeiros-search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />

                    <button className="barbeiros-btn-add" onClick={abrirCadastro}>
                        + Novo Barbeiro
                    </button>
                </div>

                {/* LISTA */}
                <div className="barbeiros-lista">
                    {barbeirosFiltrados.length === 0 ? (
                        <p className="barbeiros-empty">Nenhum barbeiro encontrado</p>
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
                                    <h3>{b.nome} {b.sobrenome}</h3>
                                    <span className="barbeiro-email">{b.email}</span>
                                    <span>{b.cnpj ? formatarCNPJ(b.cnpj) : "-"}</span>
                                    <span>{b.telefone ? formatarTelefone(b.telefone) : "-"}</span>
                                    <span className={`barbeiro-status ${b.ativo ? "ativo" : "inativo"}`}>
                                        {b.ativo ? "● Ativo" : "● Inativo"}
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

                {/* MODAL CADASTRO / EDIÇÃO */}
                {editando !== null && (
                    <div className="barbeiros-modal" onClick={fecharModal}>
                        <div
                            className="barbeiros-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2>{modo === "editar" ? "Editar Barbeiro" : "Novo Barbeiro"}</h2>

                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                                placeholder="Nome"
                            />
                            {errors.nome && <span className="barbeiros-error">{errors.nome}</span>}

                            <input
                                name="sobrenome"
                                value={form.sobrenome}
                                onChange={handleChange}
                                placeholder="Sobrenome"
                            />
                            {errors.sobrenome && <span className="barbeiros-error">{errors.sobrenome}</span>}

                            <label className="barbeiros-modal-label">Data de nascimento</label>
                            <input
                                type="date"
                                name="dataNascimento"
                                value={form.dataNascimento}
                                onChange={handleChange}
                            />
                            {errors.dataNascimento && <span className="barbeiros-error">{errors.dataNascimento}</span>}

                            <label className="barbeiros-modal-label">Data de admissão</label>
                            <input
                                type="date"
                                name="dataAdmissao"
                                value={form.dataAdmissao}
                                onChange={handleChange}
                            />
                            {errors.dataAdmissao && <span className="barbeiros-error">{errors.dataAdmissao}</span>}

                            <input
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email"
                            />
                            {errors.email && <span className="barbeiros-error">{errors.email}</span>}

                            <input
                                type="password"
                                name="senha"
                                value={form.senha}
                                onChange={handleChange}
                                placeholder={modo === "editar" ? "Nova senha (opcional)" : "Senha"}
                            />
                            {errors.senha && <span className="barbeiros-error">{errors.senha}</span>}

                            <input
                                name="cnpj"
                                value={form.cnpj || ""}
                                onChange={handleChange}
                                placeholder="CNPJ (00.000.000/0000-00)"
                                maxLength={18}
                            />
                            {errors.cnpj && <span className="barbeiros-error">{errors.cnpj}</span>}

                            <input
                                name="endereco"
                                value={form.endereco}
                                onChange={handleChange}
                                placeholder="Endereço"
                            />
                            {errors.endereco && <span className="barbeiros-error">{errors.endereco}</span>}

                            <input
                                name="telefone"
                                value={form.telefone}
                                onChange={handleChange}
                                placeholder="Telefone ((00) 90000-0000)"
                                maxLength={15}
                            />
                            {errors.telefone && <span className="barbeiros-error">{errors.telefone}</span>}

                            <label className="barbeiros-modal-label">Foto</label>
                            <input
                                type="file"
                                name="foto"
                                accept="image/*"
                                onChange={handleChange}
                            />

                            <label className="barbeiros-checkbox">
                                <input
                                    type="checkbox"
                                    name="ativo"
                                    checked={form.ativo}
                                    onChange={handleChange}
                                />
                                Ativo
                            </label>

                            <div className="barbeiros-modal-buttons">
                                <button className="barbeiros-btn-primary" onClick={handleSalvar}>
                                    Salvar
                                </button>
                                <button className="barbeiros-btn-secondary" onClick={fecharModal}>
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL EXCLUSÃO */}
                {confirmarExclusao && (
                    <div className="barbeiros-modal" onClick={cancelarExclusao}>
                        <div
                            className="barbeiros-modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2>Excluir Barbeiro?</h2>
                            <p>Tem certeza que deseja remover este barbeiro?</p>

                            <div className="barbeiros-modal-buttons">
                                <button className="barbeiros-btn-danger" onClick={confirmarEDeletar}>
                                    Sim, Excluir
                                </button>
                                <button className="barbeiros-btn-secondary" onClick={cancelarExclusao}>
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