
import Header from "./Header";
import MenuLateral from "./MenuLateral";
import { useLocation } from "react-router-dom";
import "./Layout.css";

export default function Layout({ children }) {
    const location = useLocation();

    const tipo = localStorage.getItem("tipo")?.trim().toUpperCase();
    const token = localStorage.getItem("token");

    const logado = !!token;

    const usuarioAdministrativo =
        tipo === "ADMIN" ||
        tipo === "BARBEIRO";

    const mostrarMenuLateral =
        logado && usuarioAdministrativo;

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

