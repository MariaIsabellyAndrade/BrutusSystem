import { useEffect, useState } from "react";

import { getResumoClientes } from "../../service/serviceCliente";

export default function ClienteCards({ filtro, setFiltro }) {

    const [dados, setDados] = useState({
        total: 0,
        ativos: 0,
        inativos: 0
    });


    useEffect(() => {

        getResumoClientes()
            .then((data) => setDados(data))
            .catch((err) => console.error(err));

    }, []);


    const selecionarFiltro = (novoFiltro) => {

        if (filtro === novoFiltro) {
            setFiltro("todos");
        } else {
            setFiltro(novoFiltro);
        }

    };


    return (

        <div className="clientes-resumo">

            {/* TOTAL */}

            <div
                className={`cliente-resumo-card ${
                    filtro === "todos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() => selecionarFiltro("todos")}
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        TOTAL DE CLIENTES
                    </span>

                    <h2>
                        {dados.total}
                    </h2>

                </div>

                <div className="resumo-card-detalhe" />

            </div>


            {/* ATIVOS */}

            <div
                className={`cliente-resumo-card ${
                    filtro === "ativos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() => selecionarFiltro("ativos")}
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        CLIENTES ATIVOS
                    </span>

                    <h2>
                        {dados.ativos}
                    </h2>

                </div>

                <div className="resumo-card-detalhe" />

            </div>


            {/* INATIVOS */}

            <div
                className={`cliente-resumo-card ${
                    filtro === "inativos"
                        ? "selecionado"
                        : ""
                }`}
                onClick={() => selecionarFiltro("inativos")}
            >

                <div className="resumo-card-info">

                    <span className="resumo-card-label">
                        CLIENTES INATIVOS
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