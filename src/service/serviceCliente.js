import api from "./api";


export const listarClientes = () => {
  return api.get("/clientes");
};


export const criarClientes = (dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("telefone",dados.telefone); 
  formData.append("cpf",dados.cpf);
  formData.append("rg",dados.rg);
  formData.append("endereco",dados.endereco);
  formData.append("ativo",dados.ativo); 
  formData.append("email",dados.email); 
  formData.append("senha",dados.senha); 
  if (dados.foto) {
    formData.append("foto", dados.foto);
  }
  formData.append("dataNascimento",dados.dataNascimento); 

  return api.post("/clientes", formData);
};


export const atualizarClientes = (id, dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("telefone",dados.telefone); 
  formData.append("cpf",dados.cpf);
  formData.append("rg",dados.rg);
  formData.append("endereco",dados.endereco);
  formData.append("ativo",dados.ativo); 
  if (dados.foto) {
    formData.append("foto", dados.foto);
  }
  formData.append("dataNascimento",dados.dataNascimento); 
  return api.put(`/clientes/${id}`, formData);
};


export const deletarClientes = (id) => {
  return api.delete(`/clientes/${id}`);
};

export async function getResumoClientes() {
  const res = await fetch("http://localhost:3000/clientes/resumo");
  return res.json();
}