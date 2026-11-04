import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, ArrowDownToLine, ArrowUpFromLine, ClipboardList, PackagePlus, Search } from "lucide-react";
import {
    atualizarProdutoEstoque,
    criarProdutoEstoque,
    inativarProdutoEstoque,
    listarMovimentacoesEstoque,
    listarProdutosEstoque,
    registrarMovimentacaoEstoque,
} from "../../service/serviceEstoque";
import { formatarMoedaExibicao } from "../../utils/formatters";
import "./index.css";

const produtoInicial = { nome: "", descricao: "", categoria: "", fornecedor: "", precoCusto: "", precoRevenda: "", quantidade: 0, estoqueMinimo: "", tipoProduto: "USO_INTERNO" };
const movimentoInicial = { produtoId: "", tipo: "ENTRADA", quantidade: "", motivo: "" };
const tipoLabel = { USO_INTERNO: "Uso interno", REVENDA: "Revenda" };

function statusEstoque(produto) {
    if (produto.quantidade === 0) return { classe: "sem-estoque", texto: "Sem estoque" };
    if (produto.quantidade <= produto.estoqueMinimo) return { classe: "baixo", texto: "Estoque baixo" };
    return { classe: "normal", texto: "Normal" };
}

function dataHora(data) {
    return data ? new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
}

function Paginacao({ pagina, totalPaginas, total, aoMudar }) {
    if (totalPaginas <= 1) return null;
    return <div className="estoque-paginacao"><span>{total} registros · Página {pagina} de {totalPaginas}</span><div><button disabled={pagina <= 1} onClick={() => aoMudar(pagina - 1)}>Anterior</button><button disabled={pagina >= totalPaginas} onClick={() => aoMudar(pagina + 1)}>Próxima</button></div></div>;
}

export default function Estoque() {
    const admin = sessionStorage.getItem("tipo") === "ADMIN";
    const [aba, setAba] = useState("produtos");
    const [produtos, setProdutos] = useState([]);
    const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [paginaProdutos, setPaginaProdutos] = useState(1);
    const [totalPaginasProdutos, setTotalPaginasProdutos] = useState(1);
    const [totalProdutos, setTotalProdutos] = useState(0);
    const [paginaMovimentacoes, setPaginaMovimentacoes] = useState(1);
    const [totalPaginasMovimentacoes, setTotalPaginasMovimentacoes] = useState(1);
    const [totalMovimentacoes, setTotalMovimentacoes] = useState(0);
    const [busca, setBusca] = useState("");
    const [categoria, setCategoria] = useState("");
    const [tipoProduto, setTipoProduto] = useState("");
    const [situacao, setSituacao] = useState("");
    const [ativo, setAtivo] = useState("");
    const [filtroTipoMovimento, setFiltroTipoMovimento] = useState("");
    const [filtroProdutoMovimento, setFiltroProdutoMovimento] = useState("");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [produtoForm, setProdutoForm] = useState(produtoInicial);
    const [produtoEditando, setProdutoEditando] = useState(null);
    const [produtoDetalhe, setProdutoDetalhe] = useState(null);
    const [movimentoForm, setMovimentoForm] = useState(movimentoInicial);
    const [modalProduto, setModalProduto] = useState(false);
    const [modalMovimento, setModalMovimento] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregarProdutos = useCallback(async () => {
        const [resposta, disponiveis] = await Promise.all([listarProdutosEstoque({
            busca: busca || undefined,
            categoria: categoria || undefined,
            tipoProduto: tipoProduto || undefined,
            situacao: situacao || undefined,
            ativo: admin ? ativo || undefined : undefined,
            page: paginaProdutos,
            limit: 100,
        }), listarProdutosEstoque({ limit: 100 })]);
        setProdutos(resposta.items || []);
        setProdutosDisponiveis(disponiveis.items || []);
        setCategorias(resposta.categorias || []);
        setTotalProdutos(resposta.total || 0);
        setTotalPaginasProdutos(resposta.totalPages || 1);
    }, [admin, busca, categoria, tipoProduto, situacao, ativo, paginaProdutos]);

    const carregarMovimentacoes = useCallback(async () => {
        if (!admin) return;
        const resposta = await listarMovimentacoesEstoque({
            produtoId: filtroProdutoMovimento || undefined,
            tipo: filtroTipoMovimento || undefined,
            dataInicio: dataInicio || undefined,
            dataFim: dataFim || undefined,
            page: paginaMovimentacoes,
            limit: 100,
        });
        setMovimentacoes(resposta.items || []);
        setTotalMovimentacoes(resposta.total || 0);
        setTotalPaginasMovimentacoes(resposta.totalPages || 1);
    }, [admin, filtroProdutoMovimento, filtroTipoMovimento, dataInicio, dataFim, paginaMovimentacoes]);

    const atualizar = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            await Promise.all([carregarProdutos(), carregarMovimentacoes()]);
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível carregar os dados do estoque.");
        } finally {
            setCarregando(false);
        }
    }, [carregarMovimentacoes, carregarProdutos]);

    useEffect(() => { atualizar(); }, [atualizar]);

    const produtosAtivos = useMemo(() => produtosDisponiveis.filter((item) => item.ativo), [produtosDisponiveis]);

    const abrirNovoProduto = () => {
        setProdutoEditando(null);
        setProdutoForm(produtoInicial);
        setErro("");
        setModalProduto(true);
    };

    const abrirEdicao = (produto) => {
        setProdutoEditando(produto);
        setProdutoForm({ nome: produto.nome, descricao: produto.descricao || "", categoria: produto.categoria, fornecedor: produto.fornecedor || "", precoCusto: produto.precoCusto, precoRevenda: produto.precoRevenda ?? "", quantidade: produto.quantidade, estoqueMinimo: produto.estoqueMinimo, tipoProduto: produto.tipoProduto });
        setErro("");
        setModalProduto(true);
    };

    const salvarProduto = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setErro("");
        try {
            const dados = { ...produtoForm };
            delete dados.quantidade;
            dados.precoRevenda = produtoForm.tipoProduto === "USO_INTERNO" && produtoForm.precoRevenda === "" ? 0 : Number(produtoForm.precoRevenda);
            if (produtoEditando) await atualizarProdutoEstoque(produtoEditando._id, dados);
            else await criarProdutoEstoque({ ...dados, quantidade: 0 });
            setModalProduto(false);
            setSucesso(produtoEditando ? "Produto atualizado." : "Produto cadastrado. Registre uma entrada para adicionar estoque.");
            await atualizar();
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível salvar o produto.");
        } finally {
            setSalvando(false);
        }
    };

    const inativar = async (produto) => {
        if (!window.confirm(`Inativar o produto “${produto.nome}”? O histórico será preservado.`)) return;
        try {
            await inativarProdutoEstoque(produto._id);
            setSucesso("Produto inativado; o histórico foi preservado.");
            await atualizar();
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível inativar o produto.");
        }
    };

    const abrirMovimentacao = (tipo = "ENTRADA", produto = null) => {
        setMovimentoForm({ ...movimentoInicial, tipo, produtoId: produto?._id || "" });
        setErro("");
        setModalMovimento(true);
    };

    const salvarMovimentacao = async (event) => {
        event.preventDefault();
        setSalvando(true);
        setErro("");
        try {
            await registrarMovimentacaoEstoque(movimentoForm.tipo, {
                produtoId: movimentoForm.produtoId,
                quantidade: Number(movimentoForm.quantidade),
                motivo: movimentoForm.motivo,
            });
            setModalMovimento(false);
            setSucesso("Movimentação registrada e estoque atualizado.");
            await atualizar();
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível registrar a movimentação.");
        } finally {
            setSalvando(false);
        }
    };

    const produtoMovimento = produtos.find((item) => item._id === movimentoForm.produtoId);
    const tipoMovimento = movimentoForm.tipo;

    return (
        <main className="estoque-page">
            <header className="estoque-header">
                <div><span className="estoque-eyebrow">BRUTUS · CONTROLE INTERNO</span><h1>Estoque</h1><p>Produtos e movimentações da barbearia, sem processamento de vendas.</p></div>
                <div className="estoque-header-actions">
                    {admin && <button className="estoque-button estoque-button--secondary" onClick={() => abrirMovimentacao("ENTRADA")}><ArrowDownToLine size={16} /> Movimentar estoque</button>}
                    {admin && <button className="estoque-button" onClick={abrirNovoProduto}><PackagePlus size={16} /> Novo produto</button>}
                    {!admin && <button className="estoque-button" onClick={() => abrirMovimentacao("SAIDA")}><ArrowUpFromLine size={16} /> Registrar saída</button>}
                </div>
            </header>

            <nav className="estoque-tabs" aria-label="Seções do estoque">
                <button className={aba === "produtos" ? "ativo" : ""} onClick={() => setAba("produtos")}><Archive size={16} /> Produtos</button>
                {admin && <button className={aba === "movimentacoes" ? "ativo" : ""} onClick={() => setAba("movimentacoes")}><ClipboardList size={16} /> Movimentações</button>}
            </nav>

            {erro && !modalProduto && !modalMovimento && <div className="estoque-alerta estoque-alerta--erro" role="alert">{erro}</div>}
            {sucesso && <div className="estoque-alerta estoque-alerta--sucesso" role="status">{sucesso}<button onClick={() => setSucesso("")} aria-label="Fechar mensagem">×</button></div>}

            {aba === "produtos" ? <>
                <section className="estoque-filtros">
                    <label className="estoque-busca"><Search size={16} /><input value={busca} onChange={(event) => { setPaginaProdutos(1); setBusca(event.target.value); }} placeholder="Buscar por produto" /></label>
                    <select value={categoria} onChange={(event) => { setPaginaProdutos(1); setCategoria(event.target.value); }}><option value="">Todas as categorias</option>{categorias.map((item) => <option key={item} value={item}>{item}</option>)}</select>
                    <select value={tipoProduto} onChange={(event) => { setPaginaProdutos(1); setTipoProduto(event.target.value); }}><option value="">Todos os tipos</option><option value="USO_INTERNO">Uso interno</option><option value="REVENDA">Revenda</option></select>
                    <select value={situacao} onChange={(event) => { setPaginaProdutos(1); setSituacao(event.target.value); }}><option value="">Todas as situações</option><option value="normal">Estoque normal</option><option value="baixo">Estoque baixo</option><option value="sem-estoque">Sem estoque</option></select>
                    {admin && <select value={ativo} onChange={(event) => { setPaginaProdutos(1); setAtivo(event.target.value); }} aria-label="Status do produto"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select>}
                </section>

                <section className="estoque-produtos">
                    {carregando ? <div className="estoque-vazio">Carregando produtos…</div> : produtos.length === 0 ? <div className="estoque-vazio">Nenhum produto encontrado com esses filtros.</div> : produtos.map((produto) => {
                        const status = statusEstoque(produto);
                        return <article className="estoque-produto" key={produto._id}>
                            <div className="estoque-produto-icon"><Archive size={20} /></div>
                            <div className="estoque-produto-info"><div className="estoque-produto-title"><h2>{produto.nome}</h2><span className={`estoque-status estoque-status--${produto.ativo ? status.classe : "inativo"}`}>{produto.ativo ? status.texto : "Inativo"}</span></div><p>{produto.categoria} · {tipoLabel[produto.tipoProduto]}</p><div className="estoque-produto-meta"><span><b>{produto.quantidade}</b> em estoque</span><span>Mínimo: {produto.estoqueMinimo}</span>{admin && <><span>Custo: {formatarMoedaExibicao(produto.precoCusto)}</span><span>Revenda: {produto.precoRevenda ? formatarMoedaExibicao(produto.precoRevenda) : "—"}</span><span>Fornecedor: {produto.fornecedor || "Não informado"}</span></>}</div></div>
                            <div className="estoque-produto-actions"><button className="estoque-link" onClick={() => setProdutoDetalhe(produto)}>Detalhes</button>{admin ? <><button className="estoque-link" onClick={() => abrirEdicao(produto)}>Editar</button>{produto.ativo ? <button className="estoque-link estoque-link--danger" onClick={() => inativar(produto)}>Inativar</button> : <span className="estoque-inativo-note">Inativado</span>}</> : <button className="estoque-link" onClick={() => abrirMovimentacao("SAIDA", produto)}>Registrar saída</button>}</div>
                        </article>;
                    })}
                </section>
                {!carregando && <Paginacao pagina={paginaProdutos} totalPaginas={totalPaginasProdutos} total={totalProdutos} aoMudar={setPaginaProdutos} />}
            </> : <>
                <section className="estoque-filtros estoque-filtros--movimento">
                    <select value={filtroProdutoMovimento} onChange={(event) => { setPaginaMovimentacoes(1); setFiltroProdutoMovimento(event.target.value); }}><option value="">Todos os produtos</option>{produtosDisponiveis.map((item) => <option key={item._id} value={item._id}>{item.nome}</option>)}</select>
                    <select value={filtroTipoMovimento} onChange={(event) => { setPaginaMovimentacoes(1); setFiltroTipoMovimento(event.target.value); }}><option value="">Todos os tipos</option><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE">Ajuste</option></select>
                    <label>De<input type="date" value={dataInicio} onChange={(event) => { setPaginaMovimentacoes(1); setDataInicio(event.target.value); }} /></label><label>Até<input type="date" value={dataFim} onChange={(event) => { setPaginaMovimentacoes(1); setDataFim(event.target.value); }} /></label>
                    <button className="estoque-button" onClick={() => abrirMovimentacao("ENTRADA")}><PackagePlus size={15} /> Nova movimentação</button>
                </section>
                <section className="estoque-tabela-wrap"><table className="estoque-tabela"><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Quantidade</th><th>Estoque antes → depois</th><th>Responsável</th><th>Motivo</th></tr></thead><tbody>{carregando ? <tr><td colSpan="7" className="estoque-tabela-vazio">Carregando movimentações…</td></tr> : movimentacoes.length === 0 ? <tr><td colSpan="7" className="estoque-tabela-vazio">Nenhuma movimentação encontrada.</td></tr> : movimentacoes.map((item) => <tr key={item._id}><td>{dataHora(item.createdAt)}</td><td>{item.produto?.nome || "Produto inativado"}</td><td><span className={`estoque-tipo estoque-tipo--${item.tipo.toLowerCase()}`}>{item.tipo}</span></td><td>{item.tipo === "SAIDA" ? "−" : item.tipo === "ENTRADA" ? "+" : "±"}{item.quantidade}</td><td>{item.estoqueAnterior} → {item.estoqueResultante}</td><td>{item.responsavel?.email || item.tipoResponsavel}</td><td>{item.motivo}</td></tr>)}</tbody></table></section>
                {!carregando && <Paginacao pagina={paginaMovimentacoes} totalPaginas={totalPaginasMovimentacoes} total={totalMovimentacoes} aoMudar={setPaginaMovimentacoes} />}
            </>}

            {modalProduto && <div className="estoque-overlay" onMouseDown={() => setModalProduto(false)}><form className="estoque-modal" onSubmit={salvarProduto} onMouseDown={(event) => event.stopPropagation()}><div className="estoque-modal-head"><div><span className="estoque-eyebrow">CADASTRO</span><h2>{produtoEditando ? "Editar produto" : "Novo produto"}</h2></div><button type="button" className="estoque-fechar" onClick={() => setModalProduto(false)}>×</button></div>{erro && <div className="estoque-alerta estoque-alerta--erro">{erro}</div>}<label>Nome<input required maxLength="120" value={produtoForm.nome} onChange={(event) => setProdutoForm({ ...produtoForm, nome: event.target.value })} /></label><label>Descrição<textarea maxLength="1000" value={produtoForm.descricao} onChange={(event) => setProdutoForm({ ...produtoForm, descricao: event.target.value })} /></label><div className="estoque-form-grid"><label>Categoria<input required maxLength="80" value={produtoForm.categoria} onChange={(event) => setProdutoForm({ ...produtoForm, categoria: event.target.value })} placeholder="Ex.: Finalizadores" /></label><label>Fornecedor<input required maxLength="120" value={produtoForm.fornecedor} onChange={(event) => setProdutoForm({ ...produtoForm, fornecedor: event.target.value })} placeholder="Nome do fornecedor" /></label><label>Tipo<select value={produtoForm.tipoProduto} onChange={(event) => setProdutoForm({ ...produtoForm, tipoProduto: event.target.value })}><option value="USO_INTERNO">Uso interno</option><option value="REVENDA">Revenda</option></select></label><label>Preço de custo (R$)<input type="number" required min="0" step="0.01" value={produtoForm.precoCusto} onChange={(event) => setProdutoForm({ ...produtoForm, precoCusto: event.target.value })} /></label><label>Preço de revenda (R$){produtoForm.tipoProduto === "REVENDA" ? " · obrigatório" : " · opcional para uso interno"}<input type="number" min={produtoForm.tipoProduto === "REVENDA" ? "0.01" : "0"} step="0.01" required={produtoForm.tipoProduto === "REVENDA"} value={produtoForm.precoRevenda} onChange={(event) => setProdutoForm({ ...produtoForm, precoRevenda: event.target.value })} /></label><label>Estoque mínimo<input type="number" required min="0" step="1" value={produtoForm.estoqueMinimo} onChange={(event) => setProdutoForm({ ...produtoForm, estoqueMinimo: event.target.value })} /></label></div>{produtoEditando && <p className="estoque-nota">Estoque atual: {produtoEditando.quantidade}. Para alterar, registre uma movimentação.</p>}{!produtoEditando && <p className="estoque-nota">O produto será cadastrado com estoque zero. Registre uma entrada para adicionar unidades.</p>}<div className="estoque-modal-actions"><button type="button" className="estoque-button estoque-button--secondary" onClick={() => setModalProduto(false)}>Cancelar</button><button disabled={salvando} className="estoque-button">{salvando ? "Salvando…" : "Salvar produto"}</button></div></form></div>}

            {modalMovimento && <div className="estoque-overlay" onMouseDown={() => setModalMovimento(false)}><form className="estoque-modal" onSubmit={salvarMovimentacao} onMouseDown={(event) => event.stopPropagation()}><div className="estoque-modal-head"><div><span className="estoque-eyebrow">MOVIMENTAÇÃO</span><h2>Registrar estoque</h2></div><button type="button" className="estoque-fechar" onClick={() => setModalMovimento(false)}>×</button></div>{erro && <div className="estoque-alerta estoque-alerta--erro">{erro}</div>}<label>Produto<select required value={movimentoForm.produtoId} onChange={(event) => setMovimentoForm({ ...movimentoForm, produtoId: event.target.value })}><option value="">Selecione um produto</option>{produtosAtivos.map((item) => <option key={item._id} value={item._id}>{item.nome} · {item.quantidade} em estoque</option>)}</select></label>{admin && <label>Operação<select value={tipoMovimento} onChange={(event) => setMovimentoForm({ ...movimentoForm, tipo: event.target.value, quantidade: "" })}><option value="ENTRADA">Entrada</option><option value="SAIDA">Saída</option><option value="AJUSTE">Ajuste de estoque</option></select></label>}<p className="estoque-nota">Estoque atual: <strong>{produtoMovimento?.quantidade ?? "Selecione um produto"}</strong>{tipoMovimento === "AJUSTE" && " · A quantidade informada será o novo total físico."}</p><label>{tipoMovimento === "AJUSTE" ? "Quantidade física contada" : "Quantidade"}<input type="number" required min={tipoMovimento === "AJUSTE" ? "0" : "1"} step="1" value={movimentoForm.quantidade} onChange={(event) => setMovimentoForm({ ...movimentoForm, quantidade: event.target.value })} /></label><label>Motivo<input required minLength="5" maxLength="500" value={movimentoForm.motivo} onChange={(event) => setMovimentoForm({ ...movimentoForm, motivo: event.target.value })} placeholder="Ex.: Compra de reposição" /></label><div className="estoque-modal-actions"><button type="button" className="estoque-button estoque-button--secondary" onClick={() => setModalMovimento(false)}>Cancelar</button><button disabled={salvando} className="estoque-button">{salvando ? "Salvando…" : "Confirmar movimentação"}</button></div></form></div>}

            {produtoDetalhe && <div className="estoque-overlay" onMouseDown={() => setProdutoDetalhe(null)}><section className="estoque-modal" onMouseDown={(event) => event.stopPropagation()}><div className="estoque-modal-head"><div><span className="estoque-eyebrow">DETALHES DO PRODUTO</span><h2>{produtoDetalhe.nome}</h2></div><button type="button" className="estoque-fechar" onClick={() => setProdutoDetalhe(null)}>×</button></div><div className="estoque-detalhes"><p><span>Descrição</span><b>{produtoDetalhe.descricao || "Sem descrição"}</b></p><p><span>Categoria</span><b>{produtoDetalhe.categoria}</b></p><p><span>Tipo</span><b>{tipoLabel[produtoDetalhe.tipoProduto]}</b></p>{admin && <p><span>Fornecedor</span><b>{produtoDetalhe.fornecedor || "Não informado"}</b></p>}<p><span>Quantidade atual</span><b>{produtoDetalhe.quantidade}</b></p><p><span>Estoque mínimo</span><b>{produtoDetalhe.estoqueMinimo}</b></p>{admin && <><p><span>Preço de custo</span><b>{formatarMoedaExibicao(produtoDetalhe.precoCusto)}</b></p><p><span>Preço de revenda</span><b>{produtoDetalhe.precoRevenda ? formatarMoedaExibicao(produtoDetalhe.precoRevenda) : "Não definido"}</b></p></>}<p><span>Situação</span><b>{produtoDetalhe.ativo ? `Ativo · ${statusEstoque(produtoDetalhe).texto}` : "Inativo"}</b></p><p><span>Cadastrado em</span><b>{dataHora(produtoDetalhe.createdAt)}</b></p><p><span>Atualizado em</span><b>{dataHora(produtoDetalhe.updatedAt)}</b></p></div></section></div>}
        </main>
    );
}
