import { useEffect, useState } from "react";
import { useAuth } from "./AuthContexto";
import { listarMeusPedidos } from "../lib/admin";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";
import "./conta.css";

const ROTULO_STATUS = {
  aguardando_confirmacao: "Aguardando confirmação",
  novo: "Recebido",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  a_caminho: "A caminho",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function dataHora(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MeusPedidos() {
  const { usuario, carregando: carregandoAuth, configurado } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!configurado || !usuario) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    listarMeusPedidos()
      .then((p) => ativo && setPedidos(p))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [usuario?.id, configurado]);

  // Não logado (e Supabase ativo): convida a entrar.
  if (configurado && !carregandoAuth && !usuario) {
    return (
      <div className="container aviso-auth">
        <div className="aviso-auth__cartao">
          <div className="aviso-auth__emoji">🔖</div>
          <h1>Meus pedidos</h1>
          <p>Entre na sua conta para ver o histórico dos seus pedidos.</p>
          <Botao como="link" para="/entrar" variante="primario">
            Entrar
          </Botao>
        </div>
      </div>
    );
  }

  // Preview sem Supabase: mensagem carinhosa.
  if (!configurado) {
    return (
      <div className="container aviso-auth">
        <div className="aviso-auth__cartao">
          <div className="aviso-auth__emoji">🔖</div>
          <h1>Meus pedidos</h1>
          <p>
            Em breve você poderá entrar e acompanhar seu histórico. Estamos
            preparando com carinho.
          </p>
          <Botao como="link" para="/" variante="secundario">
            Voltar ao catálogo
          </Botao>
        </div>
      </div>
    );
  }

  return (
    <div className="container meus-pedidos">
      <header className="meus-pedidos__cabeca">
        <span className="olho">Sua conta</span>
        <h1>Meus pedidos</h1>
      </header>

      {carregando ? (
        <p className="conta-vazio">Carregando seus pedidos…</p>
      ) : pedidos.length === 0 ? (
        <div className="conta-vazio">
          <p>Você ainda não fez pedidos por aqui.</p>
          <Botao como="link" para="/" variante="primario">
            Ver o catálogo
          </Botao>
        </div>
      ) : (
        pedidos.map((pd) => (
          <article key={pd.id} className="pedido-cartao">
            <div className="pedido-cartao__topo">
              <span className="pedido-cartao__num">
                #{String(pd.numero).padStart(4, "0")}
              </span>
              <span className={`selo-status selo-status--${pd.status}`}>
                {ROTULO_STATUS[pd.status] ?? pd.status}
              </span>
              <span className="pedido-cartao__data">{dataHora(pd.criado_em)}</span>
            </div>
            <div className="pedido-cartao__itens">
              {pd.itens_pedido.map((i) => (
                <span key={i.id}>
                  {i.qtd}× {i.nome_snapshot}
                </span>
              ))}
            </div>
            <div className="pedido-cartao__total">Total: {moeda(pd.total)}</div>
          </article>
        ))
      )}
    </div>
  );
}
