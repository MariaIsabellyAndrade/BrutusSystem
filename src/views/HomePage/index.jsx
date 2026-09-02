import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import "./index.css";
import {listarServicos} from "../../service/serviceServico"
import{listarBarbeiros} from "../../service/serviceBarbeiro"



function Home() {

const [servicos, setServicos] = useState([]);
const [carregandoServicos, setCarregandoServicos] = useState(true);

useEffect(() => {
  const carregarServicos = async () => {
    try {
      const response = await listarServicos();

      // Só mostra serviços ativos
      const servicosAtivos = response.data.filter(
        (servico) => servico.ativo === true
      );

      setServicos(servicosAtivos);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setCarregandoServicos(false);
    }
  };

  carregarServicos();
}, []);



const [profissionais, setProfissionais] = useState([]);

useEffect(() => {
  const carregarProfissionais = async () => {
    try {
      const response = await listarBarbeiros();

      const profissionaisAtivos = response.data.filter(
        (profissional) => profissional.ativo === true
      );

      setProfissionais(profissionaisAtivos);
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error);
    }
  };

  carregarProfissionais();
}, []);


  return (
    <div className="home">



      {/* ================= HERO ================= */}
      <main>

        <section className="hero">

          <div className="hero-content">

            <div className="hero-copy">

              <span className="eyebrow">
                BARBEARIA BRUTUS
              </span>

              <h1>
                Seu proximo 
                <br />
                corte
                <br />
                <span>começa aqui.</span>
              </h1>

              <p>
                Agende seu horário de forma rápida e prática e escolha o melhor momento para cuidar do seu estilo.
              </p>

              <div className="hero-actions">
<Link
  to={localStorage.getItem("token") ? "/agendamento" : "/login"}
  className="button-primary"
>
  AGENDAR HORÁRIO
  <span>→</span>
</Link>

                <a href="#sobre" className="button-secondary">
                  Conhecer a barbearia
                  <span>→</span>
                </a>

              </div>

            </div>

            <div className="hero-image">

            <img src="/image.png" alt="Brutus System"></img>

              <div className="hero-image-overlay"></div>

              <div className="hero-image-caption">
                <span></span>
                <p>Seu corte, seu estilo, seu momento.</p>
              </div>

            </div>

          </div>

        </section>

        {/* ================= ESSÊNCIA ================= */}
        <section id="sobre" className="essencia">

          <div className="section-grid">

            <div className="section-title">

              <span className="eyebrow">
                A NOSSA ESSÊNCIA
              </span>

              <h2>
                Mais que uma
                <br />
                barbearia.
                <br />

                <span>Uma experiência.</span>
              </h2>

            </div>

            <div className="essencia-content">

              <p className="large-text">
                Desde 2020, a Brutus transforma cortes em experiências. Criada para valorizar o estilo, a personalidade e a confiança de cada cliente, nossa barbearia une tradição, técnica e um atendimento pensado para tornar cada momento especial.

              </p>

              <div className="stats">

                <div className="stat">
                  <strong>+8</strong>
                  <span>ANOS DE EXPERIÊNCIA</span>
                </div>

                <div className="stat">
              <strong>2020</strong>
              <span>DESDE ENTÃO, CUIDANDO DO SEU ESTILO</span>
                </div>

                <div className="stat">
                <strong>1</strong>
  <span>PROPÓSITO: VALORIZAR SEU ESTILO</span>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= SERVIÇOS ================= */}
        <section id="servicos" className="servicos">
  <div className="services-header">
    <div>
      <span className="eyebrow">
        NOSSOS SERVIÇOS
      </span>

      <h2>
        Serviços pensados
        <br />
        para <span>você.</span>
      </h2>
    </div>

    <p>
      Encontre o serviço ideal
      <br />
      para cuidar do seu estilo.
    </p>
  </div>

  <div className="services-grid">
    {servicos.map((servico, index) => (
      <article
        className="service-card"
        key={servico._id}
      >
        <div className="service-top">
          <span className="service-icon">✂</span>

          <span className="service-number">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="service-body">
          <h3>{servico.nome}</h3>

          <p>{servico.descricao}</p>
        </div>

        <div className="service-footer">
          <span>{servico.duracao} min</span>

          <strong>
            R$ {Number(servico.valor).toFixed(2).replace(".", ",")}
          </strong>
        </div>

        <Link
          to="/cadastro"
          className="service-link"
        >
          AGENDAR
          <span>→</span>
        </Link>
      </article>
    ))}
  </div>
</section>

        {/* ================= PROFISSIONAIS ================= */}
<section id="profissionais" className="profissionais">
  <div className="professionals-header">
    <div>
      <span className="eyebrow">
        Nosso profissional
      </span>

      <h2>
        Profissional que
        <br />
        entendem de <span>estilo.</span>
      </h2>
    </div>
  </div>

  <div className="professionals-grid">
    {profissionais.map((profissional) => (
      <article
        className="professional-card"
        key={profissional._id}
      >
        <div className="professional-photo">
          {profissional.foto ? (
            <img
              src={`http://localhost:3000/uploads/${profissional.foto}`}
              alt={`${profissional.nome} ${profissional.sobrenome}`}
            />
          ) : (
            <span>
              {profissional.nome?.charAt(0)}
              {profissional.sobrenome?.charAt(0)}
            </span>
          )}
        </div>

        <div className="professional-info">
          <h3>
            {profissional.nome} {profissional.sobrenome}
          </h3>
        </div>
      </article>
    ))}
  </div>
</section>

        {/* ================= COMO FUNCIONA ================= */}
        <section
          id="como-funciona"
          className="como-funciona"
        >

          <div className="how-header">

            <span className="eyebrow">
              SIMPLES ASSIM
            </span>

            <h2>
              Seu próximo corte
              <br />
              começa em <span>três passos.</span>
            </h2>

          </div>

          <div className="steps">

            <div className="step">
              <span>01</span>

              <h3>
                Escolha seu serviço
              </h3>

              <p>
                Encontre o serviço ideal para você.
              </p>

              <b>→</b>
            </div>

            {/* <div className="step">
              <span>02</span>

              <h3>
                Escolha seu barbeiro
              </h3>

              <p>
                Selecione o profissional de sua preferência.
              </p>

              <b>→</b>
            </div> */}

            <div className="step">
              <span>02</span>

              <h3>
                Escolha o melhor horário
              </h3>

              <p>
                Consulte a agenda e encontre um horário disponível.
              </p>

              <b>→</b>
            </div>

            <div className="step">
              <span>03</span>

              <h3>
                Confirme seu agendamento
              </h3>

              <p>
                Faça o pagamento e pronto. Seu horário está reservado.
              </p>

              <b>✓</b>
            </div>

          </div>

        </section>

        {/* ================= CTA ================= */}
        <section className="final-cta">

          <div className="cta-content">

            <span className="eyebrow">
              BRUTUS SYSTEM
            </span>

            <h2>
              Seu próximo corte
              <br />
              começa <span>aqui.</span>
            </h2>

            <p>
              Escolha seu serviço e horário.
              <br />
              O resto deixa com a gente.
            </p>

            <Link
              to="/cadastro"
              className="button-primary"
            >
              AGENDAR HORÁRIO
              <span>→</span>
            </Link>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-content">

          <div className="footer-brand">

            <div className="brand-text">
             <img src="/logo.png" alt="Brutus System" style={{ width: "120px", height: "auto" }} />
            </div>

          </div>

          <div className="footer-description">
            Mais que um corte,
            <br />
            é o seu momento.
          </div>

          <div className="footer-contact">
            <span>⌖</span>
            <p>
              Av. Manoel Motta 335 
              <br />
              Tupã - SP
            </p>
          </div>

          <div className="footer-contact">
            <span>◯</span>
            <p>
              (14) 99775-1537
            </p>
          </div>

          <div className="footer-contact">
            <span>◎</span>
            <p>
              @brutuuss.barbearia
            </p>
          </div>

        </div>

        <div className="footer-bottom">
          © 2026 Brutus System. Todos os direitos reservados.
        </div>

      </footer>

    </div>
  );
}

export default Home;