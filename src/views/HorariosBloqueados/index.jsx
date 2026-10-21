import { useCallback, useEffect, useState } from "react";
import {
    listarBloqueiosParaAdmin,
    listarNotificacoesHorarios,
    marcarNotificacaoHorarioLida,
} from "../../service/serviceBarbeiro";
import { formatarDataSemFuso } from "../../utils/formatters";
import "./index.css";

function horarioDoSlot(slot) {
    return typeof slot === "string" ? slot : slot.horario;
}

function motivoDoSlot(slot) {
    return typeof slot === "string" ? "Motivo não informado" : slot.motivo || "Motivo não informado";
}

function diasDaSemana(dias = []) {
    const nomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return dias.map((dia) => nomes[dia]).join(", ");
}

export default function HorariosBloqueados() {
    const [bloqueios, setBloqueios] = useState([]);
    const [recorrencias, setRecorrencias] = useState([]);
    const [notificacoes, setNotificacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregar = useCallback(async () => {
        try {
            setErro("");
            const [dadosBloqueios, listaNotificacoes] = await Promise.all([
                listarBloqueiosParaAdmin(),
                listarNotificacoesHorarios(),
            ]);
            setBloqueios(dadosBloqueios.bloqueios);
            setRecorrencias(dadosBloqueios.recorrencias);
            setNotificacoes(listaNotificacoes);

            const naoLidas = listaNotificacoes.filter((item) => !item.lida);
            if (naoLidas.length > 0) {
                await Promise.all(naoLidas.map((item) => marcarNotificacaoHorarioLida(item._id)));
                setNotificacoes((atuais) => atuais.map((item) => ({ ...item, lida: true })));
                window.dispatchEvent(new Event("horarios-notificacoes-atualizadas"));
            }
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível carregar os bloqueios e notificações.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    async function marcarComoLida(id) {
        try {
            await marcarNotificacaoHorarioLida(id);
            setNotificacoes((atuais) => atuais.map((item) =>
                item._id === id ? { ...item, lida: true } : item
            ));
            window.dispatchEvent(new Event("horarios-notificacoes-atualizadas"));
        } catch (error) {
            setErro(error?.response?.data?.erro || "Não foi possível atualizar a notificação.");
        }
    }

    return (
        <main className="hb-page">
            <header className="hb-header">
                <div>
                    <span>ADMIN · AGENDA</span>
                    <h1>Bloqueios de horários</h1>
                    <p>Consulte os horários bloqueados, os motivos informados e as alterações recentes.</p>
                </div>
                <button type="button" className="hb-atualizar" onClick={carregar}>Atualizar</button>
            </header>

            {erro && <div className="hb-erro">{erro}</div>}
            {carregando ? <div className="hb-vazio">Carregando informações...</div> : (
                <>
                    <section className="hb-secao">
                        <div className="hb-secao-titulo">
                            <h2>Notificações</h2>
                            <span>{notificacoes.filter((item) => !item.lida).length} não lidas</span>
                        </div>
                        {notificacoes.length === 0 ? <div className="hb-vazio">Nenhuma alteração de horário registrada.</div> : (
                            <div className="hb-lista-notificacoes">
                                {notificacoes.map((item) => (
                                    <article key={item._id} className={`hb-notificacao ${item.lida ? "lida" : "nova"}`}>
                                        <div>
                                            <strong>{item.barbeiroNome || item.barbeiro?.nome || "Barbeiro"} · {formatarDataSemFuso(item.data)}</strong>
                                            <p>{item.mensagem || "Horários alterados."}</p>
                                            {(item.alteracoes || []).map((alteracao, index) => (
                                                <small key={`${alteracao.horario}-${index}`}>
                                                    {alteracao.horario} — {alteracao.acao === "bloqueado" ? "bloqueado" : alteracao.acao === "motivo_alterado" ? "motivo atualizado" : alteracao.acao === "regra_alterada" ? "regra recorrente atualizada" : "liberado"}
                                                    {alteracao.motivo ? ` · ${alteracao.motivo}` : ""}
                                                </small>
                                            ))}
                                        </div>
                                        {!item.lida && <button type="button" onClick={() => marcarComoLida(item._id)}>Marcar como lida</button>}
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="hb-secao">
                        <div className="hb-secao-titulo"><h2>Bloqueios contínuos</h2></div>
                        {recorrencias.length === 0 ? <div className="hb-vazio">Nenhuma regra recorrente ativa.</div> : (
                            <div className="hb-tabela-wrap">
                                <table className="hb-tabela">
                                    <thead><tr><th>Barbeiro</th><th>Repetição</th><th>Faixa de horário</th><th>Período</th><th>Motivo</th></tr></thead>
                                    <tbody>
                                        {recorrencias.map((regra) => (
                                            <tr key={`${regra.barbeiroId}-${regra._id}`}>
                                                <td>{regra.barbeiroNome}</td>
                                                <td>{diasDaSemana(regra.diasSemana)}</td>
                                                <td>{regra.horaInicio}–{regra.horaFim}</td>
                                                <td>{formatarDataSemFuso(regra.dataInicio)} até {regra.dataFim ? formatarDataSemFuso(regra.dataFim) : "sem data final"}</td>
                                                <td>{regra.motivo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="hb-secao">
                        <div className="hb-secao-titulo"><h2>Bloqueios atuais</h2></div>
                        {bloqueios.length === 0 ? <div className="hb-vazio">Nenhum horário está bloqueado.</div> : (
                            <div className="hb-tabela-wrap">
                                <table className="hb-tabela">
                                    <thead><tr><th>Barbeiro</th><th>Data</th><th>Horário</th><th>Motivo</th></tr></thead>
                                    <tbody>
                                        {bloqueios.flatMap((dia) => (dia.slots || []).map((slot) => (
                                            <tr key={`${dia.barbeiroId}-${dia.data}-${horarioDoSlot(slot)}`}>
                                                <td>{dia.barbeiroNome || dia.barbeiro?.nome || "—"}</td>
                                                <td>{formatarDataSemFuso(dia.data)}</td>
                                                <td>{horarioDoSlot(slot)}</td>
                                                <td>{motivoDoSlot(slot)}</td>
                                            </tr>
                                        )))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
