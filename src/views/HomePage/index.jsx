import React from "react";
import "./index.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      {/* HERO */}
      <section className="hero">
        <div className="overlay">
          <h1>Seu estilo começa aqui</h1>
          <p>Cortes modernos e atendimento premium</p>

          {/* BLOCO COM IMAGEM + TEXTO */}
          <div className="info-box">
            <img
              src="https://images.unsplash.com/photo-1512690459411-b9245aed614b"
              alt="barbearia"
            />

            <div className="info-text">
              <h2>Sobre a Barbearia</h2>
              <p>
                Aqui no Brutus System, oferecemos uma experiência completa para
                o seu estilo. Profissionais qualificados, ambiente moderno e
                atendimento de qualidade.
              </p>

              <h3>Horários</h3>
              <ul>
                <li>Seg - Sex: 09h às 19h</li>
                <li>Sábado: 09h às 17h</li>
                <li>Domingo: Fechado</li>
              </ul>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="buttons">
            <button className="btn-primary"><Link to="/Login">Login</Link> </button>
            <button className="btn-outline"><Link to="/cadastro">Cadastre-se</Link></button>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section className="sobre">
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1"
          alt="sobre"
        />
        <div>
          <h2>Sobre nós</h2>
          <p>
            Somos uma barbearia moderna focada em estilo, qualidade e conforto.
          </p>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="servicos">
        <h2>Serviços</h2>
        <div className="cards">
          {["Corte", "Barba", "Combo"].map((item, i) => (
            <div className="card" key={i}>
              <h3>{item}</h3>
              <p>Serviço profissional</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Agende seu horário</h2>
        <button className="btn-primary">Agendar</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 Brutus System - Barbearia
      </footer>
    </div>
  );
}
