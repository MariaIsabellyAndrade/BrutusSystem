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

export async function buscarDadosGerenciais({ barbeiroId, dataInicio, dataFim } = {}) {
    const response = await api.get("/relatorio/gerencial", {
        params: { barbeiroId, dataInicio, dataFim },
    });
    return response.data;
}

export async function atualizarPercentualComissao(servicoId, percentual) {
    const response = await api.patch(`/relatorio/comissoes/servicos/${servicoId}`, { percentual });
    return response.data;
}

export async function marcarComissaoPaga(comissaoId) {
    const response = await api.patch(`/relatorio/comissoes/${comissaoId}/paga`);
    return response.data;
}

export async function concluirAtendimento(agendamentoId) {
    const response = await api.patch(`/agendamentos/${agendamentoId}/concluir`);
    return response.data;
}
