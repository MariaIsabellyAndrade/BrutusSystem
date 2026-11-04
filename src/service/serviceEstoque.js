import api from "./api";

export async function listarProdutosEstoque(params = {}) {
    const response = await api.get("/produtos", { params });
    return response.data;
}

export async function buscarProdutoEstoque(id) {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
}

export async function criarProdutoEstoque(dados) {
    const response = await api.post("/produtos", dados);
    return response.data;
}

export async function atualizarProdutoEstoque(id, dados) {
    const response = await api.put(`/produtos/${id}`, dados);
    return response.data;
}

export async function inativarProdutoEstoque(id) {
    const response = await api.patch(`/produtos/${id}/inativar`);
    return response.data;
}

export async function listarMovimentacoesEstoque(params = {}) {
    const response = await api.get("/movimentacoes-estoque", { params });
    return response.data;
}

export async function registrarMovimentacaoEstoque(tipo, dados) {
    const endpoint = { ENTRADA: "entrada", SAIDA: "saida", AJUSTE: "ajuste" }[tipo];
    if (!endpoint) throw new Error("Tipo de movimentação inválido.");
    const response = await api.post(`/movimentacoes-estoque/${endpoint}`, dados);
    return response.data;
}

export async function buscarResumoEstoque() {
    const response = await api.get("/estoque/resumo");
    return response.data;
}
