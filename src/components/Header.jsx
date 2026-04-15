import logo from "../assets/logo.png";
import "./Header.css";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="header">
      <a href="http://localhost:5173/" target="_blank" rel="noopener noreferrer">
      <img src={logo} alt="Brutus System" className="logo" /></a>
      <Menu></Menu>
    </header>
  );
}