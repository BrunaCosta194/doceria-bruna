import Botao from "../componentes/Botao";
import "./MeusPedidos.css";

export default function MeusPedidos() {
  return (
    <div className="container meus-pedidos">
      <div className="meus-pedidos__cartao">
        <div className="meus-pedidos__emoji" aria-hidden="true">
          🔖
        </div>
        <span className="olho">Sua conta</span>
        <h1>Meus pedidos</h1>
        <p>
          Em breve você poderá entrar com sua conta para acompanhar o histórico e
          repetir seus pedidos favoritos. Estamos preparando com carinho.
        </p>
        <Botao como="link" para="/" variante="secundario">
          Voltar ao catálogo
        </Botao>
      </div>
    </div>
  );
}
