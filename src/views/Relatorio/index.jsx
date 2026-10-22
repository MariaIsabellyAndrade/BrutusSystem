import React, { useCallback, useEffect, useState } from "react";
import "./index.css";
import { buscarRelatorioFinanceiro, buscarDadosGerenciais, atualizarPercentualComissao, marcarComissaoPaga, concluirAtendimento } from "../../service/serviceRelatorio";
import { listarBarbeiros } from "../../service/serviceBarbeiro";
import { formatarMoedaExibicao, formatarDataSemFuso } from "../../utils/formatters";

/* ─────────────────────────────────────────────────────────────────
   COMPONENTES INTERNOS
───────────────────────────────────────────────────────────────── */

/** Card simples de indicador */
function CardIndicador({ rotulo, valor, destaque = false, sub }) {
    return (
        <div className={`relatorio-card ${destaque ? "relatorio-card--dourado" : ""}`}>
            <span className="relatorio-card-rotulo">{rotulo}</span>
            <strong className="relatorio-card-valor">{valor}</strong>
            {sub && <small className="relatorio-card-sub">{sub}</small>}
        </div>
    );
}

/** Gráfico de barras em SVG nativo */
function GraficoBarras({ dados, altura = 180 }) {
    if (!dados || dados.length === 0) {
        return (
            <div className="relatorio-grafico-vazio">
                <span>Sem dados para exibir no período</span>
            </div>
        );
    }

    const maximo = Math.max(...dados.map(d => d.valor), 1);
    const larguraBarra = Math.max(16, Math.min(48, Math.floor(700 / dados.length) - 8));
    const larguraTotal = dados.length * (larguraBarra + 8) + 40;

    return (
        <div className="relatorio-grafico-wrapper" style={{ overflowX: "auto" }}>
            <svg
                width={Math.max(larguraTotal, 400)}
                height={altura + 50}
                aria-label="Gráfico de faturamento por dia"
                role="img"
            >
                {/* Linhas de referência */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                    const y = 10 + (1 - frac) * (altura - 20);
                    const val = maximo * frac;
                    return (
                        <g key={i}>
                            <line x1={36} x2={larguraTotal - 8} y1={y} y2={y}
                                stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <text x={2} y={y + 4} fill="#555" fontSize="9" textAnchor="start">
                                {val >= 1000
                                    ? `${(val / 1000).toFixed(1)}k`
                                    : val.toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* Barras */}
                {dados.map((d, i) => {
                    const x = 40 + i * (larguraBarra + 8);
                    const barAltura = Math.max(
                        2,
                        ((d.valor / maximo) * (altura - 20))
                    );
                    const y = 10 + (altura - 20) - barAltura;

                    // Label data abreviada
                    const partes = d.data.split("-");
                    const label = partes.length === 3
                        ? `${partes[2]}/${partes[1]}`
                        : d.data;

                    return (
                        <g key={d.data}>
                            <rect
                                x={x}
                                y={y}
                                width={larguraBarra}
                                height={barAltura}
                                rx={3}
                                fill="#c99a3a"
                                opacity={0.85}
                            />
                            <text
                                x={x + larguraBarra / 2}
                                y={altura + 24}
                                fill="#888"
                                fontSize="9"
                                textAnchor="middle"
                            >
                                {label}
                            </text>
                            {/* tooltip ao hover via title */}
                            <title>{`${label}: ${formatarMoedaExibicao(d.valor)}`}</title>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/** Tabela de ranking dos barbeiros (somente ADMIN) */
function TabelaRanking({ ranking }) {
    if (!ranking || ranking.length === 0) {
        return (
            <div className="relatorio-tabela-vazia">
                <span>Nenhum dado disponível</span>
            </div>
        );
    }

    return (
        <div className="relatorio-tabela-wrapper">
            <table className="relatorio-tabela" aria-label="Ranking de faturamento por barbeiro">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Barbeiro</th>
                        <th>Confirmados</th>
                        <th>Concluídos</th>
                        <th>Pendentes</th>
                        <th>Cancelados</th>
                        <th>Receita Recebida</th>
                        <th>Val. Pendente</th>
                    </tr>
                </thead>
                <tbody>
                    {ranking.map((item, idx) => (
                        <tr key={item.barbeiroId}>
                            <td>
                                <span className={`relatorio-pos ${idx === 0 ? "relatorio-pos--ouro" : idx === 1 ? "relatorio-pos--prata" : idx === 2 ? "relatorio-pos--bronze" : ""}`}>
                                    {idx + 1}º
                                </span>
                            </td>
                            <td>
                                <span className="relatorio-barbeiro-nome">{item.nome}</span>
                            </td>
                            <td>
                                <span className="relatorio-badge relatorio-badge--verde">
                                    {item.confirmados}
                                </span>
                            </td>
                            <td>
                                <span className="relatorio-badge relatorio-badge--verde">{item.concluidos || 0}</span>
                            </td>
                            <td>
                                <span className="relatorio-badge relatorio-badge--amarelo">
                                    {item.pendentes}
                                </span>
                            </td>
                            <td>
                                <span className="relatorio-badge relatorio-badge--vermelho">
                                    {item.cancelados}
                                </span>
                            </td>
                            <td className="relatorio-td-destaque">
                                {formatarMoedaExibicao(item.receitaRecebida)}
                            </td>
                            <td className="relatorio-td-pendente">
                                {formatarMoedaExibicao(item.valorPendente)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────────────────────── */

export default function RelatorioFinanceiro() {
    const tipo = (sessionStorage.getItem("tipo") || "").trim().toUpperCase();
    const isAdmin = tipo === "ADMIN";

    // ── Estados ──────────────────────────────────────────────────
    const [dados, setDados]           = useState(null);
    const [gerencial, setGerencial]   = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro]             = useState("");
    const [salvandoComissoes, setSalvandoComissoes] = useState(false);
    const [acaoComissaoId, setAcaoComissaoId] = useState("");
    const [concluindoId, setConcluindoId] = useState("");

    // Filtros
    const [barbeiros, setBarbeiros]           = useState([]);
    const [barbeiroFiltro, setBarbeiroFiltro] = useState("");
    const [dataInicio, setDataInicio]         = useState("");
    const [dataFim, setDataFim]               = useState("");

    // ── Carrega lista de barbeiros (só ADMIN) ────────────────────
    useEffect(() => {
        if (!isAdmin) return;
        listarBarbeiros()
            .then(resposta => {
                // listarBarbeiros retorna axios response diretamente
                const lista = Array.isArray(resposta)
                    ? resposta
                    : Array.isArray(resposta?.data)
                        ? resposta.data
                        : [];
                setBarbeiros(lista);
            })
            .catch(() => setBarbeiros([]));
    }, [isAdmin]);

    // ── Busca do relatório ───────────────────────────────────────
    const buscar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        setDados(null);
        try {
            const params = {};
            if (isAdmin && barbeiroFiltro) params.barbeiroId = barbeiroFiltro;
            if (dataInicio) params.dataInicio = dataInicio;
            if (dataFim)    params.dataFim    = dataFim;

            const [resultado, resultadoGerencial] = await Promise.all([
                buscarRelatorioFinanceiro(params),
                buscarDadosGerenciais(params),
            ]);
            setDados(resultado);
            setGerencial(resultadoGerencial);
        } catch (err) {
            const msg =
                err?.response?.data?.erro ||
                err?.response?.data?.message ||
                err?.message ||
                "Erro ao carregar relatório";
            setErro(msg);
        } finally {
            setCarregando(false);
        }
    }, [isAdmin, barbeiroFiltro, dataInicio, dataFim]);

    // Carrega ao montar
    useEffect(() => {
        buscar();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const limparFiltros = () => {
        setBarbeiroFiltro("");
        setDataInicio("");
        setDataFim("");
    };

    const salvarComissoes = async () => {
        if (!isAdmin || !gerencial) return;
        setSalvandoComissoes(true);
        setErro("");
        try {
            await Promise.all(gerencial.servicosComissao.map((servico) =>
                atualizarPercentualComissao(servico.id, servico.percentual)
            ));
            await buscar();
        } catch (err) {
            setErro(err?.response?.data?.erro || "Não foi possível salvar os percentuais de comissão.");
        } finally {
            setSalvandoComissoes(false);
        }
    };

    const confirmarPagamentoComissao = async (id) => {
        setAcaoComissaoId(id);
        setErro("");
        try {
            await marcarComissaoPaga(id);
            await buscar();
        } catch (err) {
            setErro(err?.response?.data?.erro || "Não foi possível registrar o pagamento da comissão.");
        } finally {
            setAcaoComissaoId("");
        }
    };

    const marcarAtendimentoConcluido = async (id) => {
        setConcluindoId(id);
        setErro("");
        try {
            await concluirAtendimento(id);
            await buscar();
        } catch (err) {
            setErro(err?.response?.data?.erro || "Não foi possível concluir este atendimento.");
        } finally {
            setConcluindoId("");
        }
    };

    const exportarCsv = () => {
        if (!dados) return;
        const linhas = [["Indicador", "Valor"]];
        if (dados.tipo === "geral") {
            const { financeiro, quantidades } = dados.indicadoresGlobais;
            linhas.push(["Receita confirmada", financeiro.receitaRecebida], ["Valor pendente", financeiro.valorPendente], ["Agendamentos", quantidades.total], ["Confirmados", quantidades.confirmados], ["Pendentes", quantidades.pendentes], ["Cancelados", quantidades.cancelados]);
            linhas.push([], ["Barbeiro", "Confirmados", "Concluídos", "Pendentes", "Cancelados", "Receita", "Valor pendente"]);
            for (const item of dados.ranking || []) linhas.push([item.nome, item.confirmados, item.concluidos || 0, item.pendentes, item.cancelados, item.receitaRecebida, item.valorPendente]);
        } else {
            const { financeiro, quantidades } = dados.indicadores;
            linhas.push(["Receita confirmada", financeiro.receitaRecebida], ["Valor pendente", financeiro.valorPendente], ["Agendamentos", quantidades.total], ["Confirmados", quantidades.confirmados], ["Pendentes", quantidades.pendentes], ["Cancelados", quantidades.cancelados]);
        }
        linhas.push([], ["Atendimentos"], ["Data", "Hora", "Cliente", "Barbeiro", "Serviços", "Valor", "Status"]);
        for (const item of gerencial?.agendamentos || []) linhas.push([item.data, item.hora, item.cliente, item.barbeiro, item.servicos.join(", "), item.valor, item.status]);
        linhas.push([], ["Histórico de comissões"], ["Barbeiro", "Serviço", "Base", "Percentual", "Comissão", "Status", "Gerada em", "Paga em"]);
        for (const item of gerencial?.historicoComissoes || []) linhas.push([item.barbeiro, item.servico, item.valorBase, item.percentual, item.valor, item.status, item.geradaEm, item.pagaEm || ""]);
        const csv = linhas.map((linha) => linha.map((valor) => `"${String(valor ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-financeiro.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    // ── Helpers de renderização ─────────────────────────────────
    const renderIndicadoresIndividual = () => {
        if (!dados || dados.tipo !== "individual") return null;
        const { indicadores, periodos } = dados;
        const { quantidades, financeiro, taxaCancelamento } = indicadores;

        return (
            <>
                {/* Cards financeiros */}
                <section aria-labelledby="secao-financeiro">
                    <h2 className="relatorio-secao-titulo" id="secao-financeiro">
                        Dados Financeiros
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador
                            rotulo="Receita Recebida"
                            valor={formatarMoedaExibicao(financeiro.receitaRecebida)}
                            destaque
                            sub="Agendamentos confirmados"
                        />
                        <CardIndicador
                            rotulo="Valor Pendente"
                            valor={formatarMoedaExibicao(financeiro.valorPendente)}
                            sub="Sinal ainda não pago"
                        />
                        <CardIndicador
                            rotulo="Total Previsto"
                            valor={formatarMoedaExibicao(financeiro.valorTotalPrevisto)}
                            sub="Confirmados + Pendentes"
                        />
                    </div>
                </section>

                {/* Cards de período */}
                <section aria-labelledby="secao-periodo">
                    <h2 className="relatorio-secao-titulo" id="secao-periodo">
                        Receita por Período
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador rotulo="Hoje"          valor={formatarMoedaExibicao(periodos.hoje)} />
                        <CardIndicador rotulo="Esta Semana"   valor={formatarMoedaExibicao(periodos.semana)} />
                        <CardIndicador rotulo="Este Mês"      valor={formatarMoedaExibicao(periodos.mes)} />
                    </div>
                </section>

                {/* Cards de quantidade */}
                <section aria-labelledby="secao-qtd">
                    <h2 className="relatorio-secao-titulo" id="secao-qtd">
                        Agendamentos
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador rotulo="Total"       valor={quantidades.total} />
                        <CardIndicador rotulo="Confirmados" valor={quantidades.confirmados} sub="Sinal pago" />
                        <CardIndicador rotulo="Concluídos" valor={quantidades.concluidos || 0} sub="Serviço realizado" />
                        <CardIndicador rotulo="Pendentes"   valor={quantidades.pendentes}   sub="Aguardando pagamento" />
                        <CardIndicador rotulo="Cancelados"  valor={quantidades.cancelados} />
                        <CardIndicador rotulo="Taxa de Cancelamento" valor={`${taxaCancelamento}%`} />
                    </div>
                </section>

                {/* Gráfico */}
                <section aria-labelledby="secao-grafico">
                    <h2 className="relatorio-secao-titulo" id="secao-grafico">
                        Evolução de Receita (Confirmados)
                    </h2>
                    <div className="relatorio-grafico-container">
                        <GraficoBarras dados={dados.grafico} />
                    </div>
                </section>
            </>
        );
    };

    const renderRelatorioGeral = () => {
        if (!dados || dados.tipo !== "geral") return null;
        const { indicadoresGlobais, periodosGlobais, graficoGlobal, ranking } = dados;
        const { quantidades, financeiro, taxaCancelamento } = indicadoresGlobais;

        return (
            <>
                {/* Cards financeiros globais */}
                <section aria-labelledby="secao-financeiro-geral">
                    <h2 className="relatorio-secao-titulo" id="secao-financeiro-geral">
                        Dados Financeiros — Geral
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador
                            rotulo="Receita Total Recebida"
                            valor={formatarMoedaExibicao(financeiro.receitaRecebida)}
                            destaque
                            sub="Todos os barbeiros · Confirmados"
                        />
                        <CardIndicador
                            rotulo="Valor Total Pendente"
                            valor={formatarMoedaExibicao(financeiro.valorPendente)}
                            sub="Sinais não pagos"
                        />
                        <CardIndicador
                            rotulo="Total Previsto"
                            valor={formatarMoedaExibicao(financeiro.valorTotalPrevisto)}
                            sub="Confirmados + Pendentes"
                        />
                    </div>
                </section>

                {/* Período global */}
                <section aria-labelledby="secao-periodo-geral">
                    <h2 className="relatorio-secao-titulo" id="secao-periodo-geral">
                        Receita por Período
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador rotulo="Hoje"        valor={formatarMoedaExibicao(periodosGlobais.hoje)} />
                        <CardIndicador rotulo="Esta Semana" valor={formatarMoedaExibicao(periodosGlobais.semana)} />
                        <CardIndicador rotulo="Este Mês"    valor={formatarMoedaExibicao(periodosGlobais.mes)} />
                    </div>
                </section>

                {/* Quantidades */}
                <section aria-labelledby="secao-qtd-geral">
                    <h2 className="relatorio-secao-titulo" id="secao-qtd-geral">
                        Agendamentos
                    </h2>
                    <div className="relatorio-cards-grid">
                        <CardIndicador rotulo="Total"       valor={quantidades.total} />
                        <CardIndicador rotulo="Confirmados" valor={quantidades.confirmados} />
                        <CardIndicador rotulo="Concluídos" valor={quantidades.concluidos || 0} sub="Serviço realizado" />
                        <CardIndicador rotulo="Pendentes"   valor={quantidades.pendentes} />
                        <CardIndicador rotulo="Cancelados"  valor={quantidades.cancelados} />
                        <CardIndicador rotulo="Taxa de Cancelamento" valor={`${taxaCancelamento}%`} />
                    </div>
                </section>

                {/* Gráfico global */}
                <section aria-labelledby="secao-grafico-geral">
                    <h2 className="relatorio-secao-titulo" id="secao-grafico-geral">
                        Evolução de Receita — Todos os Barbeiros
                    </h2>
                    <div className="relatorio-grafico-container">
                        <GraficoBarras dados={graficoGlobal} />
                    </div>
                </section>

                {/* Ranking */}
                <section aria-labelledby="secao-ranking">
                    <h2 className="relatorio-secao-titulo" id="secao-ranking">
                        Ranking de Faturamento por Barbeiro
                    </h2>
                    <TabelaRanking ranking={ranking} />
                </section>
            </>
        );
    };

    // ── Período filtrado exibido no cabeçalho ────────────────────
    const periodoTexto = () => {
        if (!dataInicio && !dataFim) return "Todo o período";
        if (dataInicio && dataFim)
            return `${formatarDataSemFuso(dataInicio)} — ${formatarDataSemFuso(dataFim)}`;
        if (dataInicio) return `A partir de ${formatarDataSemFuso(dataInicio)}`;
        return `Até ${formatarDataSemFuso(dataFim)}`;
    };

    // ── Render principal ─────────────────────────────────────────
    return (
        <div className="relatorio-container">

            {/* CABEÇALHO */}
            <div className="relatorio-cabecalho">
                <div>
                    <span className="relatorio-subtitulo">FINANCEIRO</span>
                    <h1 className="relatorio-titulo">Relatório Financeiro</h1>
                    {dados && (
                        <p className="relatorio-periodo-texto">
                            {!isAdmin && dados.tipo === "individual" && dados.barbeiro && (
                                <>{dados.barbeiro.nome} · </>
                            )}
                            {periodoTexto()}
                        </p>
                    )}
                </div>
                {dados && <div className="relatorio-exportacoes no-print">
                    <button type="button" className="relatorio-btn relatorio-btn--secundario" onClick={exportarCsv}>Exportar CSV</button>
                    <button type="button" className="relatorio-btn relatorio-btn--primario" onClick={() => window.print()}>Salvar PDF</button>
                </div>}
            </div>

            {/* FILTROS */}
            <div className="relatorio-filtros">
                {isAdmin && (
                    <div className="relatorio-filtro-grupo">
                        <label htmlFor="filtro-barbeiro">Barbeiro</label>
                        <select
                            id="filtro-barbeiro"
                            value={barbeiroFiltro}
                            onChange={e => setBarbeiroFiltro(e.target.value)}
                        >
                            <option value="">Todos os barbeiros</option>
                            {barbeiros.map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.nome} {b.sobrenome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="relatorio-filtro-grupo">
                    <label htmlFor="filtro-inicio">Data início</label>
                    <input
                        id="filtro-inicio"
                        type="date"
                        value={dataInicio}
                        onChange={e => setDataInicio(e.target.value)}
                        max={dataFim || undefined}
                    />
                </div>

                <div className="relatorio-filtro-grupo">
                    <label htmlFor="filtro-fim">Data fim</label>
                    <input
                        id="filtro-fim"
                        type="date"
                        value={dataFim}
                        onChange={e => setDataFim(e.target.value)}
                        min={dataInicio || undefined}
                    />
                </div>

                <div className="relatorio-filtro-acoes">
                    <button
                        type="button"
                        className="relatorio-btn relatorio-btn--primario"
                        onClick={buscar}
                        disabled={carregando}
                    >
                        {carregando ? "Carregando…" : "Filtrar"}
                    </button>
                    <button
                        type="button"
                        className="relatorio-btn relatorio-btn--secundario"
                        onClick={() => { limparFiltros(); }}
                        disabled={carregando}
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {/* ERRO */}
            {erro && (
                <div className="relatorio-erro" role="alert">
                    <span>⚠ {erro}</span>
                </div>
            )}

            {/* LOADING */}
            {carregando && (
                <div className="relatorio-loading" aria-live="polite">
                    <div className="relatorio-spinner" aria-hidden="true" />
                    <span>Carregando dados financeiros…</span>
                </div>
            )}

            {/* SEM DADOS */}
            {!carregando && !erro && !dados && (
                <div className="relatorio-vazio">
                    <span aria-hidden="true">📊</span>
                    <h2>Nenhum dado disponível</h2>
                    <p>Aplique os filtros e clique em Filtrar para gerar o relatório.</p>
                </div>
            )}

            {/* CONTEÚDO */}
            {!carregando && !erro && dados && (
                <div className="relatorio-conteudo">
                    {dados.tipo === "individual" && renderIndicadoresIndividual()}
                    {dados.tipo === "geral"      && renderRelatorioGeral()}

                    {gerencial && <section className="relatorio-comissao-historico" aria-labelledby="titulo-atendimentos">
                        <h2 className="relatorio-secao-titulo" id="titulo-atendimentos">Atendimentos do período</h2>
                        {gerencial.agendamentos?.length ? <div className="relatorio-tabela-wrapper"><table className="relatorio-tabela relatorio-tabela-atendimentos"><thead><tr><th>Data</th><th>Hora</th><th>Cliente</th>{isAdmin && <th>Barbeiro</th>}<th>Serviço(s)</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead><tbody>{gerencial.agendamentos.map((item) => <tr key={item.id}><td>{formatarDataSemFuso(item.data)}</td><td>{item.hora}</td><td>{item.cliente}</td>{isAdmin && <td>{item.barbeiro}</td>}<td>{item.servicos.join(", ") || "—"}</td><td>{formatarMoedaExibicao(item.valor)}</td><td><span className={`relatorio-comissao-status ${item.status === "CONCLUIDO" ? "pago" : "pendente"}`}>{item.status === "CONCLUIDO" ? "Concluído" : item.status === "CONFIRMADO" ? "Confirmado" : item.status === "CANCELADO" ? "Cancelado" : "Pendente"}</span></td><td>{item.status === "CONFIRMADO" && <button type="button" className="relatorio-link-acao" disabled={concluindoId === item.id} onClick={() => marcarAtendimentoConcluido(item.id)}>{concluindoId === item.id ? "Salvando…" : "Marcar realizado"}</button>}</td></tr>)}</tbody></table></div> : <div className="relatorio-comissao-vazio"><strong>Nenhum agendamento no período</strong><span>Os atendimentos confirmados podem ser concluídos pelo barbeiro após o serviço.</span></div>}
                    </section>}

                    {gerencial && <section className="relatorio-comissoes" aria-labelledby="titulo-comissoes">
                        <div className="relatorio-comissao-cabecalho">
                            <div><h2 className="relatorio-secao-titulo" id="titulo-comissoes">Comissões</h2><p>Percentuais configurados por serviço e histórico de repasses.</p></div>
                            <div className="relatorio-comissao-totais">
                                <span>A receber <strong>{formatarMoedaExibicao(gerencial.comissoes?.pendentes || 0)}</strong></span>
                                <span>Já pago <strong>{formatarMoedaExibicao(gerencial.comissoes?.pagas || 0)}</strong></span>
                            </div>
                        </div>

                        {isAdmin && <div className="relatorio-comissao-config">
                            <div className="relatorio-comissao-config-titulo"><div><strong>Regras por serviço</strong><small>O percentual é aplicado aos serviços de novos agendamentos confirmados.</small></div>
                                <button type="button" className="relatorio-btn relatorio-btn--primario" onClick={salvarComissoes} disabled={salvandoComissoes}>{salvandoComissoes ? "Salvando…" : "Salvar percentuais"}</button>
                            </div>
                            {gerencial.servicosComissao?.length ? <div className="relatorio-comissao-servicos">{gerencial.servicosComissao.map((servico) => <label key={servico.id}><span>{servico.nome}</span><div><input type="number" min="0" max="100" step="0.5" value={servico.percentual} onChange={(event) => setGerencial((atual) => ({ ...atual, servicosComissao: atual.servicosComissao.map((item) => item.id === servico.id ? { ...item, percentual: Math.min(100, Math.max(0, Number(event.target.value || 0))) } : item) }))} /><b>%</b></div></label>)}</div> : <p className="relatorio-tabela-vazia">Nenhum serviço ativo.</p>}
                        </div>}

                        <div className="relatorio-comissao-historico">
                            <h3>Histórico de valores gerados e pagos</h3>
                        {gerencial.historicoComissoes?.length ? <div className="relatorio-tabela-wrapper"><table className="relatorio-tabela relatorio-tabela-comissao"><thead><tr>{isAdmin && <th>Barbeiro</th>}<th>Serviço</th><th>Base</th><th>%</th><th>Comissão</th><th>Gerada em</th><th>Pago em</th><th>Status</th>{isAdmin && <th>Ação</th>}</tr></thead><tbody>{gerencial.historicoComissoes.map((item) => <tr key={item.id}>{isAdmin && <td>{item.barbeiro}</td>}<td>{item.servico}</td><td>{formatarMoedaExibicao(item.valorBase)}</td><td>{item.percentual}%</td><td className="relatorio-td-destaque">{formatarMoedaExibicao(item.valor)}</td><td>{item.geradaEm ? formatarDataSemFuso(item.geradaEm) : "—"}</td><td>{item.pagaEm ? formatarDataSemFuso(item.pagaEm) : "—"}</td><td><span className={`relatorio-comissao-status ${item.status === "PAGO" ? "pago" : "pendente"}`}>{item.status === "PAGO" ? "Pago" : "Pendente"}</span></td>{isAdmin && <td>{item.status !== "PAGO" && <button type="button" className="relatorio-link-acao" disabled={acaoComissaoId === item.id} onClick={() => confirmarPagamentoComissao(item.id)}>{acaoComissaoId === item.id ? "Salvando…" : "Marcar como pago"}</button>}</td>}</tr>)}</tbody></table></div> : <div className="relatorio-comissao-vazio"><strong>Nenhuma comissão gerada neste período</strong><span>As comissões são geradas quando o atendimento é marcado como realizado.</span></div>}
                        </div>
                        {!isAdmin && <small className="relatorio-comissao-nota">Você pode consultar somente suas próprias comissões. O administrador registra os repasses pagos.</small>}
                    </section>}
                </div>
            )}
        </div>
    );
}
