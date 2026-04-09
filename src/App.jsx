import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import ServicoList from "./views/ServicoList";
import Barbeiros from "./views/Barbeiros";
import Cliente from "./views/Cliente";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/servico" element={<ServicoList />} />
          <Route path="/cliente" element={<Cliente />} />
          <Route path="/barbeiro" element={<Barbeiros />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;