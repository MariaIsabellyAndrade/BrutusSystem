import api from "./api";

// 🔥 LOGIN
export const login = (dados) => {
  return api.post("/login", {
    email: dados.email,
    senha: dados.senha,
  });
};


export const registrarCliente = (dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("dataNascimento", dados.dataNascimento);
  formData.append("email", dados.email);
  formData.append("senha", dados.senha);
  formData.append("cpf", dados.cpf);
  formData.append("rg", dados.rg);
  formData.append("endereco", dados.endereco);
  formData.append("ativo", dados.ativo);
  formData.append("telefone", dados.telefone);

  if (dados.foto) {
    formData.append("foto", dados.foto);
  }

  return api.post("/registrar-cliente", formData);
};

// 🔥 REGISTRAR BARBEIRO (ADMIN)
export const registrarBarbeiro = (dados) => {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("sobrenome", dados.sobrenome);
  formData.append("dataNascimento", dados.dataNascimento);
  formData.append("dataAdmissao", dados.dataAdmissao);
  formData.append("email", dados.email);
  formData.append("senha", dados.senha);
  formData.append("cnpj", dados.cnpj);
  formData.append("endereco", dados.endereco);
  formData.append("ativo", dados.ativo);
  formData.append("telefone", dados.telefone);

  if (dados.foto) {
    formData.append("foto", dados.foto);
  }

  return api.post("/registrar-barbeiro", formData);
};