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


                    
                    <Route
                        path="/Agendamento"
                        element={<CalendarioAgendamentos/>}
                    />

                    <Route
                        path="/cadastro"
                        element={<Cadastro />}
                    />

                    <Route
                        path="/Agendar"
                        element={<AgendamentoPage />}
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

                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;