import { Link } from "react-router-dom";


export default function Menu() {
  return (
    <nav className="menu">
      <ul>
        <li><Link to="/servico">Cadastrar Serviço</Link></li>
        <li><Link to="/cliente">Cadastrar Cliente</Link></li>
        <li><Link to="/barbeiro">Cadastrar Barbeiros</Link></li>
      </ul>
    </nav>
  );
}