import { useEffect, useState, useCallback } from "react";
import "./index.css";
import { listarBarbeiros } from "../../service/serviceBarbeiro";
import {
    buscarHorariosBloqueados,
    salvarHorariosBloqueados,
} from "../../service/serviceBarbeiro";
import { formatarDataSemFuso } from "../../utils/formatters";

// Gera todos os slots de 30 em 30 min entre 08:00 e 21:30
function gerarSlots() {
    const slots = [];
    for (let h = 8; h <= 21; h++) {
        for (let m = 0; m < 60; m += 30) {
            if (h === 21 && m > 30) break;
            slots.push(
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
            );
        }
    }
    return slots;
}

const TODOS_OS_SLOTS = gerarSlots();

export default function GerenciarHorarios() {
    const [barbeiros, setBarbeiros] = useState([]);
    const [barbeiroId, setBarbeiroId] = useState("");
    const [data, setData] = useState("");

    const [slotsBloqueados, setSlotsBloqueados] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState(null); // { tipo: "sucesso"|"erro", texto }

    // Carrega lista de barbeiros
    useEffect(() => {
        listarBarbeiros()
            .then((res) => {
                const lista = Array.isArray(res)
                    ? res
                    : res?.data || res?.barbeiros || [];
                setBarbeiros(lista.filter((b) => b.ativo !== false));
            })
            .catch(console.error);
    }, []);

    // Busca slots bloqueados quando barbeiro + data estão selecionados
    useEffect(() => {
        if (!barbeiroId || !data) {
            setSlotsBloqueados([]);
            return;
        }

        const buscar = async () => {
            try {
                setCarregando(true);
                const res = await buscarHorariosBloqueados(barbeiroId, data);
                setSlotsBloqueados(res?.slots || []);
            } catch (e) {
                console.error("Erro ao buscar horários bloqueados:", e);
                setSlotsBloqueados([]);
            } finally {
                setCarregando(false);
            }
        };

        buscar();
    }, [barbeiroId, data]);

    function toggleSlot(slot) {
        setSlotsBloqueados((prev) =>
            prev.includes(slot)
                ? prev.filter((s) => s !== slot)
                : [...prev, slot]
        );
    }

    function bloquearTodos() {
        setSlotsBloqueados([...TODOS_OS_SLOTS]);
    }

    function desbloquearTodos() {
        setSlotsBloqueados([]);
    }

    async function handleSalvar() {
        if (!barbeiroId || !data) return;

        try {
            setSalvando(true);
            setMensagem(null);
            await salvarHorariosBloqueados(barbeiroId, data, slotsBloqueados);
            setMensagem({
                tipo: "sucesso",
                texto: `Horários salvos para ${formatarDataSemFuso(data)}.`,
            });
        } catch (e) {
            console.error("Erro ao salvar:", e);
            setMensagem({
                tipo: "erro",
                texto:
                    e?.response?.data?.erro ||
                    e?.message ||
                    "Erro ao salvar horários.",
            });
        } finally {
            setSalvando(false);
        }
    }

    const nomeBarbeiro = barbeiros.find((b) => b._id === barbeiroId);
    const totalBloqueados = slotsBloqueados.length;
    const totalLivres = TODOS_OS_SLOTS.length - totalBloqueados;

    return (
        <div className="gerenciar-horarios-page">

            {/* CABEÇALHO */}
            <div className="gh-cabecalho">
                <div>
                    <span className="gh-eyebrow">ADMIN · AGENDA</span>
                    <h1>Gerenciar horários</h1>
                    <p>Bloqueie ou libere slots de um barbeiro em uma data específica.</p>
                </div>
            </div>

            {/* FILTROS */}
            <div className="gh-filtros">
                <div className="gh-campo">
                    <label htmlFor="barbeiro">BARBEIRO</label>
                    <select
                        id="barbeiro"
                        value={barbeiroId}
                        onChange={(e) => {
                            setBarbeiroId(e.target.value);
                            setMensagem(null);
                        }}
                    >
                        <option value="">Selecione um barbeiro</option>
                        {barbeiros.map((b) => (
                            <option key={b._id} value={b._id}>
                                {b.nome} {b.sobrenome || ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="gh-campo">
                    <label htmlFor="data">DATA</label>
                    <input
                        id="data"
                        type="date"
                        value={data}
                        onChange={(e) => {
                            setData(e.target.value);
                            setMensagem(null);
                        }}
                    />
                </div>
            </div>

            {/* ESTADO VAZIO */}
            {(!barbeiroId || !data) && (
                <div className="gh-vazio">
                    <span>🗓</span>
                    <p>Selecione um barbeiro e uma data para gerenciar os horários.</p>
                </div>
            )}

            {/* GRID DE SLOTS */}
            {barbeiroId && data && (
                <div className="gh-conteudo">

                    {/* BARRA DE AÇÕES */}
                    <div className="gh-acoes">
                        <div className="gh-resumo">
                            <span className="gh-badge livre">{totalLivres} livres</span>
                            <span className="gh-badge bloqueado">{totalBloqueados} bloqueados</span>
                        </div>

                        <div className="gh-botoes-acao">
                            <button
                                type="button"
                                className="gh-btn-secundario"
                                onClick={desbloquearTodos}
                                disabled={salvando}
                            >
                                Liberar todos
                            </button>
                            <button
                                type="button"
                                className="gh-btn-secundario gh-btn-bloquear"
                                onClick={bloquearTodos}
                                disabled={salvando}
                            >
                                Bloquear todos
                            </button>
                        </div>
                    </div>

                    {/* MENSAGEM */}
                    {mensagem && (
                        <div className={`gh-mensagem ${mensagem.tipo}`}>
                            {mensagem.tipo === "sucesso" ? "✓" : "!"} {mensagem.texto}
                        </div>
                    )}

                    {carregando ? (
                        <div className="gh-loading">Carregando horários...</div>
                    ) : (
                        <>
                            {/* LEGENDA */}
                            <div className="gh-legenda">
                                <span><i className="gh-dot livre" /> Livre</span>
                                <span><i className="gh-dot bloqueado" /> Bloqueado</span>
                                <p>Clique nos slots para alternar entre livre e bloqueado.</p>
                            </div>

                            {/* SLOTS */}
                            <div className="gh-slots">
                                {TODOS_OS_SLOTS.map((slot) => {
                                    const bloqueado = slotsBloqueados.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`gh-slot ${bloqueado ? "bloqueado" : "livre"}`}
                                            onClick={() => toggleSlot(slot)}
                                            disabled={salvando}
                                        >
                                            <span className="gh-slot-hora">{slot}</span>
                                            <span className="gh-slot-status">
                                                {bloqueado ? "Bloqueado" : "Livre"}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* BOTÃO SALVAR */}
                            <div className="gh-rodape">
                                <button
                                    type="button"
                                    className="gh-btn-salvar"
                                    onClick={handleSalvar}
                                    disabled={salvando}
                                >
                                    {salvando ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
