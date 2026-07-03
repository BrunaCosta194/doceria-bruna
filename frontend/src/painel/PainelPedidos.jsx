import { useEffect, useState } from "react";
import { listarPedidos, atualizarStatusPedido } from "../lib/admin";
import { moeda } from "../lib/formato";

const FLUXO_STATUS = [
  "novo",
  "confirmado",
  "em_preparo",
  "a_caminho",
  "entregue",
  "cancelado",
];

const ROTULO_STATUS = {
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

export default function PainelPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    listarPedidos()
      .then((p) => ativo && setPedidos(p))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  async function mudarStatus(pedido, status) {
    const antes = pedido.status;
    setPedidos((lista) =>
      lista.map((p) => (p.id === pedido.id ? { ...p, status } : p))
    );
    setSelecionado((s) => (s && s.id === pedido.id ? { ...s, status } : s));
    try {
      await atualizarStatusPedido(pedido.id, status);
    } catch (e) {
      setErro(e.message);
      setPedidos((lista) =>
        lista.map((p) => (p.id === pedido.id ? { ...p, status: antes } : p))
      );
    }
  }

  const visiveis =
    filtro === "todos"
      ? pedidos
      : pedidos.filter((p) => p.status === filtro);

  return (
    <div className="painel-secao">
      <header className="painel-secao__cabeca">
        <div>
          <span className="olho">Gestão</span>
          <h1>Pedidos</h1>
        </div>
      </header>

      {erro && <p className="painel-erro">{erro}</p>}

      <div className="painel-filtros">
        <button
          className={`chip ${filtro === "todos" ? "ativo" : ""}`}
          onClick={() => setFiltro("todos")}
        >
          Todos
        </button>
        {FLUXO_STATUS.map((s) => (
          <button
            key={s}
            className={`chip ${filtro === s ? "ativo" : ""}`}
            onClick={() => setFiltro(s)}
          >
            {ROTULO_STATUS[s]}
          </button>
        ))}
      </div>

      {carregando ? (
        <p className="painel-vazio">Carregando pedidos…</p>
      ) : visiveis.length === 0 ? (
        <p className="painel-vazio">Nenhum pedido por aqui ainda.</p>
      ) : (
        <div className="tabela-envolve">
          <table className="tabela">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Recebido</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => (
                <tr key={p.id}>
                  <td>#{String(p.numero).padStart(4, "0")}</td>
                  <td>{p.nome_contato}</td>
                  <td>{dataHora(p.criado_em)}</td>
                  <td>{moeda(p.total)}</td>
                  <td>
                    <span className={`selo-status selo-status--${p.status}`}>
                      {ROTULO_STATUS[p.status]}
                    </span>
                  </td>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => setSelecionado(p)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selecionado && (
        <div
          className="painel-modal"
          onClick={(e) =>
            e.target === e.currentTarget && setSelecionado(null)
          }
        >
          <div className="painel-modal__caixa">
            <button
              className="painel-modal__fechar"
              onClick={() => setSelecionado(null)}
              aria-label="Fechar"
            >
              ×
            </button>
            <span className="olho">
              Pedido #{String(selecionado.numero).padStart(4, "0")}
            </span>
            <h2>{selecionado.nome_contato}</h2>
            <p className="painel-modal__meta">
              {dataHora(selecionado.criado_em)} · {selecionado.telefone}
            </p>

            <div className="painel-modal__linha">
              <strong>Entrega:</strong>{" "}
              {selecionado.tipo_entrega === "entrega"
                ? `Entrega${
                    selecionado.zonas_entrega?.nome_bairro
                      ? ` — ${selecionado.zonas_entrega.nome_bairro}`
                      : ""
                  }`
                : "Retirada"}
            </div>
            {selecionado.endereco && (
              <div className="painel-modal__linha">
                <strong>Endereço:</strong> {selecionado.endereco}
              </div>
            )}
            {selecionado.data_encomenda && (
              <div className="painel-modal__linha">
                <strong>Encomenda para:</strong>{" "}
                {new Date(
                  selecionado.data_encomenda + "T00:00:00"
                ).toLocaleDateString("pt-BR")}
              </div>
            )}
            {selecionado.observacoes && (
              <div className="painel-modal__linha">
                <strong>Observações:</strong> {selecionado.observacoes}
              </div>
            )}

            <ul className="painel-modal__itens">
              {selecionado.itens_pedido?.map((i) => (
                <li key={i.id}>
                  <span>
                    {i.qtd}× {i.nome_snapshot}
                    {i.variacoes_snapshot?.length > 0 && (
                      <small>
                        {" "}
                        (
                        {i.variacoes_snapshot
                          .map((v) => v.nome ?? v)
                          .join(", ")}
                        )
                      </small>
                    )}
                  </span>
                  <span>{moeda(i.subtotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="painel-modal__totais">
              <div>
                <dt>Subtotal</dt>
                <dd>{moeda(selecionado.subtotal)}</dd>
              </div>
              {selecionado.desconto_valor > 0 && (
                <div>
                  <dt>Desconto</dt>
                  <dd>− {moeda(selecionado.desconto_valor)}</dd>
                </div>
              )}
              <div>
                <dt>Frete</dt>
                <dd>{moeda(selecionado.frete_valor)}</dd>
              </div>
              <div className="painel-modal__total">
                <dt>Total</dt>
                <dd>{moeda(selecionado.total)}</dd>
              </div>
            </dl>

            <label className="painel-modal__status">
              Status do pedido
              <select
                value={selecionado.status}
                onChange={(e) => mudarStatus(selecionado, e.target.value)}
              >
                {FLUXO_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {ROTULO_STATUS[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
