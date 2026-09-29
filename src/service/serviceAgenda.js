import api from "./api";

export const criarAgendamento = async (dados) => {
    const response = await api.post("/agendar", {
        Cliente: dados.Cliente,
        Barbeiro: dados.Barbeiro,
        Servicos: dados.Servicos,
        data: dados.data,
        hora: dados.hora,
    });

    return response.data;
};


export const deletarAgendamento = async (id) => {
     const response = await api.delete(`/agendar-excluir/${id}`);
      return response.data; 
};


export const atualizarAgendamento = async (
    id,
    data,
    hora,
    servicoIds
) => {
    const response = await api.put(
        `/agendar-reagendar/${id}`,
        {
            data,
            hora,
            servicoIds
        }
    );

    return response.data;
};

export async function listarAgendamentosPorBarbeiro(barbeiroId) {
    try {
        const resposta = await api.get(
            `/barbeiro/${barbeiroId}`
        );
        return resposta.data;
    } catch (error) {
        console.error(
            "Erro ao listar agendamentos por barbeiro:",
            error
        );
        throw error;
    }
}
