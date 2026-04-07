import { useState } from "react";
import "./CadastroBrutus.css";

export default function CadastroBrutus() {
 const [form, setForm] = useState({
  nome: "",
  sobrenome: "",
  dataNascimento: "",
  dataAdmissao: "",
  email: "",
  senha: "",
  cnpj: "",
  endereco: "",
  ativo: true,
  telefone: "",
  foto: null
});

const [errors, setErrors] = useState({});

const validate = () => {
  let newErrors = {};

  if (!form.nome) newErrors.nome = "Obrigatório";
  if (!form.sobrenome) newErrors.sobrenome = "Obrigatório";
  if (!form.email) newErrors.email = "Obrigatório";
  if (!form.senha) newErrors.senha = "Obrigatório";
  if (!form.telefone) newErrors.telefone = "Obrigatório";
  if (!form.endereco) newErrors.endereco = "Obrigatório";
  if (!form.cnpj) newErrors.cnpj = "Obrigatório";
  if (!form.dataNascimento) newErrors.dataNascimento = "Obrigatório";
  if (!form.dataAdmissao) newErrors.dataAdmissao = "Obrigatório";

  // 📅 idade mínima
  if (form.dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(form.dataNascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    if (idade < 16) {
      newErrors.dataNascimento = "Mínimo 16 anos";
    }
  }

  // 📅 admissão
  if (form.dataAdmissao) {
    const hoje = new Date();
    const admissao = new Date(form.dataAdmissao);

    if (admissao > hoje) {
      newErrors.dataAdmissao = "Não pode ser futura";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const [preview, setPreview] = useState(null);

  // 🔥 máscara telefone
  const formatTelefone = (value) => {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value.slice(0, 15);
  };

  // 🔥 máscara CNPJ
  const formatCNPJ = (value) => {
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{2})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    return value.slice(0, 18);
  };

const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  // remove erro quando começa a digitar
  setErrors((prev) => ({
    ...prev,
    [name]: ""
  }));

  if (type === "checkbox") {
    setForm({ ...form, [name]: checked });
    return;
  }

  if (name === "telefone") {
    return setForm({ ...form, telefone: formatTelefone(value) });
  }

  if (name === "cnpj") {
    return setForm({ ...form, cnpj: formatCNPJ(value) });
  }

  if (name === "foto") {
    const file = files[0];
    setForm({ ...form, foto: file });
    setPreview(URL.createObjectURL(file));
    return;
  }

  setForm({ ...form, [name]: value });
};
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  const formData = new FormData();

  Object.keys(form).forEach((key) => {
    formData.append(key, form[key]);
  });

  try {
    const res = await fetch("http://localhost:3000/barbeiros", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    // 💣 se deu erro
 if (!res.ok) {
  setErrors((prev) => ({
    ...prev,
    cnpj: data.error || data.message || "Erro ao cadastrar"
  }));
}
else 
     alert("Cadastrado com sucesso 🚀");

  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="container">

      {/* FUNDO DIREITO */}
      <div className="right-bg"></div>

      {/* FORM ESQUERDA */}
      <div className="left-form">

        <h1>BRUTUS</h1>
        <p>Sistema de Barbearia 💈</p>

       <form onSubmit={handleSubmit}>

  <input name="nome" placeholder="Nome"   onChange={handleChange} className={errors.nome ? "input errorInput" : "input"} />

  <input name="sobrenome" placeholder="Sobrenome" onChange={handleChange}  className={errors.nome ? "input errorInput" : "input"} />

  <input type="date" name="dataNascimento" onChange={handleChange}  className={errors.nome ? "input errorInput" : "input"} />

  <input type="date" name="dataAdmissao" onChange={handleChange} className={errors.nome ? "input errorInput" : "input"}/>

  <input name="email" placeholder="Email" onChange={handleChange}  className={errors.nome ? "input errorInput" : "input"} />

  <input type="password" name="senha" placeholder="Senha" onChange={handleChange} className={errors.nome ? "input errorInput" : "input"}/>
    <input
    name="cnpj"
    value={form.cnpj}
    onChange={handleChange}
    className={errors.cnpj ? "input errorInput" : "input"}
    />

{errors.cnpj && <span className="error">{errors.cnpj}</span>}

  <input name="endereco" placeholder="Endereço" onChange={handleChange} className={errors.nome ? "input errorInput" : "input"}/>

  <input
    name="telefone"
    placeholder="Telefone"
    value={form.telefone}
    onChange={handleChange}
    className={errors.nome ? "input errorInput" : "input"}
  />



  {/* FOTO LADO A LADO */}
  <div className="upload-container">
    <input type="file" name="foto" onChange={handleChange} />

    {preview && (
      <img src={preview} className="preview" />
    )}
  </div>

  <button>Cadastrar</button>

</form>
      </div>

      {/* TEXTO DIREITA */}
      <div className="right-content">
        <h2>BRUTUS</h2>
        <p>Estilo • Precisão • Atitude 💈</p>
      </div>

    </div>
  );
}