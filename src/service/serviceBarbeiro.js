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

export const getUrlFotoBarbeiro = (foto) => {
    if (!foto) {
        return "/placeholder.png";
    }

    return `${api.defaults.baseURL}/uploads/${encodeURIComponent(foto)}`;
};

export const buscarHorariosBloqueados = async (barbeiroId, data) => {
    const response = await api.get(`/barbeiros/${barbeiroId}/horarios-bloqueados`, {
        params: { data }
    });
    const dados = response.data || {};
    const motivos = Object.fromEntries(
        (dados.motivos || []).map(({ horario, motivo }) => [horario, motivo])
    );
    const slots = (dados.slots || []).map((slot) =>
        typeof slot === "string" ? slot : slot.horario
    );

    return { ...dados, slots, motivos, recorrencias: dados.recorrencias || [] };
};

export const salvarHorariosBloqueados = async (barbeiroId, data, bloqueios) => {
    const response = await api.put(`/barbeiros/${barbeiroId}/horarios-bloqueados`, {
        data,
        slots: bloqueios.map(({ horario, motivo }) => horario),
        motivos: bloqueios,
    });
    return response.data;
};

export const listarBloqueiosRecorrentes = async (barbeiroId) => {
    const response = await api.get(`/barbeiros/${barbeiroId}/bloqueios-recorrentes`);
    return response.data?.regras || [];
};

export const salvarBloqueiosRecorrentes = async (barbeiroId, regras) => {
    const response = await api.put(`/barbeiros/${barbeiroId}/bloqueios-recorrentes`, { regras });
    return response.data?.regras || [];
};

export const listarBloqueiosParaAdmin = async () => {
    const response = await api.get("/admin/horarios-bloqueados");
    return {
        bloqueios: response.data?.bloqueios || [],
        recorrencias: response.data?.recorrencias || [],
    };
};

export const listarNotificacoesHorarios = async (naoLidas = false) => {
    const response = await api.get("/admin/notificacoes/horarios", {
        params: naoLidas ? { naoLidas: true } : {},
    });
    return response.data?.notificacoes || [];
};

export const marcarNotificacaoHorarioLida = async (id) => {
    const response = await api.patch(`/admin/notificacoes/horarios/${id}/lida`);
    return response.data;
};
