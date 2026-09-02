import Header from "./Header";
import MenuLateral from "./MenuLateral";

import { useLocation } from "react-router-dom";

export default function Layout({ children }) {
    const location = useLocation();

    const tipo = localStorage.getItem("tipo");
    const token = localStorage.getItem("token");

    const logado = !!token;

    const rotasAdministrativas = [
        "/dashboard",
        "/Agendamento",
        "/cliente",
        "/barbeiro",
        "/servico",
        "/relatorios",
        "/configuracoes",
    ];

    const estaNaAreaAdministrativa =
        rotasAdministrativas.includes(location.pathname);

    const usuarioAdministrativo =
        tipo === "ADMIN" ||
        tipo === "BARBEIRO";

    const mostrarMenuLateral =
        logado &&
        usuarioAdministrativo &&
        estaNaAreaAdministrativa;

    return (
        <div
            className={
                mostrarMenuLateral
                    ? "layout-logado"
                    : "layout-publico"
            }
        >
            {mostrarMenuLateral ? (
                <MenuLateral />
            ) : (
                <Header />
            )}

            <main
                className={
                    mostrarMenuLateral
                        ? "conteudo-logado"
                        : "conteudo-publico"
                }
            >
                {children}
            </main>
        </div>
    );
}