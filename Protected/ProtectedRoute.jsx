import { Navigate } from "react-router-dom";



export default function ProtectedRoute({ children, allowed }) {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (allowed && !allowed.includes(tipo)) {
    return <Navigate to="/" />;
  }

  return children;
}