import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import { listarBarbeiros } from "../../service/serviceBarbeiro";
import { listarClientes } from "../../service/serviceCliente";
import { listarServicos } from "../../service/serviceServico";
import { criarAgendamento, buscarHorariosDisponiveis } from "../../service/serviceAgenda";
import { formatarDataSemFuso, formatarMoedaExibicao } from "../../utils/formatters";

export default function AgendamentoPage() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);

  const [cliente, setCliente] = useState("");
  const [barbeiro, setBarbeiro] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const [etapa, setEtapa] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");
  const [pixCopiado, setPixCopiado] = useState(false);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);

  const token = sessionStorage.getItem("token");
  const tipo = sessionStorage.getItem("tipo");
  const isAdmin = tipo === "ADMIN";
  const isBarbeiro = tipo === "BARBEIRO";
  const isCliente = tipo === "CLIENTE";

  /*
   * Etapas por perfil:
   * ADMIN    → Barbeiro | Cliente | Serviços | Data | Horário | Resumo
   * BARBEIRO → Cliente  | Serviços | Data | Horário | Resumo
   * CLIENTE  → Barbeiro | Serviços | Data | Horário | Resumo
   */
  const etapaNomes = isAdmin
    ? ["Barbeiro", "Cliente", "Serviços", "Data", "Horário", "Resumo"]
    : isBarbeiro
    ? ["Cliente", "Serviços", "Data", "Horário", "Resumo"]
    : ["Barbeiro", "Serviços", "Data", "Horário", "Resumo"];

  const totalEtapas = etapaNomes.length;

  // Mapeia etapa lógica → índice na barra de progresso
  // (a barra sempre começa em 1 e vai até totalEtapas)
  const etapaResumo = totalEtapas;
  const etapaHorario = totalEtapas - 1;
  const etapaData = totalEtapas - 2;
  const etapaServicos = totalEtapas - 3;

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        setErro("");

        // Serviços: sempre carrega
        const servicosResponse = await listarServicos();
        const listaServicos = Array.isArray(servicosResponse)
          ? servicosResponse
          : servicosResponse?.data || servicosResponse?.servicos || [];
        setServicos(listaServicos.filter((s) => s.ativo === true));

        // Barbeiros: CLIENTE e ADMIN precisam selecionar barbeiro
        if (isCliente || isAdmin) {
          const barbeirosResponse = await listarBarbeiros();
          const listaBarbeiros = Array.isArray(barbeirosResponse)
            ? barbeirosResponse
            : barbeirosResponse?.data || barbeirosResponse?.barbeiros || [];
          setBarbeiros(listaBarbeiros.filter((b) => b.ativo === true));
        }

        // Clientes: BARBEIRO e ADMIN precisam selecionar cliente
        if (isBarbeiro || isAdmin) {
          const clientesResponse = await listarClientes();
          const listaClientes = Array.isArray(clientesResponse)
            ? clientesResponse
            : clientesResponse?.data || clientesResponse?.clientes || [];
          setClientes(listaClientes.filter((c) => c.ativo === true));
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        setErro(error?.message || "Erro ao carregar os dados.");
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // Busca horários disponíveis ao entrar na etapa de horário
  useEffect(() => {
    if (etapa !== etapaHorario || !data || servicosSelecionados.length === 0) return;

    const barbeiroId = isBarbeiro
      ? sessionStorage.getItem("entidadeId")
      : barbeiro;

    if (!barbeiroId) return;

    const buscar = async () => {
      try {
        setCarregandoHorarios(true);
        setErro("");
        const lista = await buscarHorariosDisponiveis(barbeiroId, data, servicosSelecionados);
        setHorariosDisponiveis(lista);
        if (hora && !lista.includes(hora)) setHora("");
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
        setErro("Não foi possível carregar os horários disponíveis.");
        setHorariosDisponiveis([]);
      } finally {
        setCarregandoHorarios(false);
      }
    };

    buscar();
  }, [etapa, data, barbeiro, servicosSelecionados]);

  /* ============================================================
     HELPERS
  ============================================================ */

  function getId(item) {
    return item?._id || item?.id;
  }

  function getNomeBarbeiro(item) {
    return (
      item?.nome ||
      item?.Nome ||
      item?.Usuario?.nome ||
      item?.usuario?.nome ||
      "Barbeiro"
    );
  }

  function getNomeServico(item) {
    return item?.nome || item?.Nome || "Serviço";
  }

  function getPrecoServico(item) {
    return Number(item?.preco ?? item?.valor ?? item?.precoServico ?? item?.Preco ?? 0);
  }

  function getDuracaoServico(item) {
    return Number(item?.duracao ?? item?.Duracao ?? 0);
  }

  function selecionarServico(id) {
    setServicosSelecionados((atual) =>
      atual.includes(id) ? atual.filter((i) => i !== id) : [...atual, id]
    );
    setErro("");
  }

  function dataMinima() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  }

  const servicosEscolhidos = useMemo(
    () => servicos.filter((s) => servicosSelecionados.includes(getId(s))),
    [servicos, servicosSelecionados]
  );

  const valorTotal = useMemo(
    () => servicosEscolhidos.reduce((t, s) => t + getPrecoServico(s), 0),
    [servicosEscolhidos]
  );

  const duracaoTotal = useMemo(
    () => servicosEscolhidos.reduce((t, s) => t + getDuracaoServico(s), 0),
    [servicosEscolhidos]
  );

  function getNomeClienteSelecionado() {
    const item = clientes.find((c) => getId(c) === cliente);
    if (!item) return "Não selecionado";
    return `${item?.nome || ""} ${item?.sobrenome || ""}`.trim();
  }

  function getNomeBarbeiroSelecionado() {
    const item = barbeiros.find((b) => getId(b) === barbeiro);
    return item ? `${getNomeBarbeiro(item)}` : "Não selecionado";
  }

  /* ============================================================
     VALIDAÇÃO E NAVEGAÇÃO
  ============================================================ */

  function validarEtapaAtual() {
    setErro("");

    // Etapa 1 — ADMIN seleciona barbeiro, BARBEIRO seleciona cliente, CLIENTE seleciona barbeiro
    if (etapa === 1) {
      if ((isAdmin || isCliente) && !barbeiro) {
        setErro("Selecione um barbeiro.");
        return false;
      }
      if (isBarbeiro && !cliente) {
        setErro("Selecione um cliente.");
        return false;
      }
    }

    // Etapa 2 — ADMIN seleciona cliente
    if (etapa === 2 && isAdmin) {
      if (!cliente) {
        setErro("Selecione um cliente.");
        return false;
      }
    }

    // Etapa de serviços
    if (etapa === etapaServicos) {
      if (servicosSelecionados.length === 0) {
        setErro("Selecione pelo menos um serviço.");
        return false;
      }
    }

    // Etapa de data
    if (etapa === etapaData) {
      if (!data) {
        setErro("Selecione uma data.");
        return false;
      }
    }

    // Etapa de horário
    if (etapa === etapaHorario) {
      if (!hora) {
        setErro("Selecione um horário.");
        return false;
      }
    }

    return true;
  }

  function proximaEtapa() {
    if (!validarEtapaAtual()) return;
    setErro("");
    if (etapa < totalEtapas) setEtapa((e) => e + 1);
  }

  function etapaAnterior() {
    setErro("");
    if (etapa > 1) setEtapa((e) => e - 1);
  }

  /* ============================================================
     CONFIRMAR AGENDAMENTO
  ============================================================ */

  async function confirmarAgendamento() {
    setErro("");
    setSucesso("");

    const idUsuario = sessionStorage.getItem("entidadeId");

    if (!token) {
      setErro("Você precisa estar logado para realizar um agendamento.");
      return;
    }
    if (!idUsuario) {
      setErro("Não foi possível identificar o usuário logado.");
      return;
    }

    try {
      setEnviando(true);

      let clienteEnvio;
      let barbeiroEnvio;

      if (isAdmin) {
        clienteEnvio = cliente;
        barbeiroEnvio = barbeiro;
      } else if (isBarbeiro) {
        clienteEnvio = cliente;
        barbeiroEnvio = idUsuario;
      } else {
        clienteEnvio = idUsuario;
        barbeiroEnvio = barbeiro;
      }

      const dados = {
        Cliente: clienteEnvio,
        Barbeiro: barbeiroEnvio,
        Servicos: servicosSelecionados,
        data,
        hora,
      };

      const resultado = await criarAgendamento(dados);
      const pagamento = resultado?.pagamento;

      if (!pagamento) throw new Error("Os dados do pagamento PIX não foram retornados.");

      setQrCode(pagamento.qrCode || "");
      setQrCodeBase64(pagamento.qrCodeBase64 || "");
      setSucesso("Agendamento criado com sucesso!");
      setEtapa(totalEtapas + 1); // etapa do PIX
    } catch (error) {
      console.error("ERRO AO CRIAR AGENDAMENTO:", error);
      setErro(
        error?.response?.data?.erro ||
          error?.response?.data?.message ||
          error?.message ||
          "Erro ao realizar agendamento."
      );
    } finally {
      setEnviando(false);
    }
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (carregando) {
    return (
      <main className="agendamento-page">
        <div className="agendamento-loading">
          <div className="loading-spinner"></div>
          <p>Carregando informações...</p>
        </div>
      </main>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  const etapaPix = totalEtapas + 1;

  return (
    <main className="agendamento-page">
      <div className="agendamento-background"></div>

      <div className="agendamento-container">
        {/* HEADER */}
        <header className="agendamento-header">
          <Link to="/" className="agendamento-back">
            ← Voltar para a home
          </Link>
          <div className="agendamento-title">
            <p>Escolha os detalhes do seu atendimento de forma rápida e simples.</p>
          </div>
        </header>

        {/* PROGRESSO */}
        {etapa <= totalEtapas && (
          <div className="agendamento-progress">
            <div className="progress-line">
              <div
                className="progress-fill"
                style={{ width: `${((etapa - 1) / (totalEtapas - 1)) * 100}%` }}
              />
            </div>
            <div className="progress-steps">
              {etapaNomes.map((nome, index) => {
                const numero = index + 1;
                return (
                  <div
                    key={nome}
                    className={`progress-step ${numero <= etapa ? "active" : ""}`}
                  >
                    <div className="progress-number">
                      {String(numero).padStart(2, "0")}
                    </div>
                    <span>{nome}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL */}
        <div className="agendamento-modal">
          {erro && (
            <div className="message error">
              <span>!</span>
              {erro}
            </div>
          )}

          {/* ── ETAPA 1: ADMIN → Barbeiro | BARBEIRO → Cliente | CLIENTE → Barbeiro ── */}
          {etapa === 1 && (
            <section className="modal-content">
              <div className="modal-heading">
                <span>01</span>
                <div>
                  <small>{isAdmin || isCliente ? "PROFISSIONAL" : "ATENDIMENTO"}</small>
                  <h2>{isAdmin || isCliente ? "Escolha o barbeiro" : "Escolha o cliente"}</h2>
                  <p>
                    {isAdmin || isCliente
                      ? "Selecione o profissional que irá realizar o atendimento."
                      : "Selecione o cliente para o atendimento."}
                  </p>
                </div>
              </div>

              {/* ADMIN ou CLIENTE — lista de barbeiros */}
              {(isAdmin || isCliente) && (
                <div className="barbeiros-grid">
                  {barbeiros.length === 0 ? (
                    <div className="empty-message">Nenhum barbeiro disponível.</div>
                  ) : (
                    barbeiros.map((item) => {
                      const id = getId(item);
                      const selecionado = barbeiro === id;
                      return (
                        <button
                          type="button"
                          key={id}
                          className={`barbeiro-card ${selecionado ? "selected" : ""}`}
                          onClick={() => { setBarbeiro(id); setErro(""); }}
                        >
                          <div className="barbeiro-avatar">
                            {getNomeBarbeiro(item).charAt(0).toUpperCase()}
                          </div>
                          <div className="barbeiro-info">
                            <strong>{getNomeBarbeiro(item)}</strong>
                            <span>Profissional</span>
                          </div>
                          <div className="selection-check">{selecionado ? "✓" : ""}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {/* BARBEIRO — lista de clientes */}
              {isBarbeiro && (
                <div className="barbeiros-grid">
                  {clientes.length === 0 ? (
                    <div className="empty-message">Nenhum cliente disponível.</div>
                  ) : (
                    clientes.map((item) => {
                      const id = getId(item);
                      const selecionado = cliente === id;
                      return (
                        <button
                          type="button"
                          key={id}
                          className={`barbeiro-card ${selecionado ? "selected" : ""}`}
                          onClick={() => { setCliente(id); setErro(""); }}
                        >
                          <div className="barbeiro-avatar">
                            {(item?.nome || "C").charAt(0).toUpperCase()}
                          </div>
                          <div className="barbeiro-info">
                            <strong>{item?.nome} {item?.sobrenome}</strong>
                            <span>Cliente</span>
                          </div>
                          <div className="selection-check">{selecionado ? "✓" : ""}</div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </section>
          )}

          {/* ── ETAPA 2: ADMIN → Cliente ── */}
          {etapa === 2 && isAdmin && (
            <section className="modal-content">
              <div className="modal-heading">
                <span>02</span>
                <div>
                  <small>CLIENTE</small>
                  <h2>Escolha o cliente</h2>
                  <p>Selecione o cliente para este agendamento.</p>
                </div>
              </div>
              <div className="barbeiros-grid">
                {clientes.length === 0 ? (
                  <div className="empty-message">Nenhum cliente disponível.</div>
                ) : (
                  clientes.map((item) => {
                    const id = getId(item);
                    const selecionado = cliente === id;
                    return (
                      <button
                        type="button"
                        key={id}
                        className={`barbeiro-card ${selecionado ? "selected" : ""}`}
                        onClick={() => { setCliente(id); setErro(""); }}
                      >
                        <div className="barbeiro-avatar">
                          {(item?.nome || "C").charAt(0).toUpperCase()}
                        </div>
                        <div className="barbeiro-info">
                          <strong>{item?.nome} {item?.sobrenome}</strong>
                          <span>Cliente</span>
                        </div>
                        <div className="selection-check">{selecionado ? "✓" : ""}</div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* ── ETAPA DE SERVIÇOS ── */}
          {etapa === etapaServicos && (
            <section className="modal-content">
              <div className="modal-heading">
                <span>{String(etapaServicos).padStart(2, "0")}</span>
                <div>
                  <small>SERVIÇOS</small>
                  <h2>Escolha os serviços</h2>
                  <p>Você pode selecionar mais de um serviço.</p>
                </div>
              </div>
              <div className="servicos-grid">
                {servicos.length === 0 ? (
                  <div className="empty-message">Nenhum serviço disponível.</div>
                ) : (
                  servicos.map((servico) => {
                    const id = getId(servico);
                    const selecionado = servicosSelecionados.includes(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        className={`servico-card ${selecionado ? "selected" : ""}`}
                        onClick={() => selecionarServico(id)}
                      >
                        <div className="servico-check">{selecionado ? "✓" : ""}</div>
                        <div className="servico-content">
                          <strong>{getNomeServico(servico)}</strong>
                          <span>{getDuracaoServico(servico)} minutos</span>
                        </div>
                        <div className="servico-preco">
                          {formatarMoedaExibicao(getPrecoServico(servico))}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {/* ── ETAPA DE DATA ── */}
          {etapa === etapaData && (
            <section className="modal-content">
              <div className="modal-heading">
                <span>{String(etapaData).padStart(2, "0")}</span>
                <div>
                  <small>DATA</small>
                  <h2>Escolha a data</h2>
                  <p>Selecione o dia do atendimento.</p>
                </div>
              </div>
              <div className="data-wrapper">
                <label htmlFor="data">Data do atendimento</label>
                <input
                  id="data"
                  type="date"
                  min={dataMinima()}
                  value={data}
                  onChange={(e) => { setData(e.target.value); setHora(""); setErro(""); }}
                />
              </div>
              {data && (
                <div className="selected-date">
                  <span>DATA SELECIONADA</span>
                  <strong>{formatarDataSemFuso(data)}</strong>
                </div>
              )}
            </section>
          )}

          {/* ── ETAPA DE HORÁRIO ── */}
          {etapa === etapaHorario && (
            <section className="modal-content">
              <div className="modal-heading">
                <span>{String(etapaHorario).padStart(2, "0")}</span>
                <div>
                  <small>HORÁRIO</small>
                  <h2>Escolha o horário</h2>
                  <p>Apenas horários disponíveis são exibidos.</p>
                </div>
              </div>
              {!data ? (
                <div className="horario-empty">
                  <span>◷</span>
                  <p>Selecione uma data primeiro.</p>
                </div>
              ) : carregandoHorarios ? (
                <div className="agendamento-loading">
                  <div className="loading-spinner"></div>
                  <p>Buscando horários disponíveis...</p>
                </div>
              ) : horariosDisponiveis.length === 0 ? (
                <div className="horario-empty">
                  <span>◷</span>
                  <p>Nenhum horário disponível para esta data.</p>
                </div>
              ) : (
                <div className="horarios-grid">
                  {horariosDisponiveis.map((horario) => (
                    <button
                      type="button"
                      key={horario}
                      className={`horario-button ${hora === horario ? "selected" : ""}`}
                      onClick={() => { setHora(horario); setErro(""); }}
                    >
                      {horario}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── ETAPA DE RESUMO ── */}
          {etapa === etapaResumo && (
            <section className="modal-content resumo-modal">
              <div className="modal-heading">
                <span>{String(etapaResumo).padStart(2, "0")}</span>
                <div>
                  <small>RESUMO</small>
                  <h2>Confira seu agendamento</h2>
                  <p>Verifique os dados antes de confirmar.</p>
                </div>
              </div>
              <div className="resumo-body">
                <div className="resumo-row">
                  <span>Barbeiro</span>
                  <strong>{getNomeBarbeiroSelecionado()}</strong>
                </div>
                {(isAdmin || isBarbeiro) && (
                  <div className="resumo-row">
                    <span>Cliente</span>
                    <strong>{getNomeClienteSelecionado()}</strong>
                  </div>
                )}
                <div className="resumo-row">
                  <span>Serviços</span>
                  <strong>
                    {servicosSelecionados.length}{" "}
                    {servicosSelecionados.length === 1 ? "serviço" : "serviços"}
                  </strong>
                </div>
                <div className="resumo-row">
                  <span>Data</span>
                  <strong>{formatarDataSemFuso(data)}</strong>
                </div>
                <div className="resumo-row">
                  <span>Horário</span>
                  <strong>{hora}</strong>
                </div>
                <div className="resumo-row">
                  <span>Duração</span>
                  <strong>{duracaoTotal} minutos</strong>
                </div>
              </div>
              <div className="resumo-total">
                <span>Total dos serviços</span>
                <strong>{formatarMoedaExibicao(valorTotal)}</strong>
              </div>
              <div className="sinal-info">
                <div>
                  <span>SINAL</span>
                  <strong>R$ 15,00</strong>
                </div>
                <p>Você pagará apenas R$ 15,00 de sinal via PIX.</p>
              </div>
            </section>
          )}

          {/* ── ETAPA PIX ── */}
          {etapa === etapaPix && (
            <section className="modal-content pix-modal">
              <div className="pix-success-icon">✓</div>
              <div className="modal-heading centered">
                <small>AGENDAMENTO CRIADO</small>
                <h2>Quase lá.</h2>
                <p>Realize o pagamento do sinal para confirmar seu horário.</p>
              </div>
              {qrCodeBase64 && (
                <>
                  <img
                    src={
                      qrCodeBase64.startsWith("data:image")
                        ? qrCodeBase64
                        : `data:image/png;base64,${qrCodeBase64}`
                    }
                    alt="QR Code PIX"
                    className="pix-qrcode"
                  />
                  <p className="pix-instruction">
                    Escaneie o QR Code acima utilizando o aplicativo do seu banco.
                  </p>
                </>
              )}
              {qrCode && (
                <div className="pix-code">
                  <span>CÓDIGO PIX</span>
                  <textarea value={qrCode} readOnly />
                  <button
                    type="button"
                    className={`btn-copy-pix ${pixCopiado ? "copiado" : ""}`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(qrCode);
                        setPixCopiado(true);
                        setTimeout(() => setPixCopiado(false), 2500);
                      } catch (e) {
                        console.error("Erro ao copiar o PIX:", e);
                      }
                    }}
                  >
                    {pixCopiado ? "✓ Código PIX copiado!" : "Copiar código PIX"}
                  </button>
                </div>
              )}
              {!qrCodeBase64 && !qrCode && (
                <div className="pix-waiting">
                  <p>Não foi possível carregar os dados do PIX.</p>
                </div>
              )}
            </section>
          )}

          {/* ── FOOTER ── */}
          {etapa <= totalEtapas && (
            <div className="modal-footer">
              <div className="footer-info">
                <div className="footer-icon">✦</div>
                <div>
                  <strong>Pagamento seguro</strong>
                  <small>Sinal de R$ 15,00 via PIX</small>
                </div>
              </div>
              <div className="modal-actions">
                {etapa > 1 && (
                  <button type="button" className="btn-back" onClick={etapaAnterior}>
                    ← Voltar
                  </button>
                )}
                {etapa < totalEtapas ? (
                  <button type="button" className="btn-next" onClick={proximaEtapa}>
                    Continuar <span>→</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-next"
                    disabled={enviando}
                    onClick={confirmarAgendamento}
                  >
                    {enviando ? (
                      <>
                        <span className="button-spinner"></span>
                        Processando...
                      </>
                    ) : (
                      <>Confirmar agendamento <span>→</span></>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
