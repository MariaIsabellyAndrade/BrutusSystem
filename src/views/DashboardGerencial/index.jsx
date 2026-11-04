import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CircleDollarSign, Clock3, Scissors, Users, Download, Printer } from "lucide-react";
import { buscarDadosGerenciais } from "../../service/serviceRelatorio";
import { listarBarbeiros } from "../../service/serviceBarbeiro";
import { buscarResumoEstoque } from "../../service/serviceEstoque";
import { formatarMoedaExibicao } from "../../utils/formatters";
import "./index.css";

const hoje = new Date();
const dataHoje = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const inicioDoMes = dataHoje(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

function baixarCsv(dados) {
    const rows = [
        ["Indicador", "Valor"],
        ["Faturamento realizado no período", dados.indicadores.faturamentoRealizado],
        ["Pagamentos recebidos (sinais)", dados.indicadores.pagamentosRecebidos],
        ["Agendamentos", dados.indicadores.agendamentos],
        ["Confirmados", dados.indicadores.confirmados],
        ["Pendentes", dados.indicadores.pendentes],
        ["Cancelados", dados.indicadores.cancelados],
        [],
        ["Mês", "Faturamento confirmado", "Agendamentos"],
        ...dados.comparativoMensal.map((item) => [item.mes, item.faturamento, item.agendamentos]),
        [],
        ["Serviço", "Atendimentos confirmados", "Faturamento"],
        ...dados.servicosMaisRealizados.map((item) => [item.nome, item.quantidade, item.faturamento]),
        [],
        ["Próximos agendamentos"],
        ["Data", "Hora", "Cliente", "Barbeiro", "Status", "Valor"],
        ...dados.proximosAgendamentos.map((item) => [dataHoje(new Date(item.data)), item.hora, item.cliente, item.barbeiro, item.status, item.valor]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard-gerencial.csv";
    link.click();
    URL.revokeObjectURL(url);
}

function GraficoMensal({ dados = [] }) {
    const max = Math.max(...dados.map((item) => item.faturamento), 1);
    return (
        <div className="gerencial-chart" aria-label="Comparativo de faturamento dos últimos seis meses">
            {dados.map((item) => (
                <div className="gerencial-chart-col" key={item.mes} title={`${item.rotulo}: ${formatarMoedaExibicao(item.faturamento)}`}>
                    <span>{formatarMoedaExibicao(item.faturamento)}</span>
                    <div className="gerencial-chart-track"><i style={{ height: `${Math.max(4, item.faturamento / max * 100)}%` }} /></div>
                    <small>{item.rotulo}</small>
                </div>
            ))}
            {!dados.length && <p className="gerencial-muted">Sem dados para comparar.</p>}
        </div>
    );
}

export default function DashboardGerencial() {
    const tipo = (sessionStorage.getItem("tipo") || "").trim().toUpperCase();
    const admin = tipo === "ADMIN";
    const [barbeiros, setBarbeiros] = useState([]);
    const [barbeiroId, setBarbeiroId] = useState("");
    const [dataInicio, setDataInicio] = useState(inicioDoMes);
    const [dataFim, setDataFim] = useState(dataHoje(hoje));
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [resumoEstoque, setResumoEstoque] = useState(null);

    useEffect(() => {
        if (!admin) return;
        listarBarbeiros().then((res) => {
            const list = Array.isArray(res) ? res : res?.data || [];
            setBarbeiros(list.filter((item) => item.ativo));
        }).catch(() => setBarbeiros([]));
    }, [admin]);

    useEffect(() => {
        if (!admin) return;
        buscarResumoEstoque().then(setResumoEstoque).catch(() => setResumoEstoque(null));
    }, [admin]);

    const buscar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            setDados(await buscarDadosGerenciais({
                ...(admin && barbeiroId ? { barbeiroId } : {}),
                dataInicio: dataInicio || undefined,
                dataFim: dataFim || undefined,
            }));
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível carregar o painel gerencial.");
        } finally {
            setCarregando(false);
        }
    }, [admin, barbeiroId, dataInicio, dataFim]);

    useEffect(() => { buscar(); }, [buscar]);

    const indicadores = dados?.indicadores;
    const taxa = indicadores?.taxaCancelamento ?? 0;

    return (
        <main className="gerencial-page">
            <header className="gerencial-header">
                <div><span className="gerencial-eyebrow">BRUTUS · GESTÃO</span><h1>Painel gerencial</h1><p>{admin ? "Acompanhe o desempenho da barbearia em um só lugar." : "Acompanhe seus atendimentos e resultados."}</p></div>
                <div className="gerencial-actions">
                    {dados && <button type="button" className="gerencial-action" onClick={() => baixarCsv(dados)}><Download size={16} /> Exportar CSV</button>}
                    {dados && <button type="button" className="gerencial-action" onClick={() => window.print()}><Printer size={16} /> Salvar PDF</button>}
                </div>
            </header>

            <section className="gerencial-filters" aria-label="Filtros do painel">
                {admin && <label>Barbeiro<select value={barbeiroId} onChange={(event) => setBarbeiroId(event.target.value)}><option value="">Toda a barbearia</option>{barbeiros.map((item) => <option key={item._id} value={item._id}>{item.nome} {item.sobrenome}</option>)}</select></label>}
                <label>De<input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} max={dataFim || undefined} /></label>
                <label>Até<input type="date" value={dataFim} onChange={(event) => setDataFim(event.target.value)} min={dataInicio || undefined} /></label>
                <button type="button" onClick={buscar} disabled={carregando}>{carregando ? "Atualizando…" : "Atualizar painel"}</button>
            </section>

            {erro && <div className="gerencial-error" role="alert">{erro}</div>}
            {carregando && <div className="gerencial-loading">Carregando indicadores…</div>}
            {!carregando && dados && <>
                <section className="gerencial-kpis">
                    <article className="gerencial-kpi gerencial-kpi--accent"><span><CircleDollarSign size={18} /> Faturamento realizado</span><strong>{formatarMoedaExibicao(indicadores.faturamentoRealizado)}</strong><small>Atendimentos concluídos no período</small></article>
                    <article className="gerencial-kpi"><span><CircleDollarSign size={18} /> Sinais recebidos</span><strong>{formatarMoedaExibicao(indicadores.pagamentosRecebidos)}</strong><small>Pagamentos aprovados registrados</small></article>
                    <article className="gerencial-kpi"><span><CalendarDays size={18} /> Agendamentos</span><strong>{indicadores.agendamentos}</strong><small>{indicadores.concluidos} realizados · {indicadores.confirmados} confirmados · {indicadores.pendentes} pendentes</small></article>
                    <article className="gerencial-kpi"><span><Clock3 size={18} /> Cancelamentos</span><strong>{taxa}%</strong><small>{indicadores.cancelados} no período selecionado</small></article>
                </section>

                {admin && resumoEstoque && <section className="gerencial-stock-summary"><div className="gerencial-panel-heading"><div><span className="gerencial-eyebrow">CONTROLE INTERNO</span><h2>Estoque</h2></div><Link to="/estoque">Abrir estoque</Link></div><div className="gerencial-stock-kpis"><div><span>Produtos ativos</span><strong>{resumoEstoque.produtosAtivos}</strong></div><div className={resumoEstoque.estoqueBaixo ? "alerta" : ""}><span>Estoque baixo</span><strong>{resumoEstoque.estoqueBaixo}</strong></div><div className={resumoEstoque.semEstoque ? "alerta" : ""}><span>Sem estoque</span><strong>{resumoEstoque.semEstoque}</strong></div></div>{resumoEstoque.movimentacoesRecentes?.length > 0 && <div className="gerencial-stock-recent"><h3>Movimentações recentes</h3>{resumoEstoque.movimentacoesRecentes.slice(0, 4).map((item) => <div key={item._id}><span className={`gerencial-stock-type gerencial-stock-type--${item.tipo.toLowerCase()}`}>{item.tipo}</span><b>{item.produto?.nome || "Produto inativado"}</b><span>{item.quantidade} un.</span><small>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</small></div>)}</div>}</section>}

                <section className="gerencial-grid gerencial-grid--wide">
                    <article className="gerencial-panel"><div className="gerencial-panel-heading"><div><span className="gerencial-eyebrow">TENDÊNCIA</span><h2>Faturamento por mês</h2></div><small>Últimos 6 meses</small></div><GraficoMensal dados={dados.comparativoMensal} /></article>
                    <article className="gerencial-panel"><div className="gerencial-panel-heading"><div><span className="gerencial-eyebrow">AGENDA</span><h2>Próximos horários</h2></div><span className="gerencial-panel-count">{dados.proximosAgendamentos.length}</span></div>
                        {dados.proximosAgendamentos.length ? <div className="gerencial-upcoming">{dados.proximosAgendamentos.map((item) => { const itemDate = new Date(`${String(item.data).split("T")[0]}T12:00:00`); return <div className="gerencial-upcoming-row" key={item.id}><div className="gerencial-date-pill"><b>{itemDate.getDate()}</b><small>{itemDate.toLocaleDateString("pt-BR", { month: "short" })}</small></div><div className="gerencial-upcoming-main"><b>{item.hora} · {item.cliente || "Cliente"}</b><small>{admin ? `${item.barbeiro} · ` : ""}{formatarMoedaExibicao(item.valor)}</small></div><span className={`gerencial-status gerencial-status--${item.status.toLowerCase()}`}>{item.status === "PENDENTE" ? "Pendente" : "Confirmado"}</span></div>; })}</div> : <p className="gerencial-muted">Nenhum agendamento futuro neste período.</p>}
                    </article>
                </section>

                <section className="gerencial-grid">
                    <article className="gerencial-panel"><div className="gerencial-panel-heading"><div><span className="gerencial-eyebrow">DESTAQUES</span><h2>Serviços mais realizados</h2></div><Scissors size={18} /></div>
                        {dados.servicosMaisRealizados.length ? <div className="gerencial-ranking">{dados.servicosMaisRealizados.slice(0, 6).map((item, index) => <div className="gerencial-ranking-row" key={item.servicoId}><span className="gerencial-rank-num">{String(index + 1).padStart(2, "0")}</span><b>{item.nome}</b><small>{item.quantidade} realizados</small><strong>{formatarMoedaExibicao(item.faturamento)}</strong></div>)}</div> : <p className="gerencial-muted">Ainda não há serviços concluídos no período.</p>}
                    </article>
                    {admin && <article className="gerencial-panel"><div className="gerencial-panel-heading"><div><span className="gerencial-eyebrow">EQUIPE</span><h2>Atendimentos por barbeiro</h2></div><Users size={18} /></div>
                        {dados.atendimentosPorBarbeiro.length ? <div className="gerencial-ranking">{dados.atendimentosPorBarbeiro.slice(0, 6).map((item, index) => <div className="gerencial-ranking-row" key={item.barbeiroId}><span className="gerencial-rank-num">{String(index + 1).padStart(2, "0")}</span><b>{item.nome}</b><small>{item.atendimentos} realizados</small><strong>{formatarMoedaExibicao(item.faturamento)}</strong></div>)}</div> : <p className="gerencial-muted">Ainda não há atendimentos concluídos no período.</p>}
                    </article>}
                </section>
                {!admin && <p className="gerencial-scope-note">Este painel mostra somente os seus próprios resultados.</p>}
            </>}
        </main>
    );
}
