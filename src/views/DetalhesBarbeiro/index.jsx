import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarBarbeiros,getUrlFotoBarbeiro } from "../../service/serviceBarbeiro";
import "./index.css";

export default function DetalhesBarbeiro() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [barbeiro, setBarbeiro] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarBarbeiro = async () => {
            try {
                const response = await listarBarbeiros();

                const lista = response.data;

                const encontrado = lista.find(
                    (b) => b._id === id
                );

                setBarbeiro(encontrado);
            } catch (error) {
                console.error(
                    "Erro ao carregar barbeiro:",
                    error
                );
            } finally {
                setCarregando(false);
            }
        };

        carregarBarbeiro();
    }, [id]);

    if (carregando) {
        return (
            <div className="detalhes-barbeiro-page">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!barbeiro) {
        return (
            <div className="detalhes-barbeiro-page">
                <h2>Barbeiro não encontrado</h2>

                <button onClick={() => navigate(-1)}>
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="detalhes-barbeiro-page">

            <button
                className="detalhes-voltar"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button>

            <div className="detalhes-barbeiro-card">

                <div className="detalhes-barbeiro-foto-area">
<img
    src={getUrlFotoBarbeiro(barbeiro.foto)}
    alt={`${barbeiro.nome} ${barbeiro.sobrenome}`}
    className="detalhes-barbeiro-foto"
    onError={(e) => {
        console.log("❌ ERRO NA FOTO:", e.currentTarget.src);
    }}
/>
                </div>

                <div className="detalhes-barbeiro-info">

                    <span className="detalhes-eyebrow">
                        EQUIPE BRUTUS
                    </span>

                    <h1>
                        {barbeiro.nome} {barbeiro.sobrenome}
                    </h1>

                    <span
                        className={`detalhes-status ${
                            barbeiro.ativo
                                ? "ativo"
                                : "inativo"
                        }`}
                    >
                        ●{" "}
                        {barbeiro.ativo
                            ? "Ativo"
                            : "Inativo"}
                    </span>

                    <div className="detalhes-informacoes">

                        <div>
                            <small>EMAIL</small>
                            <p>{barbeiro.email || "-"}</p>
                        </div>

                        <div>
                            <small>TELEFONE</small>
                            <p>{barbeiro.telefone || "-"}</p>
                        </div>

                        <div>
                            <small>CNPJ</small>
                            <p>{barbeiro.cnpj || "-"}</p>
                        </div>

                        <div>
                            <small>ENDEREÇO</small>
                            <p>{barbeiro.endereco || "-"}</p>
                        </div>

                        <div>
                            <small>DATA DE NASCIMENTO</small>
                            <p>
                                {barbeiro.dataNascimento
                                    ? new Date(
                                        barbeiro.dataNascimento
                                    ).toLocaleDateString("pt-BR")
                                    : "-"}
                            </p>
                        </div>

                        <div>
                            <small>DATA DE ADMISSÃO</small>
                            <p>
                                {barbeiro.dataAdmissao
                                    ? new Date(
                                        barbeiro.dataAdmissao
                                    ).toLocaleDateString("pt-BR")
                                    : "-"}
                            </p>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}