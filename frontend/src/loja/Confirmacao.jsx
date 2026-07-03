import { Link, Navigate, useLocation } from "react-router-dom";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";
import Versiculo from "../componentes/Versiculo";
import "./Confirmacao.css";

export default function Confirmacao() {
  const { state } = useLocation();
  const pedido = state?.pedido;

  if (!pedido) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="confirmacao container">
      <div className="confirmacao__cartao surgir">
        <div className="confirmacao__selo" aria-hidden="true">
          ✓
        </div>
        <span className="olho">Pedido {pedido.numero}</span>
        <h1>Obrigada pelo seu pedido, {pedido.contato.nome.split(" ")[0]}!</h1>
        <p className="confirmacao__intro">
          Recebemos tudo com muito carinho. A Bruna já foi avisada no WhatsApp e
          vai confirmar os detalhes com você em instantes. 🤍
        </p>

        <div className="confirmacao__resumo">
          <ul className="confirmacao__itens">
            {pedido.itens.map((i) => (
              <li key={i.assinatura}>
                <span className="confirmacao__qtd">{i.qtd}×</span>
                <div>
                  <strong>{i.nome}</strong>
                  {i.variacoes.length > 0 && (
                    <small>{i.variacoes.map((v) => v.nome).join(" · ")}</small>
                  )}
                </div>
                <span>{moeda(i.preco_unit * i.qtd)}</span>
              </li>
            ))}
          </ul>

          <dl className="confirmacao__totais">
            <div>
              <dt>Subtotal</dt>
              <dd>{moeda(pedido.subtotal)}</dd>
            </div>
            <div>
              <dt>
                {pedido.tipo_entrega === "retirada"
                  ? "Entrega"
                  : `Frete${pedido.zona ? ` · ${pedido.zona}` : ""}`}
              </dt>
              <dd>
                {pedido.tipo_entrega === "retirada"
                  ? "Retirada"
                  : moeda(pedido.frete_valor)}
              </dd>
            </div>
            {pedido.desconto_valor > 0 && (
              <div className="confirmacao__desconto">
                <dt>Desconto 1ª compra</dt>
                <dd>−{moeda(pedido.desconto_valor)}</dd>
              </div>
            )}
            <div className="confirmacao__total">
              <dt>Total · pague na entrega</dt>
              <dd>{moeda(pedido.total)}</dd>
            </div>
          </dl>
        </div>

        <Versiculo className="confirmacao__versiculo" />

        <div className="confirmacao__acoes">
          <Botao como="link" para="/" variante="primario">
            Voltar ao catálogo
          </Botao>
          <Link to="/conta/meus-pedidos" className="confirmacao__link">
            Ver meus pedidos →
          </Link>
        </div>
      </div>
    </div>
  );
}
