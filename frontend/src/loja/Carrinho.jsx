import { Link } from "react-router-dom";
import { useCarrinho } from "./CarrinhoContexto";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";
import "./Carrinho.css";

function formatarData(iso) {
  if (!iso) return null;
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}

export default function Carrinho() {
  const { itens, subtotal, mudarQtd, remover } = useCarrinho();

  if (itens.length === 0) {
    return (
      <div className="container carrinho-vazio">
        <div className="carrinho-vazio__emoji" aria-hidden="true">
          🧺
        </div>
        <h1>Seu carrinho está vazio</h1>
        <p>Que tal escolher um docinho pra alegrar o dia?</p>
        <Botao como="link" para="/" variante="primario">
          Ver o catálogo
        </Botao>
      </div>
    );
  }

  return (
    <div className="carrinho container">
      <header className="carrinho__cabeca">
        <span className="olho">Seu pedido</span>
        <h1>Carrinho</h1>
      </header>

      <div className="carrinho__grade">
        <ul className="carrinho__lista">
          {itens.map((item) => (
            <li key={item.assinatura} className="item">
              <img className="item__foto" src={item.foto_url} alt="" />
              <div className="item__info">
                <h3>{item.nome}</h3>
                {item.variacoes.length > 0 && (
                  <p className="item__var">
                    {item.variacoes.map((v) => v.nome).join(" · ")}
                  </p>
                )}
                {item.data_encomenda && (
                  <p className="item__data">
                    📅 Entrega em {formatarData(item.data_encomenda)}
                  </p>
                )}
                <button
                  className="item__remover"
                  onClick={() => remover(item.assinatura)}
                >
                  Remover
                </button>
              </div>

              <div className="item__lado">
                <div className="stepper stepper--sm">
                  <button
                    onClick={() => mudarQtd(item.assinatura, -1)}
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span>{item.qtd}</span>
                  <button
                    onClick={() => mudarQtd(item.assinatura, 1)}
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                </div>
                <span className="item__preco">
                  {moeda(item.preco_unit * item.qtd)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <aside className="resumo">
          <h2 className="resumo__titulo">Resumo</h2>
          <div className="resumo__linha">
            <span>Subtotal</span>
            <span>{moeda(subtotal)}</span>
          </div>
          <div className="resumo__linha resumo__linha--tenue">
            <span>Frete</span>
            <span>calculado no checkout</span>
          </div>
          <div className="resumo__total">
            <span>Total parcial</span>
            <strong>{moeda(subtotal)}</strong>
          </div>
          <Botao
            como="link"
            para="/checkout"
            variante="primario"
            className="botao--bloco"
          >
            Finalizar pedido
          </Botao>
          <Link to="/" className="resumo__continuar">
            ← Continuar comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
