import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import {listarBarbeiros} from "../../service/serviceBarbeiro"
import {listarClientes} from "../../service/serviceCliente"
import {listarServicos} from "../../service/serviceServico"
import {criarAgendamento} from "../../service/serviceAgenda"


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

  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");
  const entidadeId = localStorage.getItem("entidadeId");

  /*
   * ETAPA 1 depende do tipo de usuário.
   * CLIENTE -> escolhe barbeiro
   * BARBEIRO -> escolhe cliente
   */
  const etapaNomes =
    tipo === "BARBEIRO"
      ? ["Cliente", "Serviços", "Data", "Horário", "Resumo"]
      : ["Barbeiro", "Serviços", "Data", "Horário", "Resumo"];


      useEffect(() => {
  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro("");

      const tipoUsuario = localStorage.getItem("tipo");

      // =========================
      // SERVIÇOS
      // =========================
      const servicosResponse = await listarServicos();

      const listaServicos = Array.isArray(servicosResponse)
        ? servicosResponse
        : servicosResponse?.servicos ||
          servicosResponse?.data ||
          [];

      // SOMENTE SERVIÇOS ATIVOS
      const servicosAtivos = listaServicos.filter(
        (servico) => servico.ativo === true
      );

      setServicos(servicosAtivos);

      // =========================
      // BARBEIROS
      // =========================
      if (tipoUsuario === "CLIENTE") {
        const barbeirosResponse = await listarBarbeiros();

        const listaBarbeiros = Array.isArray(barbeirosResponse)
          ? barbeirosResponse
          : barbeirosResponse?.barbeiros ||
            barbeirosResponse?.data ||
            [];

        // SOMENTE BARBEIROS ATIVOS
        const barbeirosAtivos = listaBarbeiros.filter(
          (barbeiro) => barbeiro.ativo === true
        );

        setBarbeiros(barbeirosAtivos);
      }

      // =========================
      // CLIENTES
      // =========================
      if (tipoUsuario === "BARBEIRO") {
        const clientesResponse = await listarClientes();

        const listaClientes = Array.isArray(clientesResponse)
          ? clientesResponse
          : clientesResponse?.clientes ||
            clientesResponse?.data ||
            [];

        // SOMENTE CLIENTES ATIVOS
        const clientesAtivos = listaClientes.filter(
          (cliente) => cliente.ativo === true
        );

        setClientes(clientesAtivos);
      }
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);

      setErro(
        error?.message || "Erro ao carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  };

  carregarDados();
}, []);



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
    return Number(
      item?.preco ??
        item?.valor ??
        item?.precoServico ??
        item?.Preco ??
        0
    );
  }

  function getDuracaoServico(item) {
    return Number(
      item?.duracao ??
        item?.Duracao ??
        0
    );
  }

  function selecionarServico(id) {
    setServicosSelecionados((atual) => {
      if (atual.includes(id)) {
        return atual.filter((item) => item !== id);
      }

      return [...atual, id];
    });

    setErro("");
  }

  const servicosEscolhidos = useMemo(() => {
    return servicos.filter((servico) =>
      servicosSelecionados.includes(getId(servico))
    );
  }, [servicos, servicosSelecionados]);

  const valorTotal = useMemo(() => {
    return servicosEscolhidos.reduce(
      (total, servico) =>
        total + getPrecoServico(servico),
      0
    );
  }, [servicosEscolhidos]);

  const duracaoTotal = useMemo(() => {
    return servicosEscolhidos.reduce(
      (total, servico) =>
        total + getDuracaoServico(servico),
      0
    );
  }, [servicosEscolhidos]);

  function gerarHorarios() {
    const horarios = [];

    for (let horaAtual = 8; horaAtual <= 21; horaAtual++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        if (horaAtual === 21 && minuto > 30) {
          continue;
        }

        const horario =
          String(horaAtual).padStart(2, "0") +
          ":" +
          String(minuto).padStart(2, "0");

        horarios.push(horario);
      }
    }

    return horarios;
  }

  const horarios = gerarHorarios();

  function dataMinima() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
      hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function formatarData(dataString) {
    if (!dataString) {
      return "Não selecionada";
    }

    const partes = dataString.split("-");

    if (partes.length !== 3) {
      return dataString;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function validarEtapaAtual() {
    setErro("");

    if (etapa === 1) {
      if (tipo === "CLIENTE" && !barbeiro) {
        setErro("Selecione um barbeiro.");
        return false;
      }

      if (tipo === "BARBEIRO" && !cliente) {
        setErro("Selecione um cliente.");
        return false;
      }
    }

    if (etapa === 2) {
      if (servicosSelecionados.length === 0) {
        setErro("Selecione pelo menos um serviço.");
        return false;
      }
    }

    if (etapa === 3) {
      if (!data) {
        setErro("Selecione uma data.");
        return false;
      }
    }

    if (etapa === 4) {
      if (!hora) {
        setErro("Selecione um horário.");
        return false;
      }
    }

    return true;
  }

  function proximaEtapa() {
    if (!validarEtapaAtual()) {
      return;
    }

    setErro("");

    if (etapa < 5) {
      setEtapa((atual) => atual + 1);
    }
  }

  function etapaAnterior() {
    setErro("");

    if (etapa > 1) {
      setEtapa((atual) => atual - 1);
    }
  }
async function confirmarAgendamento() {
    setErro("");
    setSucesso("");

    const tipoUsuario = localStorage.getItem("tipo");
    const idUsuario = localStorage.getItem("entidadeId");

    if (!token) {
        setErro(
            "Você precisa estar logado para realizar um agendamento."
        );
        return;
    }

    if (!idUsuario) {
        setErro(
            "Não foi possível identificar o usuário logado."
        );
        return;
    }

    if (tipoUsuario === "CLIENTE" && !barbeiro) {
        setErro("Selecione um barbeiro.");
        setEtapa(1);
        return;
    }

    if (tipoUsuario === "BARBEIRO" && !cliente) {
        setErro("Selecione um cliente.");
        setEtapa(1);
        return;
    }

    if (servicosSelecionados.length === 0) {
        setErro("Selecione pelo menos um serviço.");
        setEtapa(2);
        return;
    }

    if (!data) {
        setErro("Selecione uma data.");
        setEtapa(3);
        return;
    }

    if (!hora) {
        setErro("Selecione um horário.");
        setEtapa(4);
        return;
    }

    try {
        setEnviando(true);

        const dados = {
            Cliente:
                tipoUsuario === "CLIENTE"
                    ? idUsuario
                    : cliente,

            Barbeiro:
                tipoUsuario === "BARBEIRO"
                    ? idUsuario
                    : barbeiro,

            Servicos: servicosSelecionados,
            data,
            hora,
        };

        console.log("DADOS ENVIADOS:", dados);

       const resultado = await criarAgendamento(dados);

console.log("RESULTADO DO AGENDAMENTO:", resultado);

const pagamento = resultado?.pagamento;

if (!pagamento) {
    throw new Error("Os dados do pagamento PIX não foram retornados.");
}

setQrCode(pagamento.qrCode || "");
setQrCodeBase64(pagamento.qrCodeBase64 || "");

setSucesso(
    "Agendamento criado com sucesso! Realize o pagamento do PIX para confirmar."
);

setEtapa(6);

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

  function getNomeClienteSelecionado() {
    const item = clientes.find(
      (clienteItem) =>
        getId(clienteItem) === cliente
    );

    if (!item) {
      return "Não selecionado";
    }

    return `${item?.nome || ""} ${
      item?.sobrenome || ""
    }`.trim();
  }

  function getNomeBarbeiroSelecionado() {
    const item = barbeiros.find(
      (barbeiroItem) =>
        getId(barbeiroItem) === barbeiro
    );

    return item
      ? getNomeBarbeiro(item)
      : "Não selecionado";
  }

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

  return (
    <main className="agendamento-page">

      <div className="agendamento-background"></div>

      <div className="agendamento-container">

        {/* HEADER */}

        <header className="agendamento-header">

          <Link
            to="/"
            className="agendamento-back"
          >
            ← Voltar para a home
          </Link>
          <div className="agendamento-title">
            <p>
              Escolha os detalhes do seu
              atendimento de forma rápida e simples.
            </p>

          </div>

        </header>


        {/* PROGRESSO */}

        {etapa <= 5 && (
          <div className="agendamento-progress">

            <div className="progress-line">
              <div
                className="progress-fill"
                style={{
                  width: `${((etapa - 1) / 4) * 100}%`,
                }}
              ></div>
            </div>

            <div className="progress-steps">

              {etapaNomes.map(
                (nome, index) => {

                  const numero = index + 1;

                  return (
                    <div
                      key={nome}
                      className={`progress-step ${
                        numero <= etapa
                          ? "active"
                          : ""
                      }`}
                    >

                      <div className="progress-number">
                        {String(numero).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <span>
                        {nome}
                      </span>

                    </div>
                  );
                }
              )}

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

          {/* ETAPA 1 */}

          {etapa === 1 && (
            <section className="modal-content">

              <div className="modal-heading">

                <span>01</span>

                <div>
                  <small>
                    {tipo === "BARBEIRO"
                      ? "ATENDIMENTO"
                      : "PROFISSIONAL"}
                  </small>

                  <h2>
                    {tipo === "BARBEIRO"
                      ? "Escolha o cliente"
                      : "Escolha o barbeiro"}
                  </h2>

                  <p>
                    {tipo === "BARBEIRO"
                      ? "Selecione o cliente para o atendimento."
                      : "Selecione o profissional que irá realizar seu atendimento."}
                  </p>
                </div>

              </div>

              {tipo === "CLIENTE" ? (
                <div className="barbeiros-grid">

                  {barbeiros.length === 0 ? (
                    <div className="empty-message">
                      Nenhum barbeiro disponível.
                    </div>
                  ) : (
                    barbeiros.map((item) => {

                      const id = getId(item);

                      const selecionado =
                        barbeiro === id;

                      return (
                        <button
                          type="button"
                          key={id}
                          className={`barbeiro-card ${
                            selecionado
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setBarbeiro(id);
                            setErro("");
                          }}
                        >

                          <div className="barbeiro-avatar">

                            {getNomeBarbeiro(item)
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="barbeiro-info">

                            <strong>
                              {getNomeBarbeiro(item)}
                            </strong>

                            <span>
                              Profissional
                            </span>

                          </div>

                          <div className="selection-check">
                            {selecionado
                              ? "✓"
                              : ""}
                          </div>

                        </button>
                      );
                    })
                  )}

                </div>
              ) : (
                <div className="barbeiros-grid">

                  {clientes.length === 0 ? (
                    <div className="empty-message">
                      Nenhum cliente disponível.
                    </div>
                  ) : (
                    clientes.map((item) => {

                      const id = getId(item);

                      const selecionado =
                        cliente === id;

                      return (
                        <button
                          type="button"
                          key={id}
                          className={`barbeiro-card ${
                            selecionado
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            setCliente(id);
                            setErro("");
                          }}
                        >

                          <div className="barbeiro-avatar">

                            {item?.nome
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="barbeiro-info">

                            <strong>
                              {item?.nome}{" "}
                              {item?.sobrenome}
                            </strong>

                            <span>
                              Cliente
                            </span>

                          </div>

                          <div className="selection-check">
                            {selecionado
                              ? "✓"
                              : ""}
                          </div>

                        </button>
                      );
                    })
                  )}

                </div>
              )}

            </section>
          )}


          {/* ETAPA 2 */}

          {etapa === 2 && (
            <section className="modal-content">

              <div className="modal-heading">

                <span>02</span>

                <div>

                  <small>
                    SERVIÇOS
                  </small>

                  <h2>
                    Escolha os serviços
                  </h2>

                  <p>
                    Você pode selecionar mais de um serviço.
                  </p>

                </div>

              </div>

              <div className="servicos-grid">

                {servicos.length === 0 ? (
                  <div className="empty-message">
                    Nenhum serviço disponível.
                  </div>
                ) : (
                  servicos.map((servico) => {

                    const id = getId(servico);

                    const selecionado =
                      servicosSelecionados.includes(
                        id
                      );

                    return (
                      <button
                        type="button"
                        key={id}
                        className={`servico-card ${
                          selecionado
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          selecionarServico(id)
                        }
                      >

                        <div className="servico-check">
                          {selecionado
                            ? "✓"
                            : ""}
                        </div>

                        <div className="servico-content">

                          <strong>
                            {getNomeServico(
                              servico
                            )}
                          </strong>

                          <span>
                            {getDuracaoServico(
                              servico
                            )}{" "}
                            minutos
                          </span>

                        </div>

                        <div className="servico-preco">
                          R${" "}
                          {getPrecoServico(
                            servico
                          )
                            .toFixed(2)
                            .replace(".", ",")}
                        </div>

                      </button>
                    );
                  })
                )}

              </div>

            </section>
          )}


          {/* ETAPA 3 */}

          {etapa === 3 && (
            <section className="modal-content">

              <div className="modal-heading">

                <span>03</span>

                <div>

                  <small>
                    DATA
                  </small>

                  <h2>
                    Escolha a data
                  </h2>

                  <p>
                    Selecione o dia do seu atendimento.
                  </p>

                </div>

              </div>

              <div className="data-wrapper">

                <label htmlFor="data">
                  Data do atendimento
                </label>

                <input
                  id="data"
                  type="date"
                  min={dataMinima()}
                  value={data}
                  onChange={(event) => {
                    setData(
                      event.target.value
                    );

                    setHora("");

                    setErro("");
                  }}
                />

              </div>

              {data && (
                <div className="selected-date">

                  <span>
                    DATA SELECIONADA
                  </span>

                  <strong>
                    {formatarData(data)}
                  </strong>

                </div>
              )}

            </section>
          )}


          {/* ETAPA 4 */}

          {etapa === 4 && (
            <section className="modal-content">

              <div className="modal-heading">

                <span>04</span>

                <div>

                  <small>
                    HORÁRIO
                  </small>

                  <h2>
                    Escolha o horário
                  </h2>

                  <p>
                    Horários disponíveis a cada 30 minutos.
                  </p>

                </div>

              </div>

              {!data ? (
                <div className="horario-empty">
                  <span>◷</span>

                  <p>
                    Selecione uma data primeiro.
                  </p>
                </div>
              ) : (
                <div className="horarios-grid">

                  {horarios.map((horario) => (

                    <button
                      type="button"
                      key={horario}
                      className={`horario-button ${
                        hora === horario
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setHora(horario);
                        setErro("");
                      }}
                    >
                      {horario}
                    </button>

                  ))}

                </div>
              )}

            </section>
          )}


          {/* ETAPA 5 - RESUMO */}

          {etapa === 5 && (
            <section className="modal-content resumo-modal">

              <div className="modal-heading">

                <span>05</span>

                <div>

                  <small>
                    RESUMO
                  </small>

                  <h2>
                    Confira seu agendamento
                  </h2>

                  <p>
                    Verifique os dados antes de confirmar.
                  </p>

                </div>

              </div>

              <div className="resumo-body">

                {tipo === "BARBEIRO" && (
                  <div className="resumo-row">
                    <span>
                      Cliente
                    </span>

                    <strong>
                      {getNomeClienteSelecionado()}
                    </strong>
                  </div>
                )}

                {tipo === "CLIENTE" && (
                  <div className="resumo-row">
                    <span>
                      Barbeiro
                    </span>

                    <strong>
                      {getNomeBarbeiroSelecionado()}
                    </strong>
                  </div>
                )}

                <div className="resumo-row">

                  <span>
                    Serviços
                  </span>

                  <strong>
                    {servicosSelecionados.length}{" "}
                    {servicosSelecionados.length === 1
                      ? "serviço"
                      : "serviços"}
                  </strong>

                </div>

                <div className="resumo-row">

                  <span>
                    Data
                  </span>

                  <strong>
                    {formatarData(data)}
                  </strong>

                </div>

                <div className="resumo-row">

                  <span>
                    Horário
                  </span>

                  <strong>
                    {hora}
                  </strong>

                </div>

                <div className="resumo-row">

                  <span>
                    Duração
                  </span>

                  <strong>
                    {duracaoTotal} minutos
                  </strong>

                </div>

              </div>

              <div className="resumo-total">

                <span>
                  Total dos serviços
                </span>

                <strong>
                  R${" "}
                  {valorTotal
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>

              </div>

              <div className="sinal-info">

                <div>
                  <span>
                    SINAL
                  </span>

                  <strong>
                    R$ 15,00
                  </strong>
                </div>

                <p>
                  Você pagará apenas R$ 15,00
                  de sinal via PIX.
                </p>

              </div>

            </section>
          )}


          {/* ETAPA 6 - PIX */}
{/* ETAPA 6 - PIX */}
{etapa === 6 && (
    <section className="modal-content pix-modal">

        <div className="pix-success-icon">
            ✓
        </div>

        <div className="modal-heading centered">
            <small>
                AGENDAMENTO CRIADO
            </small>

            <h2>
                Quase lá.
            </h2>

            <p>
                Realize o pagamento do sinal
                para confirmar seu horário.
            </p>
        </div>

        {/* QR CODE */}
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
                    Escaneie o QR Code acima
                    utilizando o aplicativo do seu banco.
                </p>
            </>
        )}

        {/* CÓDIGO COPIA E COLA */}
        {qrCode && (
            <div className="pix-code">

                <span>
                    CÓDIGO PIX
                </span>

                <textarea
                    value={qrCode}
                    readOnly
                />

                <button
                    type="button"
                    className={`btn-copy-pix ${
                        pixCopiado ? "copiado" : ""
                    }`}
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(qrCode);

                            setPixCopiado(true);

                            setTimeout(() => {
                                setPixCopiado(false);
                            }, 2500);

                        } catch (error) {
                            console.error(
                                "Erro ao copiar o PIX:",
                                error
                            );
                        }
                    }}
                >
                    {pixCopiado
                        ? "✓ Código PIX copiado!"
                        : "Copiar código PIX"}
                </button>

            </div>
        )}

        {/* CASO NÃO TENHA QR CODE */}
        {!qrCodeBase64 && !qrCode && (
            <div className="pix-waiting">
                <p>
                    Não foi possível carregar os dados do PIX.
                </p>
            </div>
        )}

    </section>
)}


          {/* FOOTER DO MODAL */}

          {etapa <= 5 && (
            <div className="modal-footer">

              <div className="footer-info">

                <div className="footer-icon">
                  ✦
                </div>

                <div>

                  <strong>
                    Pagamento seguro
                  </strong>

                  <small>
                    Sinal de R$ 15,00 via PIX
                  </small>

                </div>

              </div>

              <div className="modal-actions">

                {etapa > 1 && (
                  <button
                    type="button"
                    className="btn-back"
                    onClick={etapaAnterior}
                  >
                    ← Voltar
                  </button>
                )}

                {etapa < 5 ? (
                  <button
                    type="button"
                    className="btn-next"
                    onClick={proximaEtapa}
                  >
                    Continuar
                    <span>→</span>
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
                      <>
                        Confirmar agendamento
                        <span>→</span>
                      </>
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