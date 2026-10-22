import React, { useEffect, useMemo, useState } from "react";
import "./index.css";

import {
    listarAgendamentosPorBarbeiro
} from "../../service/serviceAgenda";

import {
    listarBarbeiros
} from "../../service/serviceBarbeiro";

import {
    listarAgendamentosPorCliente
} from "../../service/serviceCliente";


export default function CalendarioAgendamentos() {

    /*
     * =====================================================
     * IDENTIFICA O USUÁRIO LOGADO
     * =====================================================
     */

    const tipoSalvo = (
        sessionStorage.getItem("tipo") || ""
    )
        .trim()
        .toUpperCase();

    /*
     * Caso seu sistema salve GESTOR em vez de ADMIN,
     * também será reconhecido como ADMIN.
     */
    const tipoUsuario =
        tipoSalvo === "GESTOR"
            ? "ADMIN"
            : tipoSalvo;

    /*
     * ID da entidade logada.
     *
     * BARBEIRO -> ID do barbeiro
     * CLIENTE  -> ID do cliente
     */
    const entidadeId =
        sessionStorage.getItem("entidadeId");

    const isAdmin =
        tipoUsuario === "ADMIN";

    const isBarbeiro =
        tipoUsuario === "BARBEIRO";

    const isCliente =
        tipoUsuario === "CLIENTE";


    /*
     * =====================================================
     * ESTADOS
     * =====================================================
     */

    const [barbeiros, setBarbeiros] = useState([]);

    const [barbeiroSelecionado, setBarbeiroSelecionado] =
        useState("");

    const [agendamentos, setAgendamentos] =
        useState([]);

    const [dataAtual, setDataAtual] =
        useState(new Date());

    const [carregando, setCarregando] =
        useState(false);

    const [erro, setErro] =
        useState("");

    const [agendamentoSelecionado, setAgendamentoSelecionado] =
        useState(null);


    /*
     * =====================================================
     * ADMIN
     * BUSCA OS BARBEIROS AUTOMATICAMENTE
     * =====================================================
     */

    useEffect(() => {

        async function carregarBarbeiros() {

            if (!isAdmin) {
                return;
            }

            try {

                setCarregando(true);
                setErro("");

                const resposta =
                    await listarBarbeiros();

                /*
                 * listarBarbeiros() retorna axios response.
                 *
                 * Então os dados normalmente estarão
                 * em resposta.data
                 */
                const dados =
                    Array.isArray(resposta)
                        ? resposta
                        : Array.isArray(resposta?.data)
                            ? resposta.data
                            : [];

                setBarbeiros(dados);

            } catch (error) {

                console.error(
                    "Erro ao carregar barbeiros:",
                    error
                );

                setErro(
                    error?.response?.data?.erro ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Não foi possível carregar os barbeiros."
                );

                setBarbeiros([]);

            } finally {

                setCarregando(false);

            }

        }

        carregarBarbeiros();

    }, [isAdmin]);


    /*
     * =====================================================
     * DEFINE AUTOMATICAMENTE O BARBEIRO LOGADO
     * =====================================================
     */

    useEffect(() => {

        if (isBarbeiro) {

            if (entidadeId) {

                setBarbeiroSelecionado(
                    entidadeId
                );

            } else {

                setBarbeiroSelecionado("");

            }

        }

    }, [isBarbeiro, entidadeId]);


    /*
     * =====================================================
     * PALETA DE CORES — UMA POR BARBEIRO
     * =====================================================
     */

    const CORES_BARBEIROS = [
        "barbeiro-cor-0",
        "barbeiro-cor-1",
        "barbeiro-cor-2",
        "barbeiro-cor-3",
        "barbeiro-cor-4",
        "barbeiro-cor-5",
        "barbeiro-cor-6",
        "barbeiro-cor-7",
    ];

    // Mapeia ID do barbeiro → índice de cor (estável durante a sessão)
    const corPorBarbeiro = useMemo(() => {
        const mapa = {};
        barbeiros.forEach((b, i) => {
            mapa[b._id] = CORES_BARBEIROS[i % CORES_BARBEIROS.length];
        });
        return mapa;
    }, [barbeiros]);

    function obterCorBarbeiro(agendamento) {
        const id =
            agendamento?.Barbeiro?._id ||
            (typeof agendamento?.Barbeiro === "string"
                ? agendamento.Barbeiro
                : null);
        return id ? (corPorBarbeiro[id] || "") : "";
    }


    /*
     * =====================================================
     * CARREGA AGENDAMENTOS
     *
     * ADMIN sem barbeiro → todos os barbeiros
     * ADMIN com barbeiro → barbeiro selecionado
     * BARBEIRO           → próprio barbeiro
     * CLIENTE            → próprios agendamentos
     * =====================================================
     */

    useEffect(() => {

        async function carregarAgendamentos() {

            try {

                setCarregando(true);
                setErro("");

                /*
                 * =========================================
                 * CLIENTE
                 * =========================================
                 */

                if (isCliente) {

                    if (!entidadeId) {

                        setAgendamentos([]);

                        setErro(
                            "Não foi possível identificar o cliente conectado."
                        );

                        return;

                    }

                    const resposta =
                        await listarAgendamentosPorCliente();

                    const dados =
                        Array.isArray(resposta)
                            ? resposta
                            : Array.isArray(resposta?.data)
                                ? resposta.data
                                : [];

                    setAgendamentos(dados);

                    return;
                }


                /*
                 * =========================================
                 * ADMIN / BARBEIRO
                 * =========================================
                 */

                /*
                 * ADMIN sem barbeiro selecionado
                 * → busca agendamentos de TODOS os barbeiros em paralelo
                 */
                if (isAdmin && !barbeiroSelecionado) {

                    if (barbeiros.length === 0) {
                        setAgendamentos([]);
                        return;
                    }

                    const resultados = await Promise.all(
                        barbeiros.map((b) =>
                            listarAgendamentosPorBarbeiro(b._id).catch(() => [])
                        )
                    );

                    const todos = resultados.flat();

                    setAgendamentos(todos);

                    return;
                }

                if (isBarbeiro && !barbeiroSelecionado) {

                    setAgendamentos([]);

                    return;

                }


                const resposta =
                    await listarAgendamentosPorBarbeiro(
                        barbeiroSelecionado
                    );

                const dados =
                    Array.isArray(resposta)
                        ? resposta
                        : Array.isArray(resposta?.data)
                            ? resposta.data
                            : [];

                setAgendamentos(dados);

            } catch (error) {

                console.error(
                    "Erro ao carregar agendamentos:",
                    error
                );

                setErro(
                    error?.response?.data?.erro ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Não foi possível carregar os agendamentos."
                );

                setAgendamentos([]);

            } finally {

                setCarregando(false);

            }

        }

        carregarAgendamentos();

    }, [
        isAdmin,
        isBarbeiro,
        isCliente,
        entidadeId,
        barbeiroSelecionado,
        barbeiros
    ]);


    /*
     * =====================================================
     * SEMANA
     * =====================================================
     */

    const inicioSemana = useMemo(() => {

        const data = new Date(dataAtual);

        const dia = data.getDay();

        const diferenca =
            dia === 0
                ? -6
                : 1 - dia;

        data.setDate(
            data.getDate() + diferenca
        );

        data.setHours(0, 0, 0, 0);

        return data;

    }, [dataAtual]);


    /*
     * =====================================================
     * 7 DIAS
     * =====================================================
     */

    const diasSemana = useMemo(() => {

        return Array.from(
            { length: 7 },
            (_, index) => {

                const data =
                    new Date(inicioSemana);

                data.setDate(
                    inicioSemana.getDate() + index
                );

                return data;

            }
        );

    }, [inicioSemana]);


    /*
     * =====================================================
     * HORÁRIOS
     * =====================================================
     */

    const horarios = useMemo(() => {

        const resultado = [];

        for (
            let hora = 8;
            hora <= 21;
            hora++
        ) {

            resultado.push(
                `${String(hora).padStart(2, "0")}:00`
            );

            resultado.push(
                `${String(hora).padStart(2, "0")}:30`
            );

        }

        return resultado;

    }, []);


    const nomesDias = [
        "SEG",
        "TER",
        "QUA",
        "QUI",
        "SEX",
        "SÁB",
        "DOM"
    ];


    /*
     * =====================================================
     * FUNÇÕES DE DATA
     * =====================================================
     */

    function formatarDataComparacao(data) {

        const ano =
            data.getFullYear();

        const mes =
            String(
                data.getMonth() + 1
            ).padStart(2, "0");

        const dia =
            String(
                data.getDate()
            ).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    }


    function normalizarData(data) {

        if (!data) {
            return null;
        }

        if (data instanceof Date) {
            return formatarDataComparacao(data);
        }

        const valor =
            String(data);

        if (
            /^\d{4}-\d{2}-\d{2}/.test(valor)
        ) {

            return valor.substring(
                0,
                10
            );

        }

        if (
            /^\d{2}\/\d{2}\/\d{4}$/.test(valor)
        ) {

            const [
                dia,
                mes,
                ano
            ] = valor.split("/");

            return `${ano}-${mes}-${dia}`;
        }

        return null;
    }


    /*
     * =====================================================
     * FUNÇÕES DO AGENDAMENTO
     * =====================================================
     */

    function obterDataAgendamento(agendamento) {

        return (
            agendamento?.data ||
            agendamento?.Data ||
            null
        );

    }


    function obterHorarioAgendamento(agendamento) {

        return (
            agendamento?.horario ||
            agendamento?.hora ||
            agendamento?.Horario ||
            agendamento?.Hora ||
            ""
        );

    }


    function normalizarHorario(horario) {

        if (!horario) {
            return "";
        }

        const partes =
            String(horario).split(":");

        if (partes.length < 2) {
            return String(horario);
        }

        return (
            `${partes[0].padStart(2, "0")}:` +
            `${partes[1].padStart(2, "0")}`
        );

    }


    function obterAgendamentosDoDia(data) {

        const dataComparacao =
            formatarDataComparacao(data);

        return agendamentos.filter(
            (agendamento) => {

                const dataAgendamento =
                    normalizarData(
                        obterDataAgendamento(
                            agendamento
                        )
                    );

                return (
                    dataAgendamento ===
                    dataComparacao
                );

            }
        );

    }


    function obterAgendamentoHorario(
        data,
        horario
    ) {

        const agendamentosDoDia =
            obterAgendamentosDoDia(data);

        // Converte horário string "HH:MM" em minutos totais
        function toMinutes(h) {
            const [hh, mm] = String(h).split(":").map(Number);
            return hh * 60 + (mm || 0);
        }

        const slotMin = toMinutes(horario);

        return agendamentosDoDia.find((agendamento) => {
            const horaInicio = obterHorarioAgendamento(agendamento);
            const inicioMin = toMinutes(horaInicio);

            // Calcula duração total dos serviços do agendamento
            const servicos =
                agendamento?.Servicos ||
                agendamento?.servicos ||
                [];

            const duracaoMin = Array.isArray(servicos)
                ? servicos.reduce((acc, item) => {
                      const duracao =
                          Number(
                              item?.Servico?.duracao ??
                              item?.duracao ??
                              item?.Duracao ??
                              0
                          );
                      return acc + duracao;
                  }, 0)
                : 0;

            // Ocupa slots do início até início+duração (exclusive)
            // Se duração = 0 ou desconhecida, ocupa apenas o slot exato
            const fimMin = duracaoMin > 0
                ? inicioMin + duracaoMin
                : inicioMin + 30;

            return slotMin >= inicioMin && slotMin < fimMin;
        });

    }

    // Retorna true se o slot é exatamente o horário de início do agendamento
    function ehSlotInicio(agendamento, horario) {
        if (!agendamento) return false;
        const horaInicio = obterHorarioAgendamento(agendamento);
        return normalizarHorario(horaInicio) === normalizarHorario(horario);
    }


    /*
     * =====================================================
     * CLIENTE
     * =====================================================
     */

    function obterNomeCliente(agendamento) {

        const cliente =
            agendamento?.cliente ||
            agendamento?.Cliente;

        if (
            typeof cliente === "string"
        ) {

            return cliente;

        }

        if (cliente) {

            const nomeCompleto =
                `${cliente.nome || cliente.Nome || ""} ${
                    cliente.sobrenome ||
                    cliente.Sobrenome ||
                    ""
                }`.trim();

            return (
                nomeCompleto ||
                "Cliente"
            );

        }

        return (
            agendamento?.nomeCliente ||
            agendamento?.clienteNome ||
            "Cliente"
        );

    }


    /*
     * =====================================================
     * SERVIÇO
     * =====================================================
     */

    function obterNomeServico(agendamento) {

        const servico =
            agendamento?.servico ||
            agendamento?.Servico ||
            agendamento?.Servicos;

        if (Array.isArray(servico)) {

            return servico
                .map(
                    (item) =>
                        item?.nome ||
                        item?.Nome ||
                        item?.Servico?.nome ||
                        ""
                )
                .filter(Boolean)
                .join(" + ");

        }

        if (
            typeof servico === "string"
        ) {

            return servico;

        }

        if (servico) {

            return (
                servico.nome ||
                servico.Nome ||
                "Serviço"
            );

        }

        return (
            agendamento?.nomeServico ||
            "Serviço"
        );

    }


    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    function obterStatus(agendamento) {

        return (
            agendamento?.status ||
            agendamento?.Status ||
            "AGENDADO"
        );

    }


    /*
     * =====================================================
     * DATA PARA EXIBIÇÃO
     * =====================================================
     */

    function formatarData(data) {

        return data.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit"
            }
        );

    }


    /*
     * =====================================================
     * NAVEGAÇÃO
     * =====================================================
     */

    function alterarSemana(direcao) {

        const novaData =
            new Date(dataAtual);

        novaData.setDate(
            novaData.getDate() +
            direcao * 7
        );

        setDataAtual(novaData);

    }


    function irParaHoje() {

        setDataAtual(
            new Date()
        );

    }


    /*
     * =====================================================
     * ADMIN ESCOLHE BARBEIRO
     * =====================================================
     */

    function handleSelecionarBarbeiro(event) {

        setBarbeiroSelecionado(
            event.target.value
        );

        setAgendamentoSelecionado(
            null
        );

    }


    /*
     * =====================================================
     * PERÍODO
     * =====================================================
     */

    const periodoSemana =
        `${inicioSemana.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short"
            }
        )} - ${diasSemana[6].toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        )}`;


    /*
     * =====================================================
     * TÍTULO
     * =====================================================
     */

    let titulo = "Agenda";

    if (isAdmin && !barbeiroSelecionado) {
        titulo = "Todos os barbeiros";
    } else if (isAdmin) {
        titulo = "Agenda dos barbeiros";
    } else if (isBarbeiro) {
        titulo = "Minha agenda";
    } else if (isCliente) {
        titulo = "Meus agendamentos";
    }


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

    return (

        <div className="calendario-container">

            {/* CABEÇALHO */}

            <div className="calendario-cabecalho">

                <div className="calendario-titulo-area">

                    <span className="calendario-subtitulo">
                        AGENDA
                    </span>

                    <h1>
                        {titulo}
                    </h1>

                </div>


                {/* ADMIN */}

                {isAdmin && (

                    <div className="seletor-barbeiro">

                        <label htmlFor="barbeiro">
                            BARBEIRO
                        </label>

                        <select
                            id="barbeiro"
                            value={barbeiroSelecionado}
                            onChange={
                                handleSelecionarBarbeiro
                            }
                        >

                            <option value="">
                                Selecione um barbeiro
                            </option>

                            {barbeiros.map(
                                (barbeiro) => (

                                    <option
                                        key={
                                            barbeiro._id
                                        }
                                        value={
                                            barbeiro._id
                                        }
                                    >

                                        {barbeiro.nome}{" "}
                                        {barbeiro.sobrenome || ""}

                                    </option>

                                )
                            )}

                        </select>

                    </div>

                )}

            </div>


            {/* CONTROLES */}

            <div className="calendario-controles">

                <div className="periodo-calendario">

                    <button
                        type="button"
                        onClick={() =>
                            alterarSemana(-1)
                        }
                    >
                        ‹
                    </button>

                    <strong>
                        {periodoSemana}
                    </strong>

                    <button
                        type="button"
                        onClick={() =>
                            alterarSemana(1)
                        }
                    >
                        ›
                    </button>

                </div>


                <button
                    type="button"
                    className="botao-hoje"
                    onClick={irParaHoje}
                >
                    HOJE
                </button>

            </div>


            {/* ERRO */}

            {erro && (

                <div className="calendario-erro">
                    {erro}
                </div>

            )}


            {/* CLIENTE NÃO IDENTIFICADO */}

            {isCliente &&
                !entidadeId && (

                    <div className="calendario-vazio">

                        <span>✂</span>

                        <h2>
                            Agendamentos indisponíveis
                        </h2>

                        <p>
                            Não foi possível identificar
                            o cliente conectado.
                        </p>

                    </div>

                )}


            {/* ADMIN SEM BARBEIRO — mostra todos (sem estado vazio) */}


            {/* BARBEIRO SEM ID */}

            {isBarbeiro &&
                !barbeiroSelecionado && (

                    <div className="calendario-vazio">

                        <span>✂</span>

                        <h2>
                            Agenda indisponível
                        </h2>

                        <p>
                            Não foi possível identificar
                            o barbeiro conectado.
                        </p>

                    </div>

                )}


            {/* CALENDÁRIO */}

            {(
                isCliente ||
                isBarbeiro && barbeiroSelecionado ||
                isAdmin
            ) && (

                <div className="calendario-wrapper">

                    {carregando && (

                        <div className="calendario-loading">
                            Carregando agenda...
                        </div>

                    )}

                    <div className="calendario">

                        {/* HORÁRIO */}

                        <div className="coluna-horarios-cabecalho">
                            HORÁRIO
                        </div>


                        {/* DIAS */}

                        {diasSemana.map(
                            (dia, index) => {

                                const hoje =
                                    formatarDataComparacao(
                                        dia
                                    ) ===
                                    formatarDataComparacao(
                                        new Date()
                                    );

                                return (

                                    <div
                                        key={
                                            dia.toISOString()
                                        }
                                        className={
                                            `dia-cabecalho ${
                                                hoje
                                                    ? "dia-hoje"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <span>
                                            {
                                                nomesDias[
                                                    index
                                                ]
                                            }
                                        </span>

                                        <strong>
                                            {formatarData(
                                                dia
                                            )}
                                        </strong>

                                    </div>

                                );

                            }
                        )}


                        {/* HORÁRIOS */}

                        {horarios.map(
                            (horario) => (

                                <React.Fragment
                                    key={horario}
                                >

                                    <div className="horario">
                                        {horario}
                                    </div>


                                    {diasSemana.map(
                                        (dia) => {

                                            const agendamento =
                                                obterAgendamentoHorario(
                                                    dia,
                                                    horario
                                                );

                                            const isInicio =
                                                ehSlotInicio(agendamento, horario);

                                            const corBarbeiro =
                                                obterCorBarbeiro(agendamento);

                                            return (

                                                <div
                                                    key={
                                                        `${dia.toISOString()}-${horario}`
                                                    }
                                                    className="celula-agenda"
                                                >

                                                    {agendamento && isInicio && (

                                                        <button
                                                            type="button"
                                                            className={
                                                                `card-agendamento status-${String(
                                                                    obterStatus(
                                                                        agendamento
                                                                    )
                                                                )
                                                                    .toLowerCase()
                                                                    .replace(
                                                                        /\s+/g,
                                                                        "-"
                                                                    )} ${corBarbeiro}`
                                                            }
                                                            onClick={() =>
                                                                setAgendamentoSelecionado(
                                                                    agendamento
                                                                )
                                                            }
                                                        >

                                                            <span className="card-horario">
                                                                {
                                                                    normalizarHorario(
                                                                        obterHorarioAgendamento(
                                                                            agendamento
                                                                        )
                                                                    )
                                                                }
                                                            </span>

                                                            <strong>
                                                                {
                                                                    obterNomeServico(
                                                                        agendamento
                                                                    )
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    obterNomeCliente(
                                                                        agendamento
                                                                    )
                                                                }
                                                            </span>

                                                            <small>
                                                                {
                                                                    obterStatus(
                                                                        agendamento
                                                                    )
                                                                }
                                                            </small>

                                                        </button>

                                                    )}

                                                    {agendamento && !isInicio && (
                                                        <div
                                                            className={
                                                                `celula-continuacao status-${String(
                                                                    obterStatus(agendamento)
                                                                )
                                                                    .toLowerCase()
                                                                    .replace(/\s+/g, "-")} ${corBarbeiro}`
                                                            }
                                                            title={`Continuação: ${obterNomeServico(agendamento)}`}
                                                        />
                                                    )}

                                                </div>

                                            );

                                        }
                                    )}

                                </React.Fragment>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* MODAL */}

            {agendamentoSelecionado && (

                <ModalAgendamento
                    agendamento={
                        agendamentoSelecionado
                    }
                    onClose={() =>
                        setAgendamentoSelecionado(
                            null
                        )
                    }
                />

            )}

        </div>

    );

}


/*
 * =========================================================
 * MODAL
 * =========================================================
 */

function ModalAgendamento({
    agendamento,
    onClose
}) {

    function formatarValor(valor) {

        if (
            valor === undefined ||
            valor === null ||
            valor === ""
        ) {
            return null;
        }

        const numero =
            Number(valor);

        if (Number.isNaN(numero)) {
            return String(valor);
        }

        return numero.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    function formatarCampoData(data) {

        if (!data) {
            return null;
        }

        const valor =
            String(data);

        if (
            /^\d{4}-\d{2}-\d{2}/.test(valor)
        ) {

            const [
                ano,
                mes,
                dia
            ] =
                valor
                    .substring(0, 10)
                    .split("-");

            return `${dia}/${mes}/${ano}`;

        }

        return valor;

    }


    function nomePessoa(pessoa) {

        if (!pessoa) {
            return null;
        }

        if (
            typeof pessoa === "string"
        ) {
            return pessoa;
        }

        const nomeCompleto =
            `${pessoa.nome || pessoa.Nome || ""} ${
                pessoa.sobrenome ||
                pessoa.Sobrenome ||
                ""
            }`.trim();

        return (
            nomeCompleto ||
            null
        );

    }


    const cliente =
        agendamento?.cliente ||
        agendamento?.Cliente;

    const barbeiro =
        agendamento?.barbeiro ||
        agendamento?.Barbeiro;

    const servico =
        agendamento?.servico ||
        agendamento?.Servico ||
        agendamento?.Servicos;

    const valor =
        agendamento?.valorTotal ??
        agendamento?.valor ??
        agendamento?.preco;


    let nomeServico = "Não informado";

    if (Array.isArray(servico)) {

        nomeServico =
            servico
                .map(
                    (item) =>
                        item?.nome ||
                        item?.Nome ||
                        item?.Servico?.nome ||
                        ""
                )
                .filter(Boolean)
                .join(" + ") ||
            "Não informado";

    } else if (typeof servico === "string") {

        nomeServico = servico;

    } else if (servico) {

        nomeServico =
            servico.nome ||
            servico.Nome ||
            "Não informado";

    }


    return (

        <div
            className="modal-agendamento-overlay"
            onClick={onClose}
        >

            <div
                className="modal-agendamento"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                <div className="modal-agendamento-header">

                    <div>

                        <span>
                            DETALHES
                        </span>

                        <h2>
                            Agendamento
                        </h2>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        ×
                    </button>

                </div>


                <div className="modal-agendamento-conteudo">

                    <div className="informacao-agendamento">

                        <span>
                            CLIENTE
                        </span>

                        <strong>
                            {
                                nomePessoa(cliente) ||
                                agendamento?.nomeCliente ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div className="informacao-agendamento">

                        <span>
                            BARBEIRO
                        </span>

                        <strong>
                            {
                                nomePessoa(barbeiro) ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div className="informacao-agendamento">

                        <span>
                            SERVIÇO
                        </span>

                        <strong>
                            {nomeServico}
                        </strong>

                    </div>


                    <div className="informacao-agendamento">

                        <span>
                            DATA
                        </span>

                        <strong>
                            {
                                formatarCampoData(
                                    agendamento?.data
                                ) ||
                                "Não informada"
                            }
                        </strong>

                    </div>


                    <div className="informacao-agendamento">

                        <span>
                            HORÁRIO
                        </span>

                        <strong>
                            {
                                agendamento?.horario ||
                                agendamento?.hora ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    <div className="informacao-agendamento">

                        <span>
                            STATUS
                        </span>

                        <strong>
                            {
                                agendamento?.status ||
                                agendamento?.Status ||
                                "Não informado"
                            }
                        </strong>

                    </div>


                    {agendamento?.observacao && (

                        <div className="informacao-agendamento informacao-larga">

                            <span>
                                OBSERVAÇÃO
                            </span>

                            <p>
                                {
                                    agendamento.observacao
                                }
                            </p>

                        </div>

                    )}


                    {valor !== undefined &&
                        valor !== null && (

                            <div className="informacao-agendamento valor-agendamento">

                                <span>
                                    VALOR
                                </span>

                                <strong>
                                    {
                                        formatarValor(
                                            valor
                                        )
                                    }
                                </strong>

                            </div>

                        )}

                </div>

            </div>

        </div>

    );

}
