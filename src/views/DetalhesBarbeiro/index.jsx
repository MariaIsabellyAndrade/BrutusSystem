import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    listarBarbeiros,
    getUrlFotoBarbeiro,
} from "../../service/serviceBarbeiro";
import "./index.css";

export default function DetalhesBarbeiro() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [barbeiro, setBarbeiro] = useState(null);
    const [carregando, setCarregando] = useState(true);

    const [periodoAgenda, setPeriodoAgenda] = useState("semana");
    const [dataSelecionada, setDataSelecionada] = useState(
        new Date(2026, 8, 2)
    );

    const [periodoFaturamento, setPeriodoFaturamento] =
        useState("mes");

    const [agendamentoSelecionado, setAgendamentoSelecionado] =
        useState(null);

    useEffect(() => {
        const carregarBarbeiro = async () => {
            try {
                const response = await listarBarbeiros();

                const lista = response.data || [];

                const encontrado = lista.find(
                    (b) => b._id === id
                );

                setBarbeiro(encontrado);
            } catch (error) {
                console.error(
                    "Erro ao carregar barbeiro:",
                    error
                );
            } finally {
                setCarregando(false);
            }
        };

        carregarBarbeiro();
    }, [id]);

    /*
    ============================================================
    FUNÇÕES AUXILIARES
    ============================================================
    */

    const formatarMoeda = (valor) => {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const formatarData = (data) => {
        return data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const adicionarDias = (data, quantidade) => {
        const novaData = new Date(data);
        novaData.setDate(novaData.getDate() + quantidade);
        return novaData;
    };

    /*
    ============================================================
    DADOS TEMPORÁRIOS
    Depois substituímos pelos dados da API.
    ============================================================
    */

    const faturamento = {
        diario: 320,
        semanal: 1850,
        mensal: 7420,
        total: 48750,
    };

    const indicadores = {
        atendimentos: 248,
        clientes: 156,
        concluidos: 229,
        cancelados: 19,
        taxaConclusao: 92,
        taxaCancelamento: 8,
        mediaDiaria: 9,
        ticketMedio: 30,
        clientesNovos: 58,
        clientesRecorrentes: 98,
    };

    const servicos = [
        {
            nome: "Corte masculino",
            quantidade: 82,
        },
        {
            nome: "Barba",
            quantidade: 54,
        },
        {
            nome: "Corte + Barba",
            quantidade: 41,
        },
        {
            nome: "Degradê",
            quantidade: 27,
        },
    ];

    const clientesRecentes = [
        {
            nome: "João Silva",
            servico: "Corte + Barba",
            data: "02/09/2026",
            valor: 55,
        },
        {
            nome: "Maria Oliveira",
            servico: "Corte feminino",
            data: "02/09/2026",
            valor: 45,
        },
        {
            nome: "Lucas Almeida",
            servico: "Corte masculino",
            data: "01/09/2026",
            valor: 35,
        },
        {
            nome: "Pedro Henrique",
            servico: "Barba",
            data: "31/08/2026",
            valor: 25,
        },
    ];

    const horariosTrabalho = [
        {
            dia: "Segunda-feira",
            abre: "09:00",
            fecha: "18:00",
        },
        {
            dia: "Terça-feira",
            abre: "09:00",
            fecha: "18:00",
        },
        {
            dia: "Quarta-feira",
            abre: "09:00",
            fecha: "18:00",
        },
        {
            dia: "Quinta-feira",
            abre: "09:00",
            fecha: "18:00",
        },
        {
            dia: "Sexta-feira",
            abre: "09:00",
            fecha: "18:00",
        },
        {
            dia: "Sábado",
            abre: "09:00",
            fecha: "14:00",
        },
        {
            dia: "Domingo",
            abre: null,
            fecha: null,
        },
    ];

    /*
    ============================================================
    AGENDA
    ============================================================
    */

    const horarios = [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
    ];

    const agendamentos = [
        {
            id: 1,
            data: "2026-09-02",
            horario: "09:00",
            cliente: "João Silva",
            servico: "Corte + Barba",
            inicio: "09:00",
            fim: "10:00",
            valor: 55,
            status: "agendado",
        },
        {
            id: 2,
            data: "2026-09-02",
            horario: "11:00",
            cliente: "Pedro Henrique",
            servico: "Barba",
            inicio: "11:00",
            fim: "11:30",
            valor: 25,
            status: "em-atendimento",
        },
        {
            id: 3,
            data: "2026-09-02",
            horario: "14:00",
            cliente: "Lucas Almeida",
            servico: "Corte + Barba",
            inicio: "14:00",
            fim: "15:00",
            valor: 55,
            status: "concluido",
        },
        {
            id: 4,
            data: "2026-09-02",
            horario: "16:00",
            cliente: "Carlos Eduardo",
            servico: "Degradê",
            inicio: "16:00",
            fim: "17:00",
            valor: 40,
            status: "cancelado",
        },

        {
            id: 5,
            data: "2026-09-01",
            horario: "10:00",
            cliente: "Maria Oliveira",
            servico: "Corte feminino",
            inicio: "10:00",
            fim: "11:00",
            valor: 45,
            status: "concluido",
        },
        {
            id: 6,
            data: "2026-09-01",
            horario: "14:00",
            cliente: "Ana Paula",
            servico: "Corte masculino",
            inicio: "14:00",
            fim: "15:00",
            valor: 35,
            status: "agendado",
        },

        {
            id: 7,
            data: "2026-09-03",
            horario: "09:00",
            cliente: "Rafael Souza",
            servico: "Corte masculino",
            inicio: "09:00",
            fim: "10:00",
            valor: 35,
            status: "agendado",
        },
        {
            id: 8,
            data: "2026-09-03",
            horario: "14:00",
            cliente: "João Santos",
            servico: "Barba",
            inicio: "14:00",
            fim: "14:30",
            valor: 25,
            status: "em-atendimento",
        },

        {
            id: 9,
            data: "2026-09-04",
            horario: "10:00",
            cliente: "Lucas Mendes",
            servico: "Corte + Barba",
            inicio: "10:00",
            fim: "11:00",
            valor: 55,
            status: "concluido",
        },

        {
            id: 10,
            data: "2026-09-05",
            horario: "09:00",
            cliente: "Gabriel Lima",
            servico: "Corte masculino",
            inicio: "09:00",
            fim: "10:00",
            valor: 35,
            status: "agendado",
        },
    ];

    /*
    ============================================================
    SEMANA ATUAL DA AGENDA
    ============================================================
    */

    const inicioSemana = useMemo(() => {
        const data = new Date(dataSelecionada);
        const dia = data.getDay();

        const diferenca = dia === 0 ? -6 : 1 - dia;

        data.setDate(data.getDate() + diferenca);

        return data;
    }, [dataSelecionada]);

    const diasSemana = useMemo(() => {
        return Array.from({ length: 6 }, (_, index) => {
            return adicionarDias(inicioSemana, index);
        });
    }, [inicioSemana]);

    const obterDataString = (data) => {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${ano}-${mes}-${dia}`;
    };

    const obterAgendamento = (data, horario) => {
        const dataString = obterDataString(data);

        return agendamentos.find(
            (item) =>
                item.data === dataString &&
                item.horario === horario
        );
    };

    const statusTexto = {
        agendado: "Agendado",
        "em-atendimento": "Em atendimento",
        concluido: "Concluído",
        cancelado: "Cancelado",
    };

    /*
    ============================================================
    NAVEGAÇÃO DA AGENDA
    ============================================================
    */

    const navegarAgenda = (direcao) => {
        let quantidade = 1;

        if (periodoAgenda === "semana") {
            quantidade = 7;
        }

        if (periodoAgenda === "mes") {
            const novaData = new Date(dataSelecionada);

            novaData.setMonth(
                novaData.getMonth() + direcao
            );

            setDataSelecionada(novaData);
            return;
        }

        setDataSelecionada(
            adicionarDias(
                dataSelecionada,
                quantidade * direcao
            )
        );
    };

    /*
    ============================================================
    RENDERIZAÇÃO DE UM HORÁRIO
    ============================================================
    */

    const renderCelulaAgenda = (data, horario) => {
        const agendamento = obterAgendamento(
            data,
            horario
        );

        const diaSemana = data.getDay();

        const horarioTrabalho =
            horariosTrabalho[diaSemana === 0 ? 6 : diaSemana - 1];

        let foraDoHorario = false;

        if (
            !horarioTrabalho.abre ||
            horario < horarioTrabalho.abre ||
            horario >= horarioTrabalho.fecha
        ) {
            foraDoHorario = true;
        }

        if (foraDoHorario && !agendamento) {
            return (
                <div className="agenda-celula fora-horario">
                    <span>Fora do horário</span>
                </div>
            );
        }

        if (!agendamento) {
            return (
                <button
                    className="agenda-celula livre"
                    onClick={() =>
                        setAgendamentoSelecionado({
                            horario,
                            data: obterDataString(data),
                            status: "livre",
                        })
                    }
                >
                    <span>Livre</span>
                </button>
            );
        }

        return (
            <button
                className={`agenda-celula ${agendamento.status}`}
                onClick={() =>
                    setAgendamentoSelecionado(agendamento)
                }
            >
                <strong>{agendamento.cliente}</strong>
                <span>{agendamento.servico}</span>
                <small>
                    {agendamento.inicio} — {agendamento.fim}
                </small>
            </button>
        );
    };

    /*
    ============================================================
    GRÁFICO
    ============================================================
    */

    const dadosGrafico = [
        { dia: "01", valor: 320 },
        { dia: "02", valor: 480 },
        { dia: "03", valor: 390 },
        { dia: "04", valor: 510 },
        { dia: "05", valor: 430 },
        { dia: "06", valor: 600 },
        { dia: "07", valor: 540 },
    ];

    const maiorValorGrafico = Math.max(
        ...dadosGrafico.map((item) => item.valor)
    );

    /*
    ============================================================
    LOADING
    ============================================================
    */

    if (carregando) {
        return (
            <div className="detalhes-barbeiro-page">
                <p className="estado-pagina">
                    Carregando informações do barbeiro...
                </p>
            </div>
        );
    }

    /*
    ============================================================
    NÃO ENCONTRADO
    ============================================================
    */

    if (!barbeiro) {
        return (
            <div className="detalhes-barbeiro-page">
                <div className="barbeiro-nao-encontrado">
                    <h2>Barbeiro não encontrado</h2>

                    <button onClick={() => navigate(-1)}>
                        ← Voltar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="detalhes-barbeiro-page">

            {/* VOLTAR */}

            <button
                className="detalhes-voltar"
                onClick={() => navigate(-1)}
            >
                ← Voltar para barbeiros
            </button>

            {/* =====================================================
                CABEÇALHO
            ===================================================== */}

            <section className="barbeiro-header">

                <div className="barbeiro-header-foto">
                    <img
                        src={getUrlFotoBarbeiro(barbeiro.foto)}
                        alt={`${barbeiro.nome} ${barbeiro.sobrenome}`}
                        onError={(e) => {
                            e.currentTarget.style.display =
                                "none";
                        }}
                    />
                </div>

                <div className="barbeiro-header-info">

                    <span className="detalhes-eyebrow">
                        EQUIPE BRUTUS
                    </span>

                    <h1>
                        {barbeiro.nome}{" "}
                        {barbeiro.sobrenome}
                    </h1>

                    <span
                        className={`detalhes-status ${
                            barbeiro.ativo
                                ? "ativo"
                                : "inativo"
                        }`}
                    >
                        ●{" "}
                        {barbeiro.ativo
                            ? "Barbeiro ativo"
                            : "Barbeiro inativo"}
                    </span>

                    <div className="barbeiro-acoes">

                        <button
                            className="btn-editar"
                            onClick={() =>
                                console.log(
                                    "Editar barbeiro:",
                                    barbeiro._id
                                )
                            }
                        >
                            Editar barbeiro
                        </button>

                        <button
                            className={
                                barbeiro.ativo
                                    ? "btn-desativar"
                                    : "btn-ativar"
                            }
                            onClick={() => {
                                setBarbeiro({
                                    ...barbeiro,
                                    ativo: !barbeiro.ativo,
                                });
                            }}
                        >
                            {barbeiro.ativo
                                ? "Desativar barbeiro"
                                : "Ativar barbeiro"}
                        </button>

                    </div>

                </div>

            </section>

            {/* =====================================================
                AVISO INATIVO
            ===================================================== */}

            {!barbeiro.ativo && (
                <section className="barbeiro-inativo-alerta">

                    <div className="alerta-icone">
                        !
                    </div>

                    <div>
                        <strong>
                            Barbeiro inativo
                        </strong>

                        <p>
                            Este barbeiro não está disponível
                            para novos agendamentos.
                        </p>
                    </div>

                    <button
                        className="btn-ativar alerta-btn"
                        onClick={() =>
                            setBarbeiro({
                                ...barbeiro,
                                ativo: true,
                            })
                        }
                    >
                        Ativar barbeiro
                    </button>

                </section>
            )}

            {/* =====================================================
                INFORMAÇÕES
            ===================================================== */}

            <section className="detalhes-section">

                <div className="section-heading">

                    <span>01</span>

                    <div>
                        <h2>
                            Informações do barbeiro
                        </h2>

                        <p>
                            Dados cadastrais e profissionais
                        </p>
                    </div>

                </div>

                <div className="informacoes-grid">

                    <div className="info-box">
                        <small>EMAIL</small>
                        <strong>
                            {barbeiro.email || "-"}
                        </strong>
                    </div>

                    <div className="info-box">
                        <small>TELEFONE</small>
                        <strong>
                            {barbeiro.telefone || "-"}
                        </strong>
                    </div>

                    <div className="info-box">
                        <small>CNPJ</small>
                        <strong>
                            {barbeiro.cnpj || "-"}
                        </strong>
                    </div>

                    <div className="info-box">
                        <small>ENDEREÇO</small>
                        <strong>
                            {barbeiro.endereco || "-"}
                        </strong>
                    </div>

                    <div className="info-box">
                        <small>DATA DE NASCIMENTO</small>
                        <strong>
                            {barbeiro.dataNascimento
                                ? new Date(
                                    barbeiro.dataNascimento
                                ).toLocaleDateString(
                                    "pt-BR"
                                )
                                : "-"}
                        </strong>
                    </div>

                    <div className="info-box">
                        <small>DATA DE ADMISSÃO</small>
                        <strong>
                            {barbeiro.dataAdmissao
                                ? new Date(
                                    barbeiro.dataAdmissao
                                ).toLocaleDateString(
                                    "pt-BR"
                                )
                                : "-"}
                        </strong>
                    </div>

                </div>

            </section>

            {/* =====================================================
                ÁREA OPERACIONAL
            ===================================================== */}

            {barbeiro.ativo && (
                <>
                    {/* =================================================
                        INDICADORES
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading">

                            <span>02</span>

                            <div>
                                <h2>
                                    Visão geral
                                </h2>

                                <p>
                                    Desempenho do barbeiro
                                </p>
                            </div>

                        </div>

                        <div className="indicadores-grid">

                            <div className="indicador-card">
                                <small>
                                    ATENDIMENTOS
                                </small>

                                <strong>
                                    {indicadores.atendimentos}
                                </strong>

                                <span>
                                    Total realizado
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    CONCLUÍDOS
                                </small>

                                <strong>
                                    {indicadores.concluidos}
                                </strong>

                                <span>
                                    Atendimentos concluídos
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    CLIENTES
                                </small>

                                <strong>
                                    {indicadores.clientes}
                                </strong>

                                <span>
                                    Clientes atendidos
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    TAXA DE CONCLUSÃO
                                </small>

                                <strong>
                                    {indicadores.taxaConclusao}%
                                </strong>

                                <span>
                                    Dos atendimentos
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    CANCELAMENTOS
                                </small>

                                <strong>
                                    {indicadores.cancelados}
                                </strong>

                                <span>
                                    {indicadores.taxaCancelamento}%
                                    do total
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    MÉDIA DIÁRIA
                                </small>

                                <strong>
                                    {indicadores.mediaDiaria}
                                </strong>

                                <span>
                                    Atendimentos por dia
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    TICKET MÉDIO
                                </small>

                                <strong>
                                    {formatarMoeda(
                                        indicadores.ticketMedio
                                    )}
                                </strong>

                                <span>
                                    Por atendimento
                                </span>
                            </div>

                            <div className="indicador-card">
                                <small>
                                    CLIENTES RECORRENTES
                                </small>

                                <strong>
                                    {indicadores.clientesRecorrentes}
                                </strong>

                                <span>
                                    Clientes fidelizados
                                </span>
                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        AGENDA
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading agenda-heading">

                            <div>
                                <span>03</span>

                                <h2>
                                    Agenda
                                </h2>

                                <p>
                                    Visualização completa dos
                                    horários do barbeiro
                                </p>
                            </div>

                            <div className="agenda-filtros">

                                <button
                                    className={
                                        periodoAgenda === "dia"
                                            ? "selecionado"
                                            : ""
                                    }
                                    onClick={() =>
                                        setPeriodoAgenda("dia")
                                    }
                                >
                                    Dia
                                </button>

                                <button
                                    className={
                                        periodoAgenda === "semana"
                                            ? "selecionado"
                                            : ""
                                    }
                                    onClick={() =>
                                        setPeriodoAgenda("semana")
                                    }
                                >
                                    Semana
                                </button>

                                <button
                                    className={
                                        periodoAgenda === "mes"
                                            ? "selecionado"
                                            : ""
                                    }
                                    onClick={() =>
                                        setPeriodoAgenda("mes")
                                    }
                                >
                                    Mês
                                </button>

                            </div>

                        </div>

                        <div className="agenda-legenda">

                            <span>
                                <i className="legenda-livre" />
                                Livre
                            </span>

                            <span>
                                <i className="legenda-agendado" />
                                Agendado
                            </span>

                            <span>
                                <i className="legenda-atendimento" />
                                Em atendimento
                            </span>

                            <span>
                                <i className="legenda-concluido" />
                                Concluído
                            </span>

                            <span>
                                <i className="legenda-cancelado" />
                                Cancelado
                            </span>

                            <span>
                                <i className="legenda-fora" />
                                Fora do horário
                            </span>

                        </div>

                        <div className="agenda-calendario">

                            <div className="agenda-data">

                                <button
                                    onClick={() =>
                                        navegarAgenda(-1)
                                    }
                                >
                                    ‹
                                </button>

                                <strong>
                                    {periodoAgenda ===
                                    "semana"
                                        ? `${formatarData(
                                            diasSemana[0]
                                        )} — ${formatarData(
                                            diasSemana[
                                                diasSemana.length -
                                                1
                                            ]
                                        )}`
                                        : formatarData(
                                            dataSelecionada
                                        )}
                                </strong>

                                <button
                                    onClick={() =>
                                        navegarAgenda(1)
                                    }
                                >
                                    ›
                                </button>

                            </div>

                            {/* VISÃO SEMANAL */}

                            {periodoAgenda === "semana" && (
                                <div className="agenda-semana">

                                    <div className="agenda-cabecalho">

                                        <div className="agenda-coluna-hora">
                                            HORÁRIO
                                        </div>

                                        {diasSemana.map(
                                            (dia) => (
                                                <div
                                                    className="agenda-dia-header"
                                                    key={obterDataString(
                                                        dia
                                                    )}
                                                >
                                                    <strong>
                                                        {dia
                                                            .toLocaleDateString(
                                                                "pt-BR",
                                                                {
                                                                    weekday:
                                                                        "short",
                                                                }
                                                            )
                                                            .replace(
                                                                ".",
                                                                ""
                                                            )
                                                            .toUpperCase()}
                                                    </strong>

                                                    <span>
                                                        {dia.getDate()}
                                                    </span>
                                                </div>
                                            )
                                        )}

                                    </div>

                                    <div className="agenda-grade">

                                        {horarios.map(
                                            (horario) => (
                                                <div
                                                    className="agenda-linha"
                                                    key={horario}
                                                >

                                                    <div className="agenda-hora">
                                                        {horario}
                                                    </div>

                                                    {diasSemana.map(
                                                        (
                                                            dia
                                                        ) => (
                                                            <div
                                                                className="agenda-grade-celula"
                                                                key={`${obterDataString(
                                                                    dia
                                                                )}-${horario}`}
                                                            >
                                                                {renderCelulaAgenda(
                                                                    dia,
                                                                    horario
                                                                )}
                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* VISÃO DIÁRIA */}

                            {periodoAgenda === "dia" && (
                                <div className="agenda-dia">

                                    <div className="agenda-dia-titulo">
                                        <strong>
                                            {dataSelecionada.toLocaleDateString(
                                                "pt-BR",
                                                {
                                                    weekday:
                                                        "long",
                                                }
                                            )}
                                        </strong>

                                        <span>
                                            {formatarData(
                                                dataSelecionada
                                            )}
                                        </span>
                                    </div>

                                    <div className="agenda-horarios">

                                        {horarios.map(
                                            (horario) => (
                                                <div
                                                    className="agenda-horario-dia"
                                                    key={horario}
                                                >

                                                    <div className="agenda-hora">
                                                        {horario}
                                                    </div>

                                                    <div className="agenda-dia-slot">
                                                        {renderCelulaAgenda(
                                                            dataSelecionada,
                                                            horario
                                                        )}
                                                    </div>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* VISÃO MENSAL */}

                            {periodoAgenda === "mes" && (
                                <div className="agenda-mes">

                                    <div className="mes-cabecalho">

                                        {[
                                            "SEG",
                                            "TER",
                                            "QUA",
                                            "QUI",
                                            "SEX",
                                            "SÁB",
                                            "DOM",
                                        ].map(
                                            (dia) => (
                                                <div key={dia}>
                                                    {dia}
                                                </div>
                                            )
                                        )}

                                    </div>

                                    <div className="mes-grade">

                                        {Array.from(
                                            {
                                                length: 30,
                                            },
                                            (_, index) => {
                                                const dia =
                                                    new Date(
                                                        dataSelecionada.getFullYear(),
                                                        dataSelecionada.getMonth(),
                                                        index + 1
                                                    );

                                                const dataString =
                                                    obterDataString(
                                                        dia
                                                    );

                                                const eventos =
                                                    agendamentos.filter(
                                                        (
                                                            item
                                                        ) =>
                                                            item.data ===
                                                            dataString
                                                    );

                                                return (
                                                    <button
                                                        key={
                                                            dataString
                                                        }
                                                        className={`mes-dia ${
                                                            dia.getDate() ===
                                                            dataSelecionada.getDate()
                                                                ? "selecionado"
                                                                : ""
                                                        }`}
                                                        onClick={() => {
                                                            setDataSelecionada(
                                                                dia
                                                            );
                                                            setPeriodoAgenda(
                                                                "dia"
                                                            );
                                                        }}
                                                    >

                                                        <strong>
                                                            {dia.getDate()}
                                                        </strong>

                                                        <div className="mes-eventos">

                                                            {eventos
                                                                .slice(
                                                                    0,
                                                                    3
                                                                )
                                                                .map(
                                                                    (
                                                                        evento
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                evento.id
                                                                            }
                                                                            className={
                                                                                evento.status
                                                                            }
                                                                        >
                                                                            {
                                                                                evento.horario
                                                                            }{" "}
                                                                            {
                                                                                evento.cliente
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}

                                                        </div>

                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>
                            )}

                        </div>

                    </section>

                    {/* =================================================
                        FATURAMENTO
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading">

                            <span>04</span>

                            <div>
                                <h2>
                                    Faturamento
                                </h2>

                                <p>
                                    Acompanhamento financeiro
                                </p>
                            </div>

                        </div>

                        <div className="faturamento-filtros">

                            <button
                                className={
                                    periodoFaturamento === "hoje"
                                        ? "selecionado"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriodoFaturamento("hoje")
                                }
                            >
                                Hoje
                            </button>

                            <button
                                className={
                                    periodoFaturamento === "7dias"
                                        ? "selecionado"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriodoFaturamento("7dias")
                                }
                            >
                                7 dias
                            </button>

                            <button
                                className={
                                    periodoFaturamento === "mes"
                                        ? "selecionado"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriodoFaturamento("mes")
                                }
                            >
                                Este mês
                            </button>

                            <button
                                className={
                                    periodoFaturamento === "30dias"
                                        ? "selecionado"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriodoFaturamento("30dias")
                                }
                            >
                                Últimos 30 dias
                            </button>

                            <button
                                className={
                                    periodoFaturamento ===
                                    "personalizado"
                                        ? "selecionado"
                                        : ""
                                }
                                onClick={() =>
                                    setPeriodoFaturamento(
                                        "personalizado"
                                    )
                                }
                            >
                                Personalizado
                            </button>

                        </div>

                        <div className="faturamento-grid">

                            <div className="faturamento-card">
                                <small>
                                    HOJE
                                </small>

                                <strong>
                                    {formatarMoeda(
                                        faturamento.diario
                                    )}
                                </strong>
                            </div>

                            <div className="faturamento-card">
                                <small>
                                    ESTA SEMANA
                                </small>

                                <strong>
                                    {formatarMoeda(
                                        faturamento.semanal
                                    )}
                                </strong>
                            </div>

                            <div className="faturamento-card">
                                <small>
                                    ESTE MÊS
                                </small>

                                <strong>
                                    {formatarMoeda(
                                        faturamento.mensal
                                    )}
                                </strong>
                            </div>

                            <div className="faturamento-card destaque">
                                <small>
                                    FATURAMENTO TOTAL
                                </small>

                                <strong>
                                    {formatarMoeda(
                                        faturamento.total
                                    )}
                                </strong>
                            </div>

                        </div>

                        {/* GRÁFICO */}

                        <div className="grafico-faturamento">

                            <div className="grafico-titulo">

                                <div>
                                    <h3>
                                        Faturamento
                                    </h3>

                                    <span>
                                        Setembro de 2026
                                    </span>
                                </div>

                                <strong>
                                    {formatarMoeda(
                                        faturamento.mensal
                                    )}
                                </strong>

                            </div>

                            <div className="grafico-area">

                                <div className="grafico-valores">

                                    <span>R$ 600</span>
                                    <span>R$ 450</span>
                                    <span>R$ 300</span>
                                    <span>R$ 150</span>
                                    <span>R$ 0</span>

                                </div>

                                <div className="grafico">

                                    <div className="grafico-linhas">
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                        <span />
                                    </div>

                                    <div className="grafico-pontos">

                                        {dadosGrafico.map(
                                            (item) => (
                                                <div
                                                    className="grafico-ponto-coluna"
                                                    key={
                                                        item.dia
                                                    }
                                                >

                                                    <div
                                                        className="grafico-ponto"
                                                        style={{
                                                            height: `${
                                                                (item.valor /
                                                                    maiorValorGrafico) *
                                                                100
                                                            }%`,
                                                        }}
                                                        title={`${item.dia}/09 — ${formatarMoeda(
                                                            item.valor
                                                        )}`}
                                                    />

                                                    <span>
                                                        {item.dia}
                                                    </span>

                                                </div>
                                            )
                                        )}

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        SERVIÇOS
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading">

                            <span>05</span>

                            <div>
                                <h2>
                                    Serviços mais realizados
                                </h2>

                                <p>
                                    Perfil de atendimento
                                </p>
                            </div>

                        </div>

                        <div className="servicos-lista">

                            {servicos.map(
                                (servico, index) => (
                                    <div
                                        className="servico-item"
                                        key={servico.nome}
                                    >

                                        <div className="servico-ranking">
                                            {index + 1}
                                        </div>

                                        <div className="servico-info">

                                            <strong>
                                                {servico.nome}
                                            </strong>

                                            <span>
                                                {servico.quantidade}{" "}
                                                atendimentos
                                            </span>

                                            <div className="servico-barra">
                                                <span
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            (servico.quantidade /
                                                                servicos[0]
                                                                    .quantidade) *
                                                                100
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                        </div>

                                        <strong className="servico-quantidade">
                                            {servico.quantidade}
                                        </strong>

                                    </div>
                                )
                            )}

                        </div>

                    </section>

                    {/* =================================================
                        CLIENTES
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading">

                            <span>06</span>

                            <div>
                                <h2>
                                    Clientes atendidos
                                </h2>

                                <p>
                                    Histórico de atendimento
                                </p>
                            </div>

                        </div>

                        <div className="clientes-resumo">

                            <div className="cliente-resumo-card">
                                <small>
                                    TOTAL
                                </small>

                                <strong>
                                    {indicadores.clientes}
                                </strong>

                                <span>
                                    clientes atendidos
                                </span>
                            </div>

                            <div className="cliente-resumo-card">
                                <small>
                                    NOVOS
                                </small>

                                <strong>
                                    {indicadores.clientesNovos}
                                </strong>

                                <span>
                                    novos clientes
                                </span>
                            </div>

                            <div className="cliente-resumo-card">
                                <small>
                                    RECORRENTES
                                </small>

                                <strong>
                                    {indicadores.clientesRecorrentes}
                                </strong>

                                <span>
                                    clientes recorrentes
                                </span>
                            </div>

                        </div>

                        <div className="clientes-tabela">

                            <div className="clientes-tabela-header">
                                <span>
                                    CLIENTE
                                </span>

                                <span>
                                    SERVIÇO
                                </span>

                                <span>
                                    DATA
                                </span>

                                <span>
                                    VALOR
                                </span>
                            </div>

                            {clientesRecentes.map(
                                (cliente) => (
                                    <div
                                        className="cliente-linha"
                                        key={`${cliente.nome}-${cliente.data}`}
                                    >

                                        <strong>
                                            {cliente.nome}
                                        </strong>

                                        <span>
                                            {cliente.servico}
                                        </span>

                                        <span>
                                            {cliente.data}
                                        </span>

                                        <strong>
                                            {formatarMoeda(
                                                cliente.valor
                                            )}
                                        </strong>

                                    </div>
                                )
                            )}

                        </div>

                    </section>

                    {/* =================================================
                        HORÁRIOS
                    ================================================= */}

                    <section className="detalhes-section">

                        <div className="section-heading">

                            <span>07</span>

                            <div>
                                <h2>
                                    Horários de trabalho
                                </h2>

                                <p>
                                    Disponibilidade semanal
                                </p>
                            </div>

                        </div>

                        <div className="horarios-trabalho">

                            {horariosTrabalho.map(
                                (item) => (
                                    <div
                                        className="horario-trabalho-item"
                                        key={item.dia}
                                    >

                                        <strong>
                                            {item.dia}
                                        </strong>

                                        {item.abre ? (
                                            <span>
                                                {item.abre} —{" "}
                                                {item.fecha}
                                            </span>
                                        ) : (
                                            <span className="fechado">
                                                Fechado
                                            </span>
                                        )}

                                    </div>
                                )
                            )}

                        </div>

                        <button
                            className="btn-editar-horarios"
                            onClick={() =>
                                console.log(
                                    "Editar horários"
                                )
                            }
                        >
                            Editar horários
                        </button>

                    </section>
                </>
            )}

            {/* =====================================================
                MODAL DO AGENDAMENTO
            ===================================================== */}

            {agendamentoSelecionado && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setAgendamentoSelecionado(null)
                    }
                >

                    <div
                        className="modal-agendamento"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="modal-fechar"
                            onClick={() =>
                                setAgendamentoSelecionado(null)
                            }
                        >
                            ×
                        </button>

                        {agendamentoSelecionado.status ===
                        "livre" ? (
                            <>

                                <span className="modal-eyebrow">
                                    HORÁRIO DISPONÍVEL
                                </span>

                                <h2>
                                    Horário livre
                                </h2>

                                <div className="modal-info">

                                    <div>
                                        <small>
                                            DATA
                                        </small>

                                        <strong>
                                            {new Date(
                                                `${agendamentoSelecionado.data}T12:00:00`
                                            ).toLocaleDateString(
                                                "pt-BR"
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            HORÁRIO
                                        </small>

                                        <strong>
                                            {
                                                agendamentoSelecionado.horario
                                            }
                                        </strong>
                                    </div>

                                </div>

                            </>
                        ) : (
                            <>

                                <span className="modal-eyebrow">
                                    DETALHES DO AGENDAMENTO
                                </span>

                                <h2>
                                    {
                                        agendamentoSelecionado.cliente
                                    }
                                </h2>

                                <div className="modal-status">
                                    <span
                                        className={
                                            agendamentoSelecionado.status
                                        }
                                    >
                                        ●{" "}
                                        {
                                            statusTexto[
                                                agendamentoSelecionado
                                                    .status
                                            ]
                                        }
                                    </span>
                                </div>

                                <div className="modal-info">

                                    <div>
                                        <small>
                                            SERVIÇO
                                        </small>

                                        <strong>
                                            {
                                                agendamentoSelecionado.servico
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            HORÁRIO
                                        </small>

                                        <strong>
                                            {
                                                agendamentoSelecionado.inicio
                                            }{" "}
                                            —{" "}
                                            {
                                                agendamentoSelecionado.fim
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            VALOR
                                        </small>

                                        <strong>
                                            {formatarMoeda(
                                                agendamentoSelecionado.valor
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <small>
                                            DATA
                                        </small>

                                        <strong>
                                            {new Date(
                                                `${agendamentoSelecionado.data}T12:00:00`
                                            ).toLocaleDateString(
                                                "pt-BR"
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </>
                        )}

                        <button
                            className="modal-botao-fechar"
                            onClick={() =>
                                setAgendamentoSelecionado(null)
                            }
                        >
                            Fechar
                        </button>

                    </div>

                </div>
            )}

            {/* =====================================================
                RODAPÉ
            ===================================================== */}

            <div className="detalhes-footer">

                <span />

                <p>
                    Brutus System · Gestão de barbeiros
                </p>

            </div>

        </div>
    );
}