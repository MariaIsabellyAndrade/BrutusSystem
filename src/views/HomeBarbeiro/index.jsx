import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, Scissors, UserRound, Phone, CircleCheck, Hourglass, Pencil, X, Save } from "lucide-react";
import { atualizarMeuPerfilBarbeiro, buscarInicioBarbeiro, getUrlFotoBarbeiro } from "../../service/serviceBarbeiro";
import { formatarMoedaExibicao } from "../../utils/formatters";
import "./index.css";

const formatarHora = (hora) => hora || "—";
const normalizarStatus = (status) => String(status || "").toUpperCase();

export default function HomeBarbeiro() {
  const [inicio, setInicio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [perfilForm, setPerfilForm] = useState({ nome: "", sobrenome: "", telefone: "", email: "" });

  useEffect(() => {
    let ativo = true;
    buscarInicioBarbeiro()
      .then((dados) => { if (ativo) setInicio(dados); })
      .catch((error) => {
        console.error("Erro ao carregar início do barbeiro:", error);
        if (ativo) setErro(error.response?.data?.erro || "Não foi possível carregar seus dados.");
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const agendamentos = useMemo(() => [...(inicio?.agendamentos || [])].sort((a, b) => String(a.hora).localeCompare(String(b.hora))), [inicio]);
  const pendentes = agendamentos.filter((item) => normalizarStatus(item.status) === "PENDENTE").length;
  const concluidos = agendamentos.filter((item) => normalizarStatus(item.status) === "CONCLUIDO").length;
  const dataAtual = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  if (carregando) return <main className="barbeiro-inicio"><p className="barbeiro-inicio-feedback">Carregando seu início...</p></main>;
  if (erro) return <main className="barbeiro-inicio"><p className="barbeiro-inicio-feedback erro">{erro}</p></main>;

  const barbeiro = inicio?.barbeiro || {};
  const nome = [barbeiro.nome, barbeiro.sobrenome].filter(Boolean).join(" ") || "Barbeiro";

  const abrirEdicaoPerfil = () => {
    setPerfilForm({ nome: barbeiro.nome || "", sobrenome: barbeiro.sobrenome || "", telefone: barbeiro.telefone || "", email: barbeiro.email || "" });
    setErroPerfil("");
    setEditandoPerfil(true);
  };

  const salvarPerfil = async (event) => {
    event.preventDefault();
    setSalvandoPerfil(true);
    setErroPerfil("");
    try {
      const resposta = await atualizarMeuPerfilBarbeiro(perfilForm);
      setInicio((atual) => ({ ...atual, barbeiro: { ...atual.barbeiro, ...resposta.barbeiro } }));
      setEditandoPerfil(false);
    } catch (error) {
      setErroPerfil(error.response?.data?.erro || "Não foi possível salvar suas informações.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  return (
    <main className="barbeiro-inicio">
      <header className="barbeiro-inicio-topo">
        <div><span className="barbeiro-inicio-eyebrow">ÁREA DO PROFISSIONAL</span><h1>Olá, {barbeiro.nome || "barbeiro"}</h1><p>{dataAtual}</p></div>
        <Link to="/minha-agenda" className="barbeiro-inicio-acao"><CalendarDays size={17} /> Minha agenda</Link>
      </header>

      <section className="barbeiro-inicio-perfil">
        <img src={getUrlFotoBarbeiro(barbeiro.foto)} alt={`Foto de ${nome}`} />
        <div className="barbeiro-inicio-perfil-info"><span>SEU PERFIL</span><h2>{nome}</h2><p>{barbeiro.email || "Profissional da barbearia"}</p></div>
        <div className="barbeiro-inicio-contatos">
          {barbeiro.telefone && <span><Phone size={15} /> {barbeiro.telefone}</span>}
          {barbeiro.dataAdmissao && <span><Scissors size={15} /> Desde {new Date(barbeiro.dataAdmissao).toLocaleDateString("pt-BR")}</span>}
        </div>
        <button type="button" className="barbeiro-inicio-editar" onClick={abrirEdicaoPerfil}><Pencil size={15} /> Editar informações</button>
      </section>

      {editandoPerfil && <div className="barbeiro-perfil-modal-fundo" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditandoPerfil(false); }}>
        <form className="barbeiro-perfil-modal" onSubmit={salvarPerfil}>
          <div className="barbeiro-perfil-modal-topo"><div><span>SEU PERFIL</span><h2>Editar informações</h2></div><button type="button" aria-label="Fechar" onClick={() => setEditandoPerfil(false)}><X size={19} /></button></div>
          <label>Nome<input required maxLength="80" value={perfilForm.nome} onChange={(event) => setPerfilForm({ ...perfilForm, nome: event.target.value })} /></label>
          <label>Sobrenome<input required maxLength="100" value={perfilForm.sobrenome} onChange={(event) => setPerfilForm({ ...perfilForm, sobrenome: event.target.value })} /></label>
          <label>Telefone<input required maxLength="20" value={perfilForm.telefone} onChange={(event) => setPerfilForm({ ...perfilForm, telefone: event.target.value })} /></label>
          <label>E-mail<input required type="email" maxLength="150" value={perfilForm.email} onChange={(event) => setPerfilForm({ ...perfilForm, email: event.target.value })} /></label>
          {erroPerfil && <p className="barbeiro-perfil-modal-erro">{erroPerfil}</p>}
          <div className="barbeiro-perfil-modal-acoes"><button type="button" className="cancelar" onClick={() => setEditandoPerfil(false)}>Cancelar</button><button type="submit" disabled={salvandoPerfil}><Save size={16} /> {salvandoPerfil ? "Salvando..." : "Salvar alterações"}</button></div>
        </form>
      </div>}

      <div className="barbeiro-inicio-secao-titulo"><div><span>ACOMPANHAMENTO</span><h2>Resumo de hoje</h2></div><Link to="/agendar">Novo agendamento</Link></div>
      <section className="barbeiro-inicio-indicadores">
        <article><span className="indicador-icone"><CalendarDays size={18} /></span><div><small>Agendamentos</small><strong>{agendamentos.length}</strong></div></article>
        <article><span className="indicador-icone pendente"><Hourglass size={18} /></span><div><small>Pendentes</small><strong>{pendentes}</strong></div></article>
        <article><span className="indicador-icone concluido"><CircleCheck size={18} /></span><div><small>Concluídos</small><strong>{concluidos}</strong></div></article>
      </section>

      <section className="barbeiro-inicio-agenda">
        <div className="barbeiro-inicio-agenda-titulo"><div><span>SUA ROTINA</span><h2>Agendamentos do dia</h2></div><span className="barbeiro-inicio-total">{agendamentos.length} {agendamentos.length === 1 ? "atendimento" : "atendimentos"}</span></div>
        {agendamentos.length === 0 ? <div className="barbeiro-inicio-vazio"><CalendarDays size={25} /><strong>Nenhum agendamento para hoje</strong><p>Quando alguém marcar um horário com você, ele aparecerá aqui.</p></div> : (
          <div className="barbeiro-inicio-lista">{agendamentos.map((item) => (
            <article className="barbeiro-inicio-item" key={item._id}>
              <div className="barbeiro-inicio-hora"><Clock3 size={16} /><strong>{formatarHora(item.hora)}</strong></div>
              <div className="barbeiro-inicio-cliente"><span className="barbeiro-inicio-avatar"><UserRound size={18} /></span><div><strong>{item.cliente?.nome || "Cliente"} {item.cliente?.sobrenome || ""}</strong><small>{item.servicos?.map((servico) => servico.nome).filter(Boolean).join(" · ") || "Serviço"}</small></div></div>
              <div className="barbeiro-inicio-valor">{formatarMoedaExibicao(Number(item.valorTotal || 0))}</div>
              <span className={`barbeiro-inicio-status status-${normalizarStatus(item.status).toLowerCase()}`}>{item.status}</span>
            </article>
          ))}</div>
        )}
      </section>
    </main>
  );
}
