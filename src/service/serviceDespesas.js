import api from "./api";

export async function listarDespesas(params = {}) { return (await api.get("/despesas", { params })).data; }
export async function buscarResumoDespesas(params = {}) { return (await api.get("/despesas/resumo", { params })).data; }
export async function listarCategoriasDespesas() { return (await api.get("/despesas/categorias")).data; }
export async function criarDespesa(dados) { return (await api.post("/despesas", dados)).data; }
export async function atualizarDespesa(id, dados) { return (await api.put(`/despesas/${id}`, dados)).data; }
export async function interromperRecorrenciaDespesa(id) { return (await api.patch(`/despesas/${id}/recorrencia/interromper`)).data; }
export async function excluirDespesa(id) { return (await api.delete(`/despesas/${id}`)).data; }
export async function criarCategoriaDespesa(dados) { return (await api.post("/despesas/categorias", dados)).data; }
export async function atualizarCategoriaDespesa(id, dados) { return (await api.put(`/despesas/categorias/${id}`, dados)).data; }
export async function excluirCategoriaDespesa(id) { return (await api.delete(`/despesas/categorias/${id}`)).data; }
