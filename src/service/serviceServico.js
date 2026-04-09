import api from "./api";

export const listarServicos = () => {
  return api.get("/servicos");
};


export const criarServico = (dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("descricao", dados.descricao);
  formData.append("valor",dados.valor); 
  formData.append("ativo",dados.ativo); 
  formData.append("duracao",dados.duracao); 
    if (dados.foto) {
        formData.append("foto", dados.foto);
    }

  return api.post("/servicos", formData);
};


export const atualizarServico = (id, dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("descricao", dados.descricao);
  formData.append("valor",dados.valor); 
  formData.append("ativo",dados.ativo); 
  formData.append("duracao",dados.duracao); 
  if (dados.foto) {
    formData.append("foto", dados.foto);
  }

  return api.put(`/servicos/${id}`, formData);
};


export const deletarServico = (id) => {
  return api.delete(`/servicos/${id}`);
};

export async function getResumoServicos() {
  const res = await fetch("http://localhost:3000/servicos/resumo");
  return res.json();
}