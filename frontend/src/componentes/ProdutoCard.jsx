import { Link } from "react-router-dom";
import { moeda } from "../lib/formato";
import "./ProdutoCard.css";

export default function ProdutoCard({ produto, indice = 0 }) {
  const temVariacao = produto.variacoes?.length > 0;
  return (
    <Link
      to={`/produto/${produto.id}`}
      className="produto-card surgir"
      style={{ animationDelay: `${indice * 60}ms` }}
    >
      <div className="produto-card__foto">
        <img src={produto.foto_url} alt={produto.nome} loading="lazy" />
        {produto.sob_encomenda && (
          <span className="produto-card__selo">Sob encomenda</span>
        )}
      </div>
      <div className="produto-card__corpo">
        <h3 className="produto-card__nome">{produto.nome}</h3>
        <p className="produto-card__desc">{produto.descricao}</p>
        <div className="produto-card__rodape">
          <span className="produto-card__preco">
            {temVariacao && <em>a partir de </em>}
            {moeda(produto.preco_base)}
          </span>
          <span className="produto-card__seta" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
