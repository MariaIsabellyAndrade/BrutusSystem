import { Navigate } from "react-router-dom";



export default function ProtectedRoute({ children, allowed }) {
  const token = sessionStorage.getItem("token");
  const tipo = sessionStorage.getItem("tipo");


  if (!token) {
    return <Navigate to="/login" />;
  }


  if (allowed && !allowed.includes(tipo)) {
    return <Navigate to="/" />;
  }

  return children;
}
