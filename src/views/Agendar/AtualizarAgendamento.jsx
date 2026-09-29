import { useEffect, useState } from "react";
import "./atualizar.css";
import { listarServicos } from "../../service/serviceServico";
import { formatarMoedaExibicao } from "../../utils/formatters";

export default function AtualizarAgendamento({
    agendamento,
    onFechar,
    onSalvar
}) {
    const [servicos, setServicos] = useState([]);

    const [form, setForm] = useState({
        data: "",
        hora: "",
        servicoIds: []
    });

    useEffect(() => {
        async function carregarServicos() {
            try {
                const response = await listarServicos();
                setServicos(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar serviços:", error);
            }
        }
        carregarServicos();
    }, []);

    useEffect(() => {
        if (!agendamento) return;

        const servicosAtuais = agendamento.Servicos || [];
        const idsServicos = servicosAtuais
            .map((item) => item.Servico?._id)
            .filter(Boolean);

        setForm({
            data: agendamento.data ? agendamento.data.split("T")[0] : "",
            hora: agendamento.hora || "",
            servicoIds: idsServicos
        });
    }, [agendamento]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    function handleServicoChange(servicoId) {
        setForm((prev) => {
            const jaSelecionado = prev.servicoIds.includes(servicoId);
            if (jaSelecionado) {
                return {
                    ...prev,
                    servicoIds: prev.servicoIds.filter((id) => id !== servicoId)
                };
            }
            return {
                ...prev,
                servicoIds: [...prev.servicoIds, servicoId]
            };
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (form.servicoIds.length === 0) {
            alert("Selecione pelo menos um serviço.");
            return;
        }

        if (onSalvar) {
            onSalvar({
                id: agendamento._id,
                data: form.data,
                hora: form.hora,
                servicoIds: form.servicoIds
            });
        }
    }

    if (!agendamento) return null;

    const barbeiro = agendamento.Barbeiro
        ? `${agendamento.Barbeiro.nome || ""} ${agendamento.Barbeiro.sobrenome || ""}`.trim()
        : "";

    return (
        <div className="modal-overlay" onClick={onFechar}>
            <div className="modal-agendamento" onClick={(e) => e.stopPropagation()}>
                {/* CABEÇALHO */}
                <div className="modal-header">
                    <div>
                        <span className="modal-subtitulo">MEU AGENDAMENTO</span>
                        <h2>Editar agendamento</h2>
                    </div>

                    <button type="button" className="btn-fechar" onClick={onFechar}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* DADOS */}
                    <div className="dados-agendamento">
                        {/* SERVIÇOS */}
                        <div className="campo campo-servicos">
                            <label>Serviços</label>
                            <div className="servicos-lista">
                                {servicos.length === 0 ? (
                                    <p className="sem-servicos">Nenhum serviço disponível.</p>
                                ) : (
                                    servicos.map((servico) => {
                                        const selecionado = form.servicoIds.includes(servico._id);
                                        return (
                                            <button
                                                type="button"
                                                key={servico._id}
                                                className={
                                                    selecionado
                                                        ? "servico-opcao selecionado"
                                                        : "servico-opcao"
                                                }
                                                onClick={() => handleServicoChange(servico._id)}
                                            >
                                                <span className="servico-checkbox">
                                                    {selecionado ? "✓" : ""}
                                                </span>
                                                <span className="servico-nome">{servico.nome}</span>
                                                <span className="servico-valor">
                                                    {formatarMoedaExibicao(servico.valor || 0)}
                                                </span>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* BARBEIRO */}
                        <div className="campo">
                            <label>Barbeiro</label>
                            <input type="text" value={barbeiro} disabled />
                        </div>

                        {/* DATA */}
                        <div className="campo">
                            <label>Data</label>
                            <input
                                type="date"
                                name="data"
                                value={form.data}
                                onChange={handleChange}
                            />
                        </div>

                        {/* HORÁRIO */}
                        <div className="campo">
                            <label>Horário</label>
                            <input
                                type="time"
                                name="hora"
                                value={form.hora}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* RESUMO DOS SERVIÇOS */}
                    <div className="servicos-selecionados">
                        <span>
                            {form.servicoIds.length}{" "}
                            {form.servicoIds.length === 1
                                ? "serviço selecionado"
                                : "serviços selecionados"}
                        </span>
                    </div>

                    {/* BOTÕES */}
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={onFechar}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-salvar">
                            Salvar alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
