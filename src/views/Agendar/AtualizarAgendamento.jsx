import { useEffect, useState } from "react";
import "./atualizar.css";
import { listarServicos } from "../../service/serviceServico";
import { buscarHorariosDisponiveis } from "../../service/serviceAgenda";
import { formatarMoedaExibicao } from "../../utils/formatters";

export default function AtualizarAgendamento({
    agendamento,
    onFechar,
    onSalvar
}) {
    const [servicos, setServicos] = useState([]);
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [carregandoHorarios, setCarregandoHorarios] = useState(false);

    const [form, setForm] = useState({
        data: "",
        hora: "",
        servicoIds: []
    });

    useEffect(() => {
        async function carregarServicos() {
            try {
                const response = await listarServicos();
                const lista = Array.isArray(response)
                    ? response
                    : response?.data || response?.servicos || [];
                setServicos(lista.filter((s) => s.ativo !== false));
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

    // Busca horários disponíveis sempre que data ou serviços mudam
    useEffect(() => {
        if (!form.data || form.servicoIds.length === 0 || !agendamento) return;

        const barbeiroId =
            agendamento?.Barbeiro?._id ||
            (typeof agendamento?.Barbeiro === "string" ? agendamento.Barbeiro : null);

        if (!barbeiroId) return;

        const buscar = async () => {
            try {
                setCarregandoHorarios(true);
                const lista = await buscarHorariosDisponiveis(
                    barbeiroId,
                    form.data,
                    form.servicoIds
                );
                // Inclui o horário atual do agendamento na lista, pois o backend
                // pode tratá-lo como ocupado pelo próprio agendamento
                const horarioAtual = agendamento.hora;
                const listaComAtual =
                    horarioAtual && !lista.includes(horarioAtual)
                        ? [horarioAtual, ...lista].sort()
                        : lista;
                setHorariosDisponiveis(listaComAtual);
            } catch (error) {
                console.error("Erro ao buscar horários:", error);
                setHorariosDisponiveis([]);
            } finally {
                setCarregandoHorarios(false);
            }
        };

        buscar();
    }, [form.data, form.servicoIds]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            // Limpa a hora quando a data muda
            ...(name === "data" ? { hora: "" } : {})
        }));
    }

    function handleServicoChange(servicoId) {
        setForm((prev) => {
            const jaSelecionado = prev.servicoIds.includes(servicoId);
            const novosIds = jaSelecionado
                ? prev.servicoIds.filter((id) => id !== servicoId)
                : [...prev.servicoIds, servicoId];
            // Limpa hora ao mudar serviços pois a duração muda
            return { ...prev, servicoIds: novosIds, hora: "" };
        });
    }

    function handleSubmit(e) {
        e.preventDefault();

        if (form.servicoIds.length === 0) {
            alert("Selecione pelo menos um serviço.");
            return;
        }

        if (!form.hora) {
            alert("Selecione um horário.");
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
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        {/* HORÁRIO — usa horários disponíveis da API */}
                        <div className="campo">
                            <label>Horário</label>
                            {!form.data || form.servicoIds.length === 0 ? (
                                <p className="sem-servicos">
                                    Selecione a data e os serviços para ver os horários disponíveis.
                                </p>
                            ) : carregandoHorarios ? (
                                <p className="sem-servicos">Buscando horários disponíveis...</p>
                            ) : horariosDisponiveis.length === 0 ? (
                                <p className="sem-servicos">
                                    Nenhum horário disponível para esta data.
                                </p>
                            ) : (
                                <select
                                    name="hora"
                                    value={form.hora}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione um horário</option>
                                    {horariosDisponiveis.map((h) => (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                            )}
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
