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