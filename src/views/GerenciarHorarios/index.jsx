import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./index.css";
import {
    buscarHorariosBloqueados,
    salvarHorariosBloqueados,
    listarBloqueiosRecorrentes,
    salvarBloqueiosRecorrentes,
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
const DIAS_SEMANA = [
    { valor: 1, label: "Seg" },
    { valor: 2, label: "Ter" },
    { valor: 3, label: "Qua" },
    { valor: 4, label: "Qui" },
    { valor: 5, label: "Sex" },
    { valor: 6, label: "Sáb" },
    { valor: 0, label: "Dom" },
];

function descreverDias(dias = []) {
    return DIAS_SEMANA.filter((dia) => dias.includes(dia.valor)).map((dia) => dia.label).join(", ");
}

export default function GerenciarHorarios() {
    const barbeiroId = sessionStorage.getItem("entidadeId") || "";
    const [data, setData] = useState("");

    const [slotsBloqueados, setSlotsBloqueados] = useState([]);
    const [slotsRecorrentes, setSlotsRecorrentes] = useState([]);
    const [motivos, setMotivos] = useState({});
    const [slotEmEdicao, setSlotEmEdicao] = useState(null);
    const [motivoNovo, setMotivoNovo] = useState("");
    const [regrasRecorrentes, setRegrasRecorrentes] = useState([]);
    const [salvandoRecorrencia, setSalvandoRecorrencia] = useState(false);
    const [formRecorrencia, setFormRecorrencia] = useState({
        diasSemana: [],
        horaInicio: "08:00",
        horaFim: "12:00",
        dataInicio: "",
        dataFim: "",
        motivo: "",
    });
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState(null); // { tipo: "sucesso"|"erro", texto }

    useEffect(() => {
        if (!barbeiroId) return;
        listarBloqueiosRecorrentes(barbeiroId)
            .then(setRegrasRecorrentes)
            .catch((error) => {
                console.error("Erro ao buscar regras recorrentes:", error);
                setMensagem({ tipo: "erro", texto: "Não foi possível carregar seus bloqueios recorrentes." });
            });
    }, [barbeiroId]);

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
                const recorrentes = new Set((res?.recorrencias || []).flatMap((regra) =>
                    TODOS_OS_SLOTS.filter((slot) => {
                        const inicioSlot = Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3, 5));
                        const inicioRegra = Number(regra.horaInicio.slice(0, 2)) * 60 + Number(regra.horaInicio.slice(3, 5));
                        const fimRegra = Number(regra.horaFim.slice(0, 2)) * 60 + Number(regra.horaFim.slice(3, 5));
                        return inicioSlot < fimRegra && inicioSlot + 30 > inicioRegra;
                    })
                ));
                setSlotsRecorrentes([...recorrentes]);
                setSlotsBloqueados((res?.slots || []).filter((slot) => !recorrentes.has(slot)));
                setMotivos(res?.motivos || {});
            } catch (e) {
                console.error("Erro ao buscar horários bloqueados:", e);
                setSlotsBloqueados([]);
                setSlotsRecorrentes([]);
                setMotivos({});
            } finally {
                setCarregando(false);
            }
        };

        buscar();
    }, [barbeiroId, data]);

    function toggleSlot(slot) {
        if (slotsRecorrentes.includes(slot)) return;
        if (slotsBloqueados.includes(slot)) {
            setSlotsBloqueados((prev) => prev.filter((s) => s !== slot));
            setMotivos((prev) => {
                const atualizados = { ...prev };
                delete atualizados[slot];
                return atualizados;
            });
            return;
        }

        setSlotEmEdicao(slot);
        setMotivoNovo("");
    }

    function bloquearTodos() {
        setSlotEmEdicao("TODOS");
        setMotivoNovo("");
    }

    function desbloquearTodos() {
        setSlotsBloqueados([]);
        setMotivos((atuais) => Object.fromEntries(
            Object.entries(atuais).filter(([slot]) => slotsRecorrentes.includes(slot))
        ));
    }

    function confirmarBloqueio() {
        const motivo = motivoNovo.trim();
        if (!motivo) return;

        const slots = (slotEmEdicao === "TODOS" ? TODOS_OS_SLOTS : [slotEmEdicao])
            .filter((slot) => !slotsRecorrentes.includes(slot));
        setSlotsBloqueados((prev) => [...new Set([...prev, ...slots])]);
        setMotivos((prev) => Object.fromEntries([
            ...Object.entries(prev).filter(([slot]) => !slots.includes(slot)),
            ...slots.map((slot) => [slot, motivo]),
        ]));
        setSlotEmEdicao(null);
        setMotivoNovo("");
    }

    async function handleSalvar() {
        if (!barbeiroId || !data) return;

        try {
            setSalvando(true);
            setMensagem(null);
            await salvarHorariosBloqueados(
                barbeiroId,
                data,
                slotsBloqueados.map((horario) => ({ horario, motivo: motivos[horario] || "" }))
            );
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

    function alternarDiaRecorrente(dia) {
        setFormRecorrencia((atual) => ({
            ...atual,
            diasSemana: atual.diasSemana.includes(dia)
                ? atual.diasSemana.filter((item) => item !== dia)
                : [...atual.diasSemana, dia],
        }));
    }

    async function salvarRegrasRecorrentes(regras) {
        try {
            setSalvandoRecorrencia(true);
            setMensagem(null);
            const salvas = await salvarBloqueiosRecorrentes(barbeiroId, regras);
            setRegrasRecorrentes(salvas);
            setMensagem({ tipo: "sucesso", texto: "Bloqueios recorrentes atualizados." });
            return true;
        } catch (error) {
            setMensagem({ tipo: "erro", texto: error?.response?.data?.erro || "Não foi possível salvar a recorrência." });
            return false;
        } finally {
            setSalvandoRecorrencia(false);
        }
    }

    async function adicionarRecorrencia(event) {
        event.preventDefault();
        if (formRecorrencia.diasSemana.length === 0) {
            setMensagem({ tipo: "erro", texto: "Selecione pelo menos um dia da semana." });
            return;
        }
        const regra = {
            ...formRecorrencia,
            motivo: formRecorrencia.motivo.trim(),
            dataFim: formRecorrencia.dataFim || "",
        };
        if (regra.horaFim <= regra.horaInicio) {
            setMensagem({ tipo: "erro", texto: "O horário final precisa ser depois do horário inicial." });
            return;
        }
        if (await salvarRegrasRecorrentes([...regrasRecorrentes, regra])) {
            setFormRecorrencia((atual) => ({ ...atual, diasSemana: [], motivo: "", dataFim: "" }));
        }
    }

    function removerRecorrencia(id) {
        salvarRegrasRecorrentes(regrasRecorrentes.filter((regra) => regra._id !== id));
    }

    const totalBloqueados = new Set([...slotsBloqueados, ...slotsRecorrentes]).size;
    const totalLivres = TODOS_OS_SLOTS.length - totalBloqueados;

    return (
        <div className="gerenciar-horarios-page">

            {/* CABEÇALHO */}
            <div className="gh-cabecalho">
                <div>
                    <span className="gh-eyebrow">MINHA AGENDA</span>
                    <h1>Meus horários</h1>
                    <p>Escolha uma data e bloqueie ou libere seus horários.</p>
                </div>
            </div>

            <section className="gh-recorrencias">
                <div className="gh-recorrencias-titulo">
                    <div>
                        <span className="gh-eyebrow">REGRAS DEFINIDAS POR VOCÊ</span>
                        <h2>Bloqueios contínuos</h2>
                        <p>Escolha os dias, o período e a faixa de horário que se repetem.</p>
                    </div>
                </div>

                <form className="gh-recorrencia-form" onSubmit={adicionarRecorrencia}>
                    <div className="gh-recorrencia-campo gh-recorrencia-dias">
                        <span className="gh-recorrencia-label">DIAS DA SEMANA</span>
                        <div className="gh-dias-opcoes">
                            {DIAS_SEMANA.map((dia) => (
                                <button
                                    key={dia.valor}
                                    type="button"
                                    className={formRecorrencia.diasSemana.includes(dia.valor) ? "selecionado" : ""}
                                    onClick={() => alternarDiaRecorrente(dia.valor)}
                                >{dia.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="gh-recorrencia-linha">
                        <label className="gh-recorrencia-campo">
                            <span className="gh-recorrencia-label">INÍCIO</span>
                            <input type="time" value={formRecorrencia.horaInicio} onChange={(e) => setFormRecorrencia({ ...formRecorrencia, horaInicio: e.target.value })} required />
                        </label>
                        <label className="gh-recorrencia-campo">
                            <span className="gh-recorrencia-label">FIM</span>
                            <input type="time" value={formRecorrencia.horaFim} onChange={(e) => setFormRecorrencia({ ...formRecorrencia, horaFim: e.target.value })} required />
                        </label>
                        <label className="gh-recorrencia-campo">
                            <span className="gh-recorrencia-label">VÁLIDO A PARTIR DE</span>
                            <input type="date" value={formRecorrencia.dataInicio} onChange={(e) => setFormRecorrencia({ ...formRecorrencia, dataInicio: e.target.value })} required />
                        </label>
                        <label className="gh-recorrencia-campo">
                            <span className="gh-recorrencia-label">ATÉ (OPCIONAL)</span>
                            <input type="date" min={formRecorrencia.dataInicio || undefined} value={formRecorrencia.dataFim} onChange={(e) => setFormRecorrencia({ ...formRecorrencia, dataFim: e.target.value })} />
                        </label>
                    </div>
                    <label className="gh-recorrencia-campo">
                        <span className="gh-recorrencia-label">MOTIVO</span>
                        <input type="text" maxLength={300} value={formRecorrencia.motivo} onChange={(e) => setFormRecorrencia({ ...formRecorrencia, motivo: e.target.value })} placeholder="Ex.: folga semanal" required />
                    </label>
                    <button className="gh-btn-salvar" type="submit" disabled={salvandoRecorrencia}>
                        {salvandoRecorrencia ? "Salvando..." : "Adicionar recorrência"}
                    </button>
                </form>

                <div className="gh-regras-lista">
                    {regrasRecorrentes.length === 0 ? <p>Nenhuma regra recorrente cadastrada.</p> : regrasRecorrentes.map((regra) => (
                        <article className="gh-regra-card" key={regra._id}>
                            <div>
                                <strong>{descreverDias(regra.diasSemana)} · {regra.horaInicio}–{regra.horaFim}</strong>
                                <span>{formatarDataSemFuso(regra.dataInicio)} até {regra.dataFim ? formatarDataSemFuso(regra.dataFim) : "sem data final"}</span>
                                <small>{regra.motivo}</small>
                            </div>
                            <button type="button" className="gh-btn-remover-regra" disabled={salvandoRecorrencia} onClick={() => removerRecorrencia(regra._id)}>Remover</button>
                        </article>
                    ))}
                </div>
            </section>

            {/* FILTROS */}
            <div className="gh-filtros">
                <div className="gh-campo">
                    <label htmlFor="data">BLOQUEIO PONTUAL · DATA</label>
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
            {!data && (
                <div className="gh-vazio">
                    <span>🗓</span>
                    <p>Selecione uma data para gerenciar seus horários.</p>
                </div>
            )}

            {!barbeiroId && (
                <div className="gh-mensagem erro">Não foi possível identificar sua conta de barbeiro. Entre novamente.</div>
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
                                Liberar pontuais
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

                    {slotEmEdicao && (
                        createPortal(<div className="gh-modal-overlay" onClick={() => setSlotEmEdicao(null)}>
                            <form
                                className="gh-modal-motivo"
                                onSubmit={(event) => { event.preventDefault(); confirmarBloqueio(); }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <h2>{slotEmEdicao === "TODOS" ? "Bloquear todos os horários" : `Bloquear ${slotEmEdicao}`}</h2>
                                <p>Informe o motivo do bloqueio. O administrador poderá consultá-lo.</p>
                                <label htmlFor="motivo-bloqueio">Motivo</label>
                                <textarea
                                    id="motivo-bloqueio"
                                    value={motivoNovo}
                                    onChange={(event) => setMotivoNovo(event.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    autoFocus
                                    required
                                />
                                <div className="gh-modal-acoes">
                                    <button type="button" className="gh-btn-secundario" onClick={() => setSlotEmEdicao(null)}>Cancelar</button>
                                    <button type="submit" className="gh-btn-salvar">Confirmar bloqueio</button>
                                </div>
                            </form>
                        </div>, document.body)
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
                                    const recorrente = slotsRecorrentes.includes(slot);
                                    const bloqueado = recorrente || slotsBloqueados.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            className={`gh-slot ${bloqueado ? "bloqueado" : "livre"} ${recorrente ? "recorrente" : ""}`}
                                            onClick={() => toggleSlot(slot)}
                                            disabled={salvando || recorrente}
                                        >
                                            <span className="gh-slot-hora">{slot}</span>
                                            <span className="gh-slot-status">
                                                {recorrente ? "Recorrente" : bloqueado ? "Bloqueado" : "Livre"}
                                            </span>
                                            {bloqueado && motivos[slot] && (
                                                <span className="gh-slot-motivo" title={motivos[slot]}>
                                                    {motivos[slot]}
                                                </span>
                                            )}
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
