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
        onClick={() => console.log("CLIQUE NA LOGO")}
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