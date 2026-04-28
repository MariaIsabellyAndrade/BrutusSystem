import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import ServicoList from "./views/ServicoList";
import Barbeiros from "./views/Barbeiros";
import Cliente from "./views/Cliente";
import Home from "./views/HomePage";
import Login from "./views/Login";
import Cadastro from "./views/Cadastro";
import ProtectedRoute from "../Protected/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Layout>
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/cadastro" element={<Cadastro />} />


  <Route
    path="/cliente"
    element={
      <ProtectedRoute allowed={["BARBEIRO", "ADMIN"]}>
        <Cliente />
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