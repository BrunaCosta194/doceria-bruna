import { Link, NavLink } from "react-router-dom";
import { useCarrinho } from "../loja/CarrinhoContexto";
import "./Cabecalho.css";

export default function Cabecalho() {
  const { quantidadeTotal } = useCarrinho();

  return (
    <header className="cabecalho">
      <div className="container cabecalho__linha">
        <Link to="/" className="marca" aria-label="Doceria da Bruna — início">
          <span className="marca__selo" aria-hidden="true">
            B
          </span>
          <span className="marca__nome">
            Doceria <em>da Bruna</em>
          </span>
        </Link>

        <nav className="cabecalho__nav" aria-label="Principal">
          <NavLink to="/" end className="cabecalho__link">
            Catálogo
          </NavLink>
          <NavLink to="/conta/meus-pedidos" className="cabecalho__link">
            Meus pedidos
          </NavLink>
        </nav>

        <Link to="/carrinho" className="carrinho-botao" aria-label="Ver carrinho">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {quantidadeTotal > 0 && (
            <span className="carrinho-botao__badge">{quantidadeTotal}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
