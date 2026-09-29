import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";
import Menu from "./Menu";

export default function Header() {
  return (
    <header className="header">

      <Link
        to="/"
        className="logo-link"
      >
        <img
          src={logo}
          alt="Brutus System"
          className="logo"
        />
      </Link>

      <Menu />

    </header>
  );
}