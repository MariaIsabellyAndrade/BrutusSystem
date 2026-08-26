import api from "./api";

export const criarAgendamento = (dados) => {
  const formData = new FormData();

  formData.append("Cliente", dados.Cliente);
  formData.append("Barbeiro", dados.Barbeiro);
  formData.append("Servicos", JSON.stringify(dados.Servicos));
  formData.append("data", dados.data);
  formData.append("hora", dados.hora);

  return api.post("/agendar", formData);
};