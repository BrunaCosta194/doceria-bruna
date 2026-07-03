import { Link } from "react-router-dom";
import Versiculo from "./Versiculo";
import "./Rodape.css";

export default function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__grade">
        <div className="rodape__marca">
          <span className="marca__nome">
            Doceria <em>da Bruna</em>
          </span>
          <p className="rodape__lema">
            Pães, bolos e caldos feitos com carinho — do nosso forno para a sua
            casa.
          </p>
          <Versiculo className="rodape__versiculo" />
        </div>

        <nav className="rodape__col" aria-label="Loja">
          <h4>Loja</h4>
          <Link to="/">Catálogo</Link>
          <Link to="/carrinho">Carrinho</Link>
          <Link to="/conta/meus-pedidos">Meus pedidos</Link>
        </nav>

        <div className="rodape__col">
          <h4>Contato</h4>
          <a href="https://wa.me/5599999999999">WhatsApp</a>
          <a href="mailto:contato@doceriadabruna.com.br">E-mail</a>
          <span className="rodape__tenue">Entregas na região · pague na entrega</span>
        </div>
      </div>

      <div className="container rodape__base">
        <span>© {new Date().getFullYear()} Doceria da Bruna</span>
        <span className="rodape__tenue">Feito com carinho 🤍</span>
      </div>
    </footer>
  );
}
