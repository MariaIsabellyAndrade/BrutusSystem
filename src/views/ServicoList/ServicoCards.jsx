import { useEffect, useState } from "react";
import { getResumoServicos } from "../../service/serviceServico";
import "../../components/Cards.css";
export default function ServicoCards() {
  const [dados, setDados] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  useEffect(() => {
    getResumoServicos()
      .then(data => setDados(data))
      .catch(err => console.error(err));
  }, []);
return (
  <div className="main">
    <h1 className="titulo">Servicos</h1>

    <div className="cards">
      <div className="card total">
        <p>Total de serviços</p>
        <h2>{dados.total}</h2>
      </div>

      <div className="card ativos">
        <p>Ativos</p>
        <h2>{dados.ativos}</h2>
      </div>

      <div className="card inativos">
        <p>Inativos</p>
        <h2>{dados.inativos}</h2>
      </div>
    </div>
  </div>
);
}