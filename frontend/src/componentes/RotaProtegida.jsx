import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../conta/AuthContexto";
import Botao from "./Botao";
import "../conta/conta.css";

function Painel({ children }) {
  return <div className="container aviso-auth">{children}</div>;
}

export default function RotaProtegida({ children, exigirAdmin = false }) {
  const { usuario, ehAdmin, carregando, configurado } = useAuth();
  const local = useLocation();

  if (!configurado) {
    return (
      <Painel>
        <div className="aviso-auth__cartao">
          <div className="aviso-auth__emoji">🔌</div>
          <h1>Supabase ainda não conectado</h1>
          <p>
            Esta área precisa do banco de dados. Configure as chaves do Supabase
            no <code>.env</code> para entrar e usar o painel.
          </p>
          <Botao como="link" para="/" variante="secundario">
            Voltar ao catálogo
          </Botao>
        </div>
      </Painel>
    );
  }

  if (carregando) {
    return (
      <Painel>
        <div className="aviso-auth__cartao">
          <div className="carregando-anel" />
          <p>Carregando…</p>
        </div>
      </Painel>
    );
  }

  if (!usuario) {
    return <Navigate to="/entrar" state={{ de: local.pathname }} replace />;
  }

  if (exigirAdmin && !ehAdmin) {
    return (
      <Painel>
        <div className="aviso-auth__cartao">
          <div className="aviso-auth__emoji">🔒</div>
          <h1>Acesso restrito</h1>
          <p>Esta área é exclusiva da administração da doceria.</p>
          <Botao como="link" para="/" variante="secundario">
            Voltar ao catálogo
          </Botao>
        </div>
      </Painel>
    );
  }

  return children;
}
