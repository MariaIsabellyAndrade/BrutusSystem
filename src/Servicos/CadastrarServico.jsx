import { useState } from "react";
import "./CadastrarServico.css";


export default function CadastroServico() {
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    valor: "",
    ativo: true,
    duracao: "",
    foto: null
  });


  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value, type, checked, files } = e.target;

  setErrors((prev) => ({
    ...prev,
    [name]: ""
  }));

  if (type === "checkbox") {
    setForm({ ...form, [name]: checked });
    return;
  }

  if (name === "foto") {
    const file = files[0];
    setForm({ ...form, foto: file });
    setPreview(URL.createObjectURL(file));
    return;
  }

  if (name === "valor") {
    // remove tudo que não for número
    let numeros = value.replace(/\D/g, "");

    // transforma em decimal (centavos)
    let valorFormatado = (Number(numeros) / 100).toFixed(2);

    // evita "NaN" quando vazio
    if (numeros === "") {
      valorFormatado = "";
    }

    setForm({ ...form, valor: valorFormatado });
    return;
  }

  setForm({ ...form, [name]: value });
};

 const validate = () => {
  let newErrors = {};

  if (!form.nome) newErrors.nome = "Obrigatório";
  if (!form.descricao) newErrors.descricao = "Obrigatório";
  if (!form.valor) newErrors.valor = "Obrigatório";

  // 🔒 valida preço negativo
  if (form.valor && Number(form.valor) < 0) {
    newErrors.valor = "O valor não pode ser negativo";
  }

  if (!form.duracao) newErrors.duracao = "Obrigatório";
  if (!form.foto) newErrors.foto = "Foto obrigatória";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    try {
      const res = await fetch("http://localhost:3000/servicos", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao cadastrar");
        return;
      }

      if (!form.valor) {
  newErrors.valor = "Obrigatório";
}

if (Number(form.valor) < 0) {
  newErrors.valor = "Não pode ser negativo";
}

      setForm({
        nome: "",
        descricao: "",
        valor: "",
        ativo: true,
        duracao: "",
        foto: null
      });
      

      setPreview(null);
  
    } catch (err) {
      console.error(err);
      alert("Erro na requisição");
    }
    
  };

  return (
    <div className="container">

      <div className="left-form">
        <h1>Cadastrar Serviço</h1>

        <form onSubmit={handleSubmit}>

          <input
            className={`input ${errors.valor ? "errorInput" : ""}`}
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
          />
      

          <textarea
             className={`input ${errors.valor ? "errorInput" : ""}`}
            name="descricao"
            placeholder="Descrição"
            value={form.descricao}
            onChange={handleChange}
          />
         

          <input
            className={`input ${errors.valor ? "errorInput" : ""}`}
            name="valor"
            type="text"
            inputMode="numeric"
            placeholder="Valor (ex: 50,00)"
            value={form.valor}
            onChange={handleChange}
          />
         

          <input
           className={`input ${errors.valor ? "errorInput" : ""}`}
            name="duracao"
            placeholder="Duração (min)"
            value={form.duracao}
            onChange={handleChange}
          />
          {errors.duracao && <span className="error">{errors.duracao}</span>}

          <label>
            <input
              type="checkbox"
              name="ativo"
              checked={form.ativo}
              onChange={handleChange}
            />
            Ativo
          </label>

          <div className="upload-container">
            <input
              type="file"
              name="foto"
              onChange={handleChange}
            />
          </div>

         
          {preview && (
            <img src={preview} alt="preview" className="preview" />
          )}

          <button type="submit">Cadastrar</button>

        </form>
      </div>

      <div className="right-bg"></div>

      <div className="right-content">
        <h2>Barber Shop</h2>
        <p>Gerencie seus serviços com estilo</p>
      </div>

    </div>
  );
}