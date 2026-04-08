
import CadastroBrutus from "./Barbeiro/CadastroBrutus";
import ListaBarbeiros from "./Barbeiro/ListaBarbeiros";
import CadastroServico from "./Servicos/CadastrarServico";
import ListaServicos from "./Servicos/ListaServico";
import React from "react";
import ReactDOM from 'react-dom/client'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ListaServicos/>
  </React.StrictMode>
)

/*function App() {
  return <ListaServicos/>;
}*/

export default App;