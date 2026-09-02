import { useEffect, useState } from "react";

import { getResumoServicos } from "../../service/serviceServico";

export default function ServicoCards({ filtro, setFiltro }) {

    const [dados, setDados] = useState({
        total: 0,
        ativos: 0,
        inativos: 0
    });


    useEffect(() => {

        getResumoServicos()
            .then((data) => setDados(data))
            .catch((err) =>
                console.error(err)
            );

    }, []);


    const selecionarFiltro = (novoFiltro) => {

        if (filtro === novoFiltro) {

            setFiltro("todos");

        } else {

            setFiltro(novoFiltro);

        }
    };


    return (

        <div className="servicos-resumo">

            {/* TOTAL */}

            <div
                className={`servico-resumo-card ${
                    filtro === "todos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() =>
                    selecionarFiltro("todos")
                }
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        TOTAL DE SERVIÇOS
                    </span>

                    <h2>
                        {dados.total}
                    </h2>

                </div>

                <div className="resumo-card-detalhe" />

            </div>


            {/* ATIVOS */}

            <div
                className={`servico-resumo-card ${
                    filtro === "ativos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() =>
                    selecionarFiltro("ativos")
                }
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        SERVIÇOS ATIVOS
                    </span>

                    <h2>
                        {dados.ativos}
                    </h2>

                </div>

                <div className="resumo-card-detalhe" />

            </div>


            {/* INATIVOS */}

            <div
                className={`servico-resumo-card ${
                    filtro === "inativos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() =>
                    selecionarFiltro("inativos")
                }
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        SERVIÇOS INATIVOS
                    </span>

                    <h2>
                        {dados.inativos}
                    </h2>

                </div>

                <div className="resumo-card-detalhe" />

            </div>

        </div>
    );
}