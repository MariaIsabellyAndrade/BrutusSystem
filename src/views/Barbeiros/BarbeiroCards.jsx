import { useEffect, useState } from "react";

import { getResumoBarbeiros } from "../../service/serviceBarbeiro";

export default function BarbeiroCards({ filtro, setFiltro }) {
    const [dados, setDados] = useState({
        total: 0,
        ativos: 0,
        inativos: 0
    });

    useEffect(() => {
        getResumoBarbeiros()
            .then((data) => setDados(data))
            .catch((err) => console.error(err));
    }, []);

    const selecionarFiltro = (novoFiltro) => {
        // Se clicar novamente no filtro selecionado,
        // volta a mostrar todos
        if (filtro === novoFiltro) {
            setFiltro("todos");
        } else {
            setFiltro(novoFiltro);
        }
    };

    return (
        <div className="barbeiros-resumo">

            <div
                className={`barbeiro-resumo-card ${
                    filtro === "todos" ? "selecionado" : ""
                }`}
                onClick={() => selecionarFiltro("todos")}
            >
                <div className="resumo-card-info">
                    <span className="resumo-card-label">
                        TOTAL DE BARBEIROS
                    </span>

                    <h2>{dados.total}</h2>
                </div>

                <div className="resumo-card-detalhe" />
            </div>

            <div
                className={`barbeiro-resumo-card ${
                    filtro === "ativos" ? "selecionado" : ""
                }`}
                onClick={() => selecionarFiltro("ativos")}
            >
                <div className="resumo-card-info">
                    <span className="resumo-card-label">
                        BARBEIROS ATIVOS
                    </span>

                    <h2>{dados.ativos}</h2>
                </div>

                <div className="resumo-card-detalhe" />
            </div>

            <div
                className={`barbeiro-resumo-card ${
                    filtro === "inativos" ? "selecionado" : ""
                }`}
                onClick={() => selecionarFiltro("inativos")}
            >
                <div className="resumo-card-info">
                    <span className="resumo-card-label">
                        BARBEIROS INATIVOS
                    </span>

                    <h2>{dados.inativos}</h2>
                </div>

                <div className="resumo-card-detalhe" />
            </div>

        </div>
    );
}

