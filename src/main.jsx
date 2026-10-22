import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Remove credenciais antigas que ficaram persistidas pelo localStorage.
// A sessão nova é temporária e termina quando a aba do navegador é fechada.
["token", "tipo", "entidadeId"].forEach((chave) => localStorage.removeItem(chave));

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
