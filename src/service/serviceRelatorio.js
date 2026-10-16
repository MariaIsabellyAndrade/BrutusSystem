/**
 * BRUTUS SYSTEM – serviceRelatorio.js
 *
 * Endpoints de relatório financeiro.
 * A restrição BARBEIRO/ADMIN é aplicada no backend.
 * O frontend apenas envia o token; o servidor decide
 * quais dados retornar para cada perfil.
 */
import api from "./api";

/**
 * Busca o relatório financeiro.
 *
 * @param {Object} params
 * @param {string} [params.barbeiroId]  – somente ADMIN pode usar esse filtro
 * @param {string} [params.dataInicio]  – YYYY-MM-DD
 * @param {string} [params.dataFim]     – YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function buscarRelatorioFinanceiro({ barbeiroId, dataInicio, dataFim } = {}) {
    const params = {};

    if (barbeiroId)  params.barbeiroId  = barbeiroId;
    if (dataInicio)  params.dataInicio  = dataInicio;
    if (dataFim)     params.dataFim     = dataFim;

    const response = await api.get("/relatorio/financeiro", { params });
    return response.data;
}
