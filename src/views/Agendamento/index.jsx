import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:3000";

export default function AgendamentoPage() {
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);

const [clientes, setClientes] = useState([]);
const [cliente, setCliente] = useState("");

  const [barbeiro, setBarbeiro] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");

const token = localStorage.getItem("token");
const tipo = localStorage.getItem("tipo");
const entidadeId = localStorage.getItem("entidadeId");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
        setCarregando(true);
        setErro("");

        const tipoUsuario = localStorage.getItem("tipo");

        const requests = [
            fetch(`${API_URL}/servicos`)
        ];

        if (tipoUsuario === "CLIENTE") {
            requests.push(
                fetch(`${API_URL}/barbeiros`)
            );
        }

        if (tipoUsuario === "BARBEIRO") {
            requests.push(
                fetch(`${API_URL}/clientes`)
            );
        }

        const responses = await Promise.all(requests);

        const servicosResponse = responses[0];

        if (!servicosResponse.ok) {
            throw new Error(
                "Não foi possível carregar os serviços."
            );
        }

        const servicosData = await servicosResponse.json();

        setServicos(
            Array.isArray(servicosData)
                ? servicosData
                : servicosData.servicos ||
                  servicosData.data ||
                  []
        );

        if (tipoUsuario === "CLIENTE") {
            const barbeirosResponse = responses[1];

            if (!barbeirosResponse.ok) {
                throw new Error(
                    "Não foi possível carregar os barbeiros."
                );
            }

            const barbeirosData =
                await barbeirosResponse.json();

            setBarbeiros(
                Array.isArray(barbeirosData)
                    ? barbeirosData
                    : barbeirosData.barbeiros ||
                      barbeirosData.data ||
                      []
            );
        }

        if (tipoUsuario === "BARBEIRO") {
            const clientesResponse = responses[1];

            if (!clientesResponse.ok) {
                throw new Error(
                    "Não foi possível carregar os clientes."
                );
            }

            const clientesData =
                await clientesResponse.json();

            setClientes(
                Array.isArray(clientesData)
                    ? clientesData
                    : clientesData.clientes ||
                      clientesData.data ||
                      []
            );
        }

    } catch (error) {
        console.error(error);
        setErro(
            error.message ||
            "Erro ao carregar os dados."
        );
    } finally {
        setCarregando(false);
    }
}

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
      (total, servico) => total + getPrecoServico(servico),
      0
    );
  }, [servicosEscolhidos]);

  const duracaoTotal = useMemo(() => {
    return servicosEscolhidos.reduce(
      (total, servico) => total + getDuracaoServico(servico),
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
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

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

async function confirmarAgendamento() {
    setErro("");
    setSucesso("");

    const tipoUsuario = localStorage.getItem("tipo");
    const entidadeId = localStorage.getItem("entidadeId");

    if (!token) {
        setErro(
            "Você precisa estar logado para realizar um agendamento."
        );
        return;
    }

    if (!entidadeId) {
        setErro(
            "Não foi possível identificar o usuário logado."
        );
        return;
    }

    if (tipoUsuario === "CLIENTE" && !barbeiro) {
        setErro("Selecione um barbeiro.");
        return;
    }

    if (tipoUsuario === "BARBEIRO" && !cliente) {
        setErro("Selecione um cliente.");
        return;
    }

    if (servicosSelecionados.length === 0) {
        setErro("Selecione pelo menos um serviço.");
        return;
    }

    if (!data) {
        setErro("Selecione uma data.");
        return;
    }

    if (!hora) {
        setErro("Selecione um horário.");
        return;
    }

    try {
        setEnviando(true);

        const dados = {
            Cliente:
                tipoUsuario === "CLIENTE"
                    ? entidadeId
                    : cliente,

            Barbeiro:
                tipoUsuario === "BARBEIRO"
                    ? entidadeId
                    : barbeiro,

            Servicos: servicosSelecionados,

            data,

            hora
        };

        console.log("DADOS ENVIADOS:", dados);

        const response = await fetch(
            `${API_URL}/agendar`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(dados)
            }
        );

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(
                resultado?.message ||
                resultado?.erro ||
                resultado?.error ||
                "Não foi possível realizar o agendamento."
            );
        }

        setSucesso(
            "Agendamento criado com sucesso! Realize o pagamento do PIX para confirmar."
        );

        setQrCode(
            resultado?.pagamento?.qrCode ||
            resultado?.qrCode ||
            ""
        );

        setQrCodeBase64(
            resultado?.pagamento?.qrCodeBase64 ||
            resultado?.qrCodeBase64 ||
            ""
        );

    } catch (error) {
        console.error(error);

        setErro(
            error.message ||
            "Erro ao realizar agendamento."
        );
    } finally {
        setEnviando(false);
    }
}

  return (
    <main className="agendamento-page">
      <div className="agendamento-container">

        <div className="agendamento-header">
          <div>
            <span className="agendamento-tag">
              BRUTUS SYSTEM
            </span>

            <h1>Agendamento</h1>

            <p>
              Escolha o barbeiro, os serviços, a data e o melhor horário para você.
            </p>
          </div>
        </div>

        <div className="agendamento-card">

          <div className="agendamento-steps">

            <div className="agendamento-step active">
              <span>01</span>
              <div>
                <strong>Barbeiro</strong>
                <small>Escolha o profissional</small>
              </div>
            </div>

            <div className="agendamento-step-line"></div>

            <div
              className={
                `agendamento-step ${
                  servicosSelecionados.length > 0 ? "active" : ""
                }`
              }
            >
              <span>02</span>
              <div>
                <strong>Serviços</strong>
                <small>Escolha os serviços</small>
              </div>
            </div>

            <div className="agendamento-step-line"></div>

            <div
              className={
                `agendamento-step ${
                  data ? "active" : ""
                }`
              }
            >
              <span>03</span>
              <div>
                <strong>Data</strong>
                <small>Escolha o dia</small>
              </div>
            </div>

            <div className="agendamento-step-line"></div>

            <div
              className={
                `agendamento-step ${
                  hora ? "active" : ""
                }`
              }
            >
              <span>04</span>
              <div>
                <strong>Horário</strong>
                <small>Escolha o horário</small>
              </div>
            </div>

          </div>

          {carregando ? (
            <div className="agendamento-loading">
              <div className="loading-spinner"></div>
              <p>Carregando informações...</p>
            </div>
          ) : (
            <>
              <section className="agendamento-section">

               {tipo === "CLIENTE" ? (
    <section className="agendamento-section">
        <div className="section-title">
            <div className="section-number">01</div>

            <div>
                <h2>Escolha o barbeiro</h2>
                <p>
                    Selecione o profissional que irá realizar
                    seu atendimento.
                </p>
            </div>
        </div>

        <div className="barbeiros-grid">
            {barbeiros.map((item) => {
                const id = getId(item);
                const selecionado = barbeiro === id;

                return (
                    <button
                        type="button"
                        key={id}
                        className={`barbeiro-card ${
                            selecionado ? "selected" : ""
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

                            <span>Barbeiro</span>
                        </div>

                        <div className="selection-check">
                            {selecionado ? "✓" : ""}
                        </div>
                    </button>
                );
            })}
        </div>
    </section>
) : (
    <section className="agendamento-section">
        <div className="section-title">
            <div className="section-number">01</div>

            <div>
                <h2>Escolha o cliente</h2>
                <p>
                    Selecione o cliente para o atendimento.
                </p>
            </div>
        </div>

        <div className="barbeiros-grid">
            {clientes.map((item) => {
                const id = getId(item);
                const selecionado = cliente === id;

                return (
                    <button
                        type="button"
                        key={id}
                        className={`barbeiro-card ${
                            selecionado ? "selected" : ""
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
                                {item?.nome} {item?.sobrenome}
                            </strong>

                            <span>Cliente</span>
                        </div>

                        <div className="selection-check">
                            {selecionado ? "✓" : ""}
                        </div>
                    </button>
                );
            })}
        </div>
    </section>
)}

              </section>

              <section className="agendamento-section">

                <div className="section-title">
                  <div className="section-number">02</div>

                  <div>
                    <h2>Escolha os serviços</h2>
                    <p>Você pode selecionar mais de um serviço.</p>
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
                        servicosSelecionados.includes(id);

                      return (
                        <button
                          type="button"
                          key={id}
                          className={
                            `servico-card ${
                              selecionado ? "selected" : ""
                            }`
                          }
                          onClick={() => selecionarServico(id)}
                        >

                          <div className="servico-check">
                            {selecionado ? "✓" : ""}
                          </div>

                          <div className="servico-content">
                            <strong>
                              {getNomeServico(servico)}
                            </strong>

                            <span>
                              {getDuracaoServico(servico)} minutos
                            </span>
                          </div>

                          <div className="servico-preco">
                            R$ {getPrecoServico(servico).toFixed(2).replace(".", ",")}
                          </div>

                        </button>
                      );
                    })
                  )}

                </div>

              </section>

              <section className="agendamento-section">

                <div className="section-title">
                  <div className="section-number">03</div>

                  <div>
                    <h2>Escolha a data</h2>
                    <p>Selecione o dia do seu atendimento.</p>
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
                      setData(event.target.value);
                      setHora("");
                      setErro("");
                    }}
                  />

                </div>

              </section>

              <section className="agendamento-section">

                <div className="section-title">
                  <div className="section-number">04</div>

                  <div>
                    <h2>Escolha o horário</h2>
                    <p>
                      Horários disponíveis a cada 30 minutos.
                    </p>
                  </div>
                </div>

                {!data ? (
                  <div className="horario-empty">
                    <span>📅</span>
                    <p>
                      Selecione uma data para visualizar os horários.
                    </p>
                  </div>
                ) : (
                  <div className="horarios-grid">

                    {horarios.map((horario) => (
                      <button
                        type="button"
                        key={horario}
                        className={
                          `horario-button ${
                            hora === horario ? "selected" : ""
                          }`
                        }
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

              <section className="resumo-card">

                <div className="resumo-header">
                  <div>
                    <span>RESUMO</span>
                    <h2>Seu agendamento</h2>
                  </div>

                  <div className="resumo-icon">
                    ✓
                  </div>
                </div>

                <div className="resumo-body">

                  <div className="resumo-row">
                    <span>Barbeiro</span>
                    <strong>
                      {barbeiro
                        ? getNomeBarbeiro(
                            barbeiros.find(
                              (item) => getId(item) === barbeiro
                            )
                          )
                        : "Não selecionado"}
                    </strong>
                  </div>

                  <div className="resumo-row">
                    <span>Serviços</span>

                    <strong>
                      {servicosSelecionados.length === 0
                        ? "Nenhum serviço"
                        : `${servicosSelecionados.length} ${
                            servicosSelecionados.length === 1
                              ? "serviço"
                              : "serviços"
                          }`}
                    </strong>
                  </div>

                  <div className="resumo-row">
                    <span>Data</span>

                    <strong>
                      {formatarData(data)}
                    </strong>
                  </div>

                  <div className="resumo-row">
                    <span>Horário</span>

                    <strong>
                      {hora || "Não selecionado"}
                    </strong>
                  </div>

                  <div className="resumo-row">
                    <span>Duração</span>

                    <strong>
                      {duracaoTotal > 0
                        ? `${duracaoTotal} minutos`
                        : "Não calculada"}
                    </strong>
                  </div>

                </div>

                <div className="resumo-total">
                  <span>Total dos serviços</span>

                  <strong>
                    R$ {valorTotal.toFixed(2).replace(".", ",")}
                  </strong>
                </div>

              </section>

              {erro && (
                <div className="message error">
                  <span>!</span>
                  {erro}
                </div>
              )}

              {sucesso && (
                <div className="message success">
                  <span>✓</span>
                  {sucesso}
                </div>
              )}

              {qrCodeBase64 && (
                <div className="pix-card">

                  <div className="pix-header">
                    <div>
                      <span>PIX</span>
                      <h2>Pagamento do sinal</h2>
                    </div>
                  </div>

                  <p>
                    Escaneie o QR Code abaixo para realizar o pagamento.
                  </p>

                  <img
                    src={`data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="pix-qrcode"
                  />

                  {qrCode && (
                    <div className="pix-code">
                      <span>Código PIX</span>

                      <textarea
                        value={qrCode}
                        readOnly
                      />
                    </div>
                  )}

                </div>
              )}

              <div className="agendamento-footer">

                <div className="footer-info">
                  <span className="footer-lock">🔒</span>

                  <div>
                    <strong>Pagamento seguro</strong>
                    <small>
                      Você pagará apenas R$ 15,00 de sinal.
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-confirmar"
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

              </div>

            </>
          )}

        </div>

      </div>
    </main>
  );
}