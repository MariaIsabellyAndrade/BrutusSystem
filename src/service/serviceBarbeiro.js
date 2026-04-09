import api from "./api";


export const listarBarbeiros = () => {
  return api.get("/barbeiros");
};


export const criarBarbeiros = (dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("dataNascimento",dados.dataNascimento); 
  formData.append("dataAdmissao",dados.dataAdmissao); 
  formData.append("email",dados.email); 
  formData.append("senha",dados.senha); 
  formData.append("cnpj",dados.cnpj); 
  formData.append("endereco",dados.endereco); 
  formData.append("ativo",dados.ativo); 
  formData.append("telefone",dados.telefone); 
    if (dados.foto) {
        formData.append("foto", dados.foto);
    }

  return api.post("/barbeiros", formData);
};


export const atualizarBarbeiros = (id, dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("dataNascimento",dados.dataNascimento); 
  formData.append("dataAdmissao",dados.dataAdmissao); 
  formData.append("email",dados.email); 
  formData.append("senha",dados.senha); 
  formData.append("cnpj",dados.cnpj); 
  formData.append("endereco",dados.endereco); 
  formData.append("ativo",dados.ativo); 
  formData.append("telefone",dados.telefone); 
    if (dados.foto) {
        formData.append("foto", dados.foto);
    }

  return api.put(`/barbeiros/${id}`, formData);
};


export const deletarBarbeiros = (id) => {
  return api.delete(`/barbeiros/${id}`);
};

export async function getResumoBarbeiros() {
  const res = await fetch("http://localhost:3000/barbeiros/resumo");
  return res.json();
}