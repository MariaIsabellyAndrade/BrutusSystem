import logo from "../assets/logo.png";
import "./Header.css";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="header">
      <img src={logo} alt="Brutus System" className="logo" />
      <Menu></Menu>
    </header>
  );
}