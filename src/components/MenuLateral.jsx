import { Link, useLocation } from "react-router-dom";
import "./MenuLateral.css";

export default function MenuLateral() {
    const tipo = localStorage.getItem("tipo")?.trim().toUpperCase();
    const location = useLocation();

    const menus = {
        ADMIN: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: "▦",
            },
            {
                label: "Agendamentos",
                path: "/Agendamento",
                icon: "▣",
            },
            {
                label: "Clientes",
                path: "/cliente",
                icon: "♧",
            },
            {
                label: "Barbeiros",
                path: "/barbeiro",
                icon: "✂",
            },
            {
                label: "Serviços",
                path: "/servico",
                icon: "✧",
            },
            {
                label: "Relatórios",
                path: "/relatorios",
                icon: "↗",
            },
            {
                label: "Configurações",
                path: "/configuracoes",
                icon: "⚙",
            },
        ],

        BARBEIRO: [
            {
                label: "Início",
                path: "/inicio",
                icon: "▦",
            },
            {
                label: "Minha agenda",
                path: "/minha-agenda",
                icon: "▣",
            },
            {
                label: "Meu perfil",
                path: "/meu-perfil",
                icon: "⚙",
            },
        ],

        CLIENTE: [
            {
                label: "Agendamentos",
                path: "/Agendamento",
                icon: "▣",
            },
            {
                label: "Meus agendamentos",
                path: "/meus-agendamentos",
                icon: "▤",
            },
            {
                label: "Configurações",
                path: "/configuracoes",
                icon: "⚙",
            },
        ],
    };

    const menuAtual = menus[tipo] || [];

    let nomePerfil = "";

    if (tipo === "ADMIN") {
        nomePerfil = "GESTOR";
    } else if (tipo === "BARBEIRO") {
        nomePerfil = "BARBEIRO";
    } else if (tipo === "CLIENTE") {
        nomePerfil = "CLIENTE";
    }

    return (
        <aside className="menu-lateral">

            {/* LOGO */}
            <div className="menu-logo">
                <div className="logo-icone">
                    ✂
                </div>

                <div className="logo-texto">
                    <strong>
                        BRUTUS <span>SYSTEM</span>
                    </strong>

                    <small>
                        BARBER MANAGEMENT
                    </small>
                </div>
            </div>

            {/* PERFIL ATIVO */}
            <div className="perfil-ativo">
                <span className="perfil-titulo">
                    PERFIL ATIVO
                </span>

                <div className="perfil-tipo">
                    <strong>
                        {nomePerfil}
                    </strong>

                    <span className="perfil-seta">
                        ⌄
                    </span>
                </div>
            </div>

            {/* MENU */}
            <nav className="menu-lateral-links">
                {menuAtual.map((item) => {
                    const ativo =
                        location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`menu-lateral-link ${
                                ativo ? "ativo" : ""
                            }`}
                        >
                            <span className="menu-icone">
                                {item.icon}
                            </span>

                            <span>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

        </aside>
    );
}