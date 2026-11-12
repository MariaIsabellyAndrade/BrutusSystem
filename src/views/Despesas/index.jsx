import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, Download, Plus, Search, Tags, Trash2, TrendingDown } from "lucide-react";
import {
    atualizarCategoriaDespesa, atualizarDespesa, buscarResumoDespesas, criarCategoriaDespesa,
    criarDespesa, excluirCategoriaDespesa, excluirDespesa, interromperRecorrenciaDespesa, listarCategoriasDespesas, listarDespesas,
} from "../../service/serviceDespesas";
import { formatarMoedaExibicao } from "../../utils/formatters";
import { buscarRelatorioFinanceiro } from "../../service/serviceRelatorio";
import "./index.css";

const inicial = { descricao: "", categoria: "", valor: "", dataDespesa: new Date().toISOString().slice(0, 10), dataVencimento: "", dataPagamento: "", formaPagamento: "PIX", status: "PENDENTE", tipo: "VARIAVEL", recorrencia: "UNICA", recorrenciaInicio: "", recorrenciaFim: "", fornecedor: "", observacoes: "" };
const formaLabel = { DINHEIRO: "Dinheiro", PIX: "PIX", DEBITO: "Cartão de débito", CREDITO: "Cartão de crédito", BOLETO: "Boleto", TRANSFERENCIA: "Transferência", OUTROS: "Outros" };
const statusLabel = { PENDENTE: "Pendente", PAGO: "Pago", VENCIDO: "Vencido", CANCELADO: "Cancelado" };
const dataCurta = (valor) => valor ? new Date(`${String(valor).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR") : "—";

function exportarCSV(items) {
    const linhas = [["Descrição", "Categoria", "Valor", "Data", "Vencimento", "Pagamento", "Forma", "Status", "Tipo", "Fornecedor", "Registrado por"], ...items.map((x) => [x.descricao, x.categoria?.nome || "", x.valor, dataCurta(x.dataDespesa), dataCurta(x.dataVencimento), dataCurta(x.dataPagamento), formaLabel[x.formaPagamento] || x.formaPagamento, statusLabel[x.status] || x.status, x.tipo, x.fornecedor, [x.barbeiroRegistrador?.nome, x.barbeiroRegistrador?.sobrenome].filter(Boolean).join(" ") || x.registradoPor?.email || "Admin"])];
    const csv = linhas.map((linha) => linha.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" })); link.download = "despesas-brutus.csv"; link.click(); URL.revokeObjectURL(link.href);
}
async function exportarTodasAsDespesas(filtros) {
    const params = Object.fromEntries(Object.entries({ ...filtros, pagina: 1, limite: 100 }).filter(([, v]) => v !== ""));
    const primeira = await listarDespesas(params);
    const items = [...(primeira.items || [])];
    for (let pagina = 2; pagina <= (primeira.totalPaginas || 1); pagina += 1) {
        const resposta = await listarDespesas({ ...params, pagina });
        items.push(...(resposta.items || []));
    }
    exportarCSV(items);
}

export default function Despesas() {
    const admin = sessionStorage.getItem("tipo")?.toUpperCase() === "ADMIN";
    const [categorias, setCategorias] = useState([]);
    const [items, setItems] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [form, setForm] = useState(inicial);
    const [comprovanteArquivo, setComprovanteArquivo] = useState(null);
    const [editando, setEditando] = useState(null);
    const [categoriaNome, setCategoriaNome] = useState("");
    const [aba, setAba] = useState("despesas");
    const [filtros, setFiltros] = useState({ busca: "", status: "", categoria: "", tipo: "", formaPagamento: "", dataInicio: "", dataFim: "", pagina: 1, limite: 20 });
    const [paginacao, setPaginacao] = useState({ total: 0, totalPaginas: 1, pagina: 1 });
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");

    const paramsRelatorio = useMemo(() => {
        const hoje = new Date();
        const hojeLocal = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
        const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
        return { dataInicio: filtros.dataInicio || inicioMes, dataFim: filtros.dataFim || hojeLocal };
    }, [filtros.dataInicio, filtros.dataFim]);
    const carregarCategorias = useCallback(async () => { try { setCategorias(await listarCategoriasDespesas()); } catch { setErro("Não foi possível carregar as categorias."); } }, []);
    const carregar = useCallback(async () => {
        if (!admin) return;
        setCarregando(true);
        try {
            const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ""));
            const [lista, indicadores, financeiroExistente] = await Promise.all([listarDespesas(params), buscarResumoDespesas(paramsRelatorio), buscarRelatorioFinanceiro(paramsRelatorio)]);
            const dadosReceita = financeiroExistente.tipo === "geral" ? financeiroExistente.indicadoresGlobais : financeiroExistente.indicadores;
            setItems(lista.items || []); setPaginacao(lista); setResumo({ ...indicadores, fluxoCaixa: { ...indicadores.fluxoCaixa, receitas: dadosReceita?.financeiro?.receitaRecebida || 0 } });
        } catch (err) { setErro(err.response?.data?.erro || "Não foi possível carregar as despesas."); }
        finally { setCarregando(false); }
    }, [admin, filtros, paramsRelatorio]);

    useEffect(() => { carregarCategorias(); }, [carregarCategorias]);
    useEffect(() => { carregar(); }, [carregar]);
    useEffect(() => { if (!form.categoria && categorias.length) setForm((atual) => ({ ...atual, categoria: categorias.find((c) => c.ativa)?._id || "" })); }, [categorias, form.categoria]);

    function atualizarCampo(campo, valor) { setForm((atual) => ({ ...atual, [campo]: valor })); }
    function novoCadastro() { setEditando(null); setForm({ ...inicial, categoria: categorias.find((c) => c.ativa)?._id || "" }); setComprovanteArquivo(null); setErro(""); setAviso(""); }
    async function salvar(event) {
        event.preventDefault(); setErro(""); setAviso(""); setSalvando(true);
        try {
            const dados = { ...form, valor: Number(form.valor), ...(form.status === "PAGO" && !form.dataPagamento ? { dataPagamento: new Date().toISOString().slice(0, 10) } : {}) };
            const payload = comprovanteArquivo ? Object.entries({ ...dados, comprovante: undefined }).reduce((fd, [chave, valor]) => { if (valor !== undefined && valor !== null) fd.append(chave, String(valor)); return fd; }, Object.assign(new FormData(), { })) : dados;
            if (comprovanteArquivo) payload.append("comprovante", comprovanteArquivo);
            if (editando) await atualizarDespesa(editando, payload); else await criarDespesa(payload);
            setAviso(editando ? "Despesa atualizada." : "Despesa registrada."); novoCadastro(); await carregar();
        } catch (err) { setErro(err.response?.data?.erro || "Não foi possível salvar a despesa."); }
        finally { setSalvando(false); }
    }
    function editar(item) {
        setEditando(item._id); setComprovanteArquivo(null); setForm({ ...inicial, ...item, categoria: item.categoria?._id || "", valor: String(item.valor), dataDespesa: String(item.dataDespesa || "").slice(0, 10), dataVencimento: String(item.dataVencimento || "").slice(0, 10), dataPagamento: String(item.dataPagamento || "").slice(0, 10), recorrencia: item.recorrencia || "UNICA" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
    async function remover(item) { if (!window.confirm(`Excluir a despesa “${item.descricao}”?`)) return; try { await excluirDespesa(item._id); setAviso("Despesa excluída."); await carregar(); } catch (err) { setErro(err.response?.data?.erro || "Não foi possível excluir a despesa."); } }
    async function interromper(item) { if (!window.confirm(`Interromper a recorrência de “${item.descricao}” e cancelar os próximos lançamentos pendentes?`)) return; try { await interromperRecorrenciaDespesa(item._id); setAviso("Recorrência interrompida."); await carregar(); } catch (err) { setErro(err.response?.data?.erro || "Não foi possível interromper a recorrência."); } }
    async function salvarCategoria(event) { event.preventDefault(); try { await criarCategoriaDespesa({ nome: categoriaNome }); setCategoriaNome(""); setAviso("Categoria cadastrada."); await carregarCategorias(); } catch (err) { setErro(err.response?.data?.erro || "Não foi possível cadastrar a categoria."); } }
    async function alternarCategoria(categoria) { try { await atualizarCategoriaDespesa(categoria._id, { ativa: !categoria.ativa }); await carregarCategorias(); } catch (err) { setErro(err.response?.data?.erro || "Não foi possível atualizar a categoria."); } }
    async function removerCategoria(categoria) { if (!window.confirm(`Excluir a categoria “${categoria.nome}”?`)) return; try { await excluirCategoriaDespesa(categoria._id); await carregarCategorias(); } catch (err) { setErro(err.response?.data?.erro || "Categoria vinculada a despesas não pode ser excluída; você pode desativá-la."); } }

    return <main className="despesas-page">
        <header className="despesas-header"><div><span className="despesas-eyebrow">GESTÃO FINANCEIRA</span><h1>{admin ? "Despesas da barbearia" : "Registrar despesa"}</h1><p>{admin ? "Acompanhe custos, contas a pagar e movimentações da equipe." : "Registre uma despesa para análise do administrador."}</p></div>{admin && <button className="despesas-button secundario no-print" onClick={() => window.print()}><Download size={16}/> Exportar PDF</button>}</header>
        {erro && <div className="despesas-feedback erro" role="alert">{erro}<button onClick={() => setErro("")}>×</button></div>}{aviso && <div className="despesas-feedback sucesso" role="status">{aviso}<button onClick={() => setAviso("")}>×</button></div>}

        {admin && resumo && <section className="despesas-kpis" aria-label="Indicadores de despesas">
            <article><span><TrendingDown size={17}/> Total no período</span><strong>{formatarMoedaExibicao(resumo.indicadores?.total || 0)}</strong><small>Não inclui despesas canceladas</small></article>
            <article><span><Banknote size={17}/> Pagas</span><strong>{formatarMoedaExibicao(resumo.indicadores?.pagas || 0)}</strong><small>{resumo.porStatus?.find(x => x._id === "PAGO")?.quantidade || 0} lançamentos</small></article>
            <article><span><CalendarDays size={17}/> A pagar</span><strong>{formatarMoedaExibicao((resumo.indicadores?.pendentes || 0) + (resumo.indicadores?.vencidas || 0))}</strong><small>{formatarMoedaExibicao(resumo.indicadores?.vencidas || 0)} vencidas</small></article>
            <article><span>Saldo de caixa</span><strong>{formatarMoedaExibicao((resumo.fluxoCaixa?.receitas || 0) - (resumo.fluxoCaixa?.pago || 0))}</strong><small>Recebido menos despesas pagas</small></article>
            <article><span>Despesas fixas</span><strong>{formatarMoedaExibicao(resumo.indicadores?.fixas || 0)}</strong><small>Fixas no período</small></article>
            <article><span>Média mensal</span><strong>{formatarMoedaExibicao((resumo.porMes || []).length ? resumo.porMes.reduce((total, item) => total + item.total, 0) / resumo.porMes.length : 0)}</strong><small>Com base nos meses com lançamentos</small></article>
        </section>}

        <section className="despesas-panel">
            <div className="despesas-section-heading"><div><h2>{editando ? "Editar despesa" : "Novo lançamento"}</h2><p>Campos marcados com * são obrigatórios.</p></div>{editando && <button className="despesas-button secundario" onClick={novoCadastro}>Cancelar edição</button>}</div>
            <form className="despesas-form" onSubmit={salvar}>
                <label className="campo-largo">Descrição *<input maxLength="160" required value={form.descricao} onChange={(e) => atualizarCampo("descricao", e.target.value)} placeholder="Ex.: Compra de produtos" /></label>
                <label>Categoria *<select required value={form.categoria} onChange={(e) => atualizarCampo("categoria", e.target.value)}><option value="">Selecione</option>{categorias.filter((c) => c.ativa).map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}</select></label>
                <label>Valor (R$) *<input required type="number" min="0.01" step="0.01" value={form.valor} onChange={(e) => atualizarCampo("valor", e.target.value)} placeholder="0,00" /></label>
                <label>Data da despesa *<input required type="date" value={form.dataDespesa} onChange={(e) => atualizarCampo("dataDespesa", e.target.value)} /></label>
                <label>Vencimento<input type="date" value={form.dataVencimento} onChange={(e) => atualizarCampo("dataVencimento", e.target.value)} /></label>
                {admin && <label>Status<select value={form.status} onChange={(e) => atualizarCampo("status", e.target.value)}>{Object.entries(statusLabel).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>}
                {admin && form.status === "PAGO" && <label>Data do pagamento<input type="date" value={form.dataPagamento} onChange={(e) => atualizarCampo("dataPagamento", e.target.value)} /></label>}
                <label>Forma de pagamento<select value={form.formaPagamento} onChange={(e) => atualizarCampo("formaPagamento", e.target.value)}>{Object.entries(formaLabel).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
                <label>Tipo<select value={form.tipo} onChange={(e) => atualizarCampo("tipo", e.target.value)}><option value="VARIAVEL">Variável</option><option value="FIXA">Fixa</option></select></label>
                {admin && <label>Recorrência<select value={form.recorrencia} onChange={(e) => atualizarCampo("recorrencia", e.target.value)}><option value="UNICA">Única</option><option value="SEMANAL">Semanal</option><option value="MENSAL">Mensal</option><option value="ANUAL">Anual</option></select></label>}
                {admin && form.recorrencia !== "UNICA" && <><label>Início da recorrência<input type="date" value={form.recorrenciaInicio} onChange={(e) => atualizarCampo("recorrenciaInicio", e.target.value)} /></label><label>Fim da recorrência<input type="date" value={form.recorrenciaFim} onChange={(e) => atualizarCampo("recorrenciaFim", e.target.value)} /></label></>}
                <label>Fornecedor<input maxLength="160" value={form.fornecedor} onChange={(e) => atualizarCampo("fornecedor", e.target.value)} placeholder="Nome do fornecedor" /></label>
                <label>Comprovante<input type="file" accept="image/*,.pdf" onChange={(e) => setComprovanteArquivo(e.target.files?.[0] || null)} />{form.comprovante && <small>Comprovante já anexado</small>}</label>
                <label className="campo-largo">Observações<textarea maxLength="2000" rows="3" value={form.observacoes} onChange={(e) => atualizarCampo("observacoes", e.target.value)} /></label>
                <div className="despesas-form-acoes campo-largo"><button className="despesas-button" disabled={salvando}><Plus size={16}/>{salvando ? "Salvando…" : editando ? "Salvar alterações" : "Registrar despesa"}</button></div>
            </form>
        </section>

        {admin && <>
            <nav className="despesas-tabs no-print"><button className={aba === "despesas" ? "ativo" : ""} onClick={() => setAba("despesas")}>Despesas <span>{paginacao.total}</span></button><button className={aba === "categorias" ? "ativo" : ""} onClick={() => setAba("categorias")}><Tags size={15}/> Categorias</button><button onClick={() => exportarTodasAsDespesas(filtros).catch((err) => setErro(err.response?.data?.erro || "Não foi possível exportar as despesas."))}><Download size={15}/> Exportar CSV</button></nav>
            {aba === "despesas" ? <>
                <section className="despesas-panel despesas-filtros"><label className="busca"><Search size={17}/><input placeholder="Buscar descrição ou fornecedor" value={filtros.busca} onChange={(e) => setFiltros({ ...filtros, busca: e.target.value, pagina: 1 })}/></label><label>Status<select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value, pagina: 1 })}><option value="">Todos</option>{Object.entries(statusLabel).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label><label>Categoria<select value={filtros.categoria} onChange={(e)=>setFiltros({...filtros,categoria:e.target.value,pagina:1})}><option value="">Todas</option>{categorias.map(c=><option key={c._id} value={c._id}>{c.nome}</option>)}</select></label><label>Tipo<select value={filtros.tipo} onChange={(e)=>setFiltros({...filtros,tipo:e.target.value,pagina:1})}><option value="">Todos</option><option value="FIXA">Fixa</option><option value="VARIAVEL">Variável</option></select></label><label>Forma<select value={filtros.formaPagamento} onChange={(e)=>setFiltros({...filtros,formaPagamento:e.target.value,pagina:1})}><option value="">Todas</option>{Object.entries(formaLabel).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label><label>De<input type="date" value={filtros.dataInicio} onChange={(e)=>setFiltros({...filtros,dataInicio:e.target.value,pagina:1})}/></label><label>Até<input type="date" value={filtros.dataFim} onChange={(e)=>setFiltros({...filtros,dataFim:e.target.value,pagina:1})}/></label></section>
                <section className="despesas-panel"><div className="despesas-section-heading"><div><h2>Lançamentos</h2><p>{paginacao.total} despesas encontradas</p></div></div><div className="despesas-tabela-wrap"><table className="despesas-tabela"><thead><tr><th>Despesa</th><th>Categoria</th><th>Data / vencimento</th><th>Valor</th><th>Status</th><th>Registrado por</th><th className="no-print">Ações</th></tr></thead><tbody>{carregando ? <tr><td colSpan="7">Carregando despesas…</td></tr> : items.length ? items.map((item) => <tr key={item._id}><td><strong>{item.descricao}</strong><small>{item.fornecedor || formaLabel[item.formaPagamento]}</small></td><td>{item.categoria?.nome || "—"}</td><td>{dataCurta(item.dataDespesa)}<small>Vence {dataCurta(item.dataVencimento)}</small></td><td className="valor">{formatarMoedaExibicao(item.valor)}</td><td><span className={`despesas-status ${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span></td><td>{[item.barbeiroRegistrador?.nome, item.barbeiroRegistrador?.sobrenome].filter(Boolean).join(" ") || item.registradoPor?.email || "Administrador"}<small>{item.registradoPorTipo === "BARBEIRO" ? "Barbeiro" : "Admin"}</small></td><td className="acoes no-print"><button onClick={()=>editar(item)}>Editar</button><button aria-label={`Excluir ${item.descricao}`} onClick={()=>remover(item)}><Trash2 size={15}/></button></td></tr>) : <tr><td colSpan="7" className="despesas-vazio">Nenhuma despesa neste período.</td></tr>}</tbody></table></div><div className="despesas-paginacao"><span>Página {paginacao.pagina || 1} de {paginacao.totalPaginas || 1}</span><div><button disabled={(paginacao.pagina || 1) <= 1} onClick={()=>setFiltros({...filtros,pagina:filtros.pagina-1})}>Anterior</button><button disabled={(paginacao.pagina || 1) >= (paginacao.totalPaginas || 1)} onClick={()=>setFiltros({...filtros,pagina:filtros.pagina+1})}>Próxima</button></div></div></section>
                {resumo && <section className="despesas-graficos"><article className="despesas-panel"><h2>Gastos por categoria</h2>{resumo.porCategoria?.length ? resumo.porCategoria.map((x)=><div className="barra-categoria" key={x._id}><span>{x._id || "Sem categoria"}</span><b>{formatarMoedaExibicao(x.total)}</b><i><em style={{width:`${Math.max(3, Math.min(100, (x.total / Math.max(...resumo.porCategoria.map(y=>y.total),1))*100))}%`}}/></i></div>) : <p>Sem despesas no período selecionado.</p>}</article><article className="despesas-panel"><h2>Fluxo de caixa realizado</h2><p>Receitas recebidas <strong>{formatarMoedaExibicao(resumo.fluxoCaixa?.receitas || 0)}</strong></p><p>Despesas pagas <strong>{formatarMoedaExibicao(resumo.fluxoCaixa?.pago || 0)}</strong></p><div className="saldo-final">Saldo realizado <strong>{formatarMoedaExibicao((resumo.fluxoCaixa?.receitas || 0) - (resumo.fluxoCaixa?.pago || 0))}</strong></div><small>Contas pendentes: {formatarMoedaExibicao(resumo.fluxoCaixa?.previsto || 0)} · não abatidas do saldo realizado</small></article><article className="despesas-panel despesas-meses"><h2>Evolução mensal das despesas</h2>{resumo.porMes?.length ? resumo.porMes.map((x)=><div className="barra-categoria" key={x._id}><span>{new Date(`${x._id}-02T12:00:00`).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</span><b>{formatarMoedaExibicao(x.total)}</b><i><em style={{width:`${Math.max(3, Math.min(100, (x.total / Math.max(...resumo.porMes.map(y=>y.total),1))*100))}%`}}/></i></div>) : <p>Sem despesas registradas no período.</p>}</article></section>}
            </> : <section className="despesas-panel"><div className="despesas-section-heading"><div><h2>Categorias</h2><p>Desative para ocultar dos novos lançamentos e preservar o histórico.</p></div></div><form className="categoria-form" onSubmit={salvarCategoria}><input value={categoriaNome} onChange={(e)=>setCategoriaNome(e.target.value)} placeholder="Nome da categoria" required maxLength="80"/><button className="despesas-button"><Plus size={16}/> Nova categoria</button></form><div className="categorias-lista">{categorias.map(c=><div key={c._id}><span><b>{c.nome}</b>{c.padrao&&<small>Padrão</small>}</span><span>{c.ativa?"Ativa":"Inativa"}</span><button onClick={()=>alternarCategoria(c)}>{c.ativa?"Desativar":"Ativar"}</button>{!c.padrao&&<button className="perigo" onClick={()=>removerCategoria(c)} aria-label={`Excluir ${c.nome}`}><Trash2 size={15}/></button>}</div>)}</div></section>}
        </>}
    </main>;
}
