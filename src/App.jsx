import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import ServicoList from "./views/ServicoList";
import Barbeiros from "./views/Barbeiros";
import Cliente from "./views/Cliente";
import Home from "./views/HomePage";
import Login from "./views/Login";
import Cadastro from "./views/Cadastro";
import ProtectedRoute from "../Protected/ProtectedRoute";
import CadastroAdmin from "./views/CadastroAdmin";
import AgendamentoPage from "./views/Agendar";
import DetalhesBarbeiro from "./views/DetalhesBarbeiro";
import HomeCliente from "./views/HomeCliente";
import CalendarioAgendamentos from "./views/Agendamentos";
import RelatorioFinanceiro from "./views/Relatorio";
import GerenciarHorarios from "./views/GerenciarHorarios";

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    
                    {/* Agenda / calendário — rota canônica lowercase */}
                    <Route
                        path="/agendamento"
                        element={<CalendarioAgendamentos/>}
                    />
                    {/* Alias com A maiúsculo para compatibilidade com links antigos */}
                    <Route
                        path="/Agendamento"
                        element={<CalendarioAgendamentos/>}
                    />

                    <Route
                        path="/cadastro"
                        element={<Cadastro />}
                    />

                    {/* Fluxo de novo agendamento */}
                    <Route
                        path="/agendar"
                        element={<AgendamentoPage />}
                    />
                    {/* Alias com A maiúsculo */}
                    <Route
                        path="/Agendar"
                        element={<AgendamentoPage />}
                    />

                    {/* Rotas do menu BARBEIRO */}
                    <Route
                        path="/inicio"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <CalendarioAgendamentos />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/minha-agenda"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <CalendarioAgendamentos />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/barbeiros/:id"
                        element={<DetalhesBarbeiro />}
                    />

                    <Route
                        path="/cliente"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <Cliente />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cliente-home"
                        element={<HomeCliente />}
                    />

                    <Route
                        path="/cadastro-admin"
                        element={
                            <ProtectedRoute allowed={["ADMIN"]}>
                                <CadastroAdmin />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/barbeiro"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <Barbeiros />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/servico"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <ServicoList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/relatorios"
                        element={
                            <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
                                <RelatorioFinanceiro />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/horarios-barbeiro"
                        element={
                            <ProtectedRoute allowed={["ADMIN"]}>
                                <GerenciarHorarios />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;