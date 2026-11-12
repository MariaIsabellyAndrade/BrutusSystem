import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { listarNotificacoesHorarios } from "../service/serviceBarbeiro";
import "./MenuLateral.css";

export default function MenuLateral() {
    const tipo = sessionStorage.getItem("tipo")?.trim().toUpperCase();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileAberto, setMobileAberto] = useState(false);
    const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
    const [mostrarNotificacao, setMostrarNotificacao] = useState(false);
    const contagemAnterior = useRef(null);

    // Fecha o menu mobile quando a rota muda
    useEffect(() => {
        setMobileAberto(false);
    }, [location.pathname]);

    useEffect(() => {
        if (tipo !== "ADMIN") return undefined;

        let ativo = true;
        const atualizarNotificacoes = async () => {
            try {
                const notificacoes = await listarNotificacoesHorarios(true);
                if (!ativo) return;
                if (contagemAnterior.current !== null && notificacoes.length > contagemAnterior.current) {
                    setMostrarNotificacao(true);
                    window.setTimeout(() => setMostrarNotificacao(false), 7000);
                }
                contagemAnterior.current = notificacoes.length;
                setNotificacoesNaoLidas(notificacoes.length);
            } catch (error) {
                console.error("Erro ao buscar notificações de horários:", error);
            }
        };

        const atualizarAposLeitura = () => atualizarNotificacoes();
        window.addEventListener("horarios-notificacoes-atualizadas", atualizarAposLeitura);
        atualizarNotificacoes();
        const intervalo = window.setInterval(atualizarNotificacoes, 30000);
        return () => {
            ativo = false;
            window.clearInterval(intervalo);
            window.removeEventListener("horarios-notificacoes-atualizadas", atualizarAposLeitura);
        };
    }, [tipo]);

    useEffect(() => {
        if (tipo === "ADMIN" && location.pathname === "/bloqueios-horarios") {
            setNotificacoesNaoLidas(0);
        }
    }, [tipo, location.pathname]);

    const menus = {
        ADMIN: [
            { label: "Dashboard", path: "/dashboard", icon: "▦" },
            { label: "Agendar", path: "/agendar", icon: "▣" },
            { label: "Agendamentos", path: "/agendamento", icon: "▣" },
            { label: "Bloqueios", path: "/bloqueios-horarios", icon: "⏱", badge: notificacoesNaoLidas },
            { label: "Clientes", path: "/cliente", icon: "♧" },
            { label: "Barbeiros", path: "/barbeiro", icon: "✂" },
            { label: "Serviços", path: "/servico", icon: "✧" },
            { label: "Estoque", path: "/estoque", icon: "▤" },
            { label: "Relatórios", path: "/relatorios", icon: "↗" },
            { label: "Despesas", path: "/despesas", icon: "＄" },
            { label: "Configurações", path: "/configuracoes", icon: "⚙" },
        ],
        BARBEIRO: [
            { label: "Início", path: "/inicio", icon: "▦" },
            { label: "Minha agenda", path: "/minha-agenda", icon: "▣" },
            { label: "Meus horários", path: "/horarios-barbeiro", icon: "⏱" },
            { label: "Agendar", path: "/agendar", icon: "▣" },
            { label: "Relatórios", path: "/relatorios", icon: "↗" },
            { label: "Estoque", path: "/estoque", icon: "▤" },
            { label: "Registrar despesa", path: "/despesas", icon: "＄" },
            { label: "Meu perfil", path: "/meu-perfil", icon: "⚙" },
        ],
        CLIENTE: [
            { label: "Início", path: "/cliente-home", icon: "▦" },
            { label: "Novo agendamento", path: "/agendar", icon: "▣" },
            { label: "Agenda", path: "/agendamento", icon: "▤" },
        ],
    };

    const menuAtual = menus[tipo] || [];

    function sair() {
        ["token", "tipo", "entidadeId"].forEach((chave) => sessionStorage.removeItem(chave));
        ["token", "tipo", "entidadeId", "cliente"].forEach((chave) => localStorage.removeItem(chave));
        navigate("/login", { replace: true });
    }

    let nomePerfil = "";
    if (tipo === "ADMIN") {
        nomePerfil = "GESTOR";
    } else if (tipo === "BARBEIRO") {
        nomePerfil = "BARBEIRO";
    } else if (tipo === "CLIENTE") {
        nomePerfil = "CLIENTE";
    }

    return (
        <>
            {/* CABEÇALHO MOBILE / TABLET COM BOTÃO HAMBÚRGUER */}
            <div className="menu-lateral-mobile-bar">
                <div className="mobile-bar-brand">
                    <div className="logo-icone-sm">✂</div>
                    <strong>BRUTUS <span>SYSTEM</span></strong>
                </div>

                <button
                    type="button"
                    className="hamburger-button"
                    aria-label="Abrir Menu"
                    onClick={() => setMobileAberto(!mobileAberto)}
                >
                    {mobileAberto ? "✕" : "☰"}
                </button>
            </div>

            {/* OVERLAY DE BACKDROP NO MOBILE */}
            {mobileAberto && (
                <div
                    className="menu-lateral-overlay"
                    onClick={() => setMobileAberto(false)}
                />
            )}

            {/* ASIDE SIDEBAR */}
            <aside className={`menu-lateral ${mobileAberto ? "mobile-aberto" : ""}`}>
                {/* BOTÃO DE FECHAR NO MOBILE */}
                <button
                    type="button"
                    className="menu-lateral-close-btn"
                    onClick={() => setMobileAberto(false)}
                    aria-label="Fechar Menu"
                >
                    ✕
                </button>

                {/* LOGO */}
                <div className="menu-logo">
                    <div className="logo-icone">✂</div>
                    <div className="logo-texto">
                        <strong>
                            BRUTUS <span>SYSTEM</span>
                        </strong>
                        <small>BARBER MANAGEMENT</small>
                    </div>
                </div>

                {/* PERFIL ATIVO */}
                <div className="perfil-ativo">
                    <span className="perfil-titulo">PERFIL ATIVO</span>
                    <div className="perfil-tipo">
                        <strong>{nomePerfil}</strong>
                        <span className="perfil-seta">⌄</span>
                    </div>
                </div>

                {/* MENU */}
                <nav className="menu-lateral-links">
                    {menuAtual.map((item) => {
                        const ativo = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`menu-lateral-link ${ativo ? "ativo" : ""}`}
                                onClick={() => setMobileAberto(false)}
                            >
                                <span className="menu-icone">{item.icon}</span>
                                <span>{item.label}</span>
                                {item.badge > 0 && <span className="menu-notificacao-badge">{item.badge}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {tipo === "ADMIN" && mostrarNotificacao && (
                    <button
                        type="button"
                        className="menu-notificacao-toast"
                        onClick={() => {
                            setMostrarNotificacao(false);
                            navigate("/bloqueios-horarios");
                        }}
                    >
                        Nova alteração de horário. Ver detalhes
                    </button>
                )}

                {/* RODAPÉ STATUS */}
                <div className="menu-lateral-footer">
                    <span className="footer-status"></span>
                    <span>Sistema Online</span>
                </div>
                <button type="button" className="menu-lateral-logout" onClick={sair}>
                    <LogOut size={16} />
                    <span>Sair da conta</span>
                </button>
            </aside>
        </>
    );
}
