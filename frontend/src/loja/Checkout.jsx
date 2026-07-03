import { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCarrinho } from "./CarrinhoContexto";
import { carregarZonas, carregarConfiguracoes } from "../lib/dados";
import { criarPedido } from "../lib/api";
import { supabaseConfigurado } from "../lib/supabase";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";
import "./Checkout.css";

export default function Checkout() {
  const navegar = useNavigate();
  const { itens, subtotal, limpar } = useCarrinho();

  const [zonas, setZonas] = useState([]);
  const [descontoPct, setDescontoPct] = useState(10);
  const [tipoEntrega, setTipoEntrega] = useState("entrega");
  const [zonaId, setZonaId] = useState("");
  const [querCadastro, setQuerCadastro] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    observacoes: "",
    email: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([carregarZonas(), carregarConfiguracoes()]).then(
      ([z, config]) => {
        setZonas(z);
        setDescontoPct(config?.desconto_1a_compra_pct ?? 10);
      }
    );
  }, []);

  const zona = zonas.find((z) => z.id === zonaId);
  const frete = tipoEntrega === "entrega" ? zona?.valor_frete ?? 0 : 0;
  const desconto = useMemo(
    () => (querCadastro ? (subtotal * descontoPct) / 100 : 0),
    [querCadastro, subtotal, descontoPct]
  );
  const total = Math.max(0, subtotal + frete - desconto);

  if (itens.length === 0) {
    return <Navigate to="/carrinho" replace />;
  }

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const podeEnviar =
    form.nome.trim() &&
    form.telefone.trim() &&
    (tipoEntrega === "retirada" || (zonaId && form.endereco.trim())) &&
    (!querCadastro || form.email.trim());

  async function aoEnviar(e) {
    e.preventDefault();
    if (!podeEnviar || enviando) return;
    setErro("");
    setEnviando(true);

    const contato = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
    };

    try {
      let resumo;

      if (supabaseConfigurado) {
        // Servidor é a fonte de verdade: recalcula tudo e grava.
        const pedido = await criarPedido({
          itens: itens.map((i) => ({
            produto_id: i.produto_id,
            variacao_ids: i.variacoes.map((v) => v.id),
            qtd: i.qtd,
            data_encomenda: i.data_encomenda,
          })),
          contato,
          tipo_entrega: tipoEntrega,
          zona_id: tipoEntrega === "entrega" ? zonaId : null,
          observacoes: form.observacoes.trim(),
        });
        resumo = {
          numero: "#" + String(pedido.numero).padStart(4, "0"),
          subtotal: pedido.subtotal,
          frete_valor: pedido.frete_valor,
          desconto_valor: pedido.desconto_valor,
          total: pedido.total,
        };
      } else {
        // Sem Supabase configurado: resumo local (só para visualizar o fluxo).
        resumo = {
          numero: "#" + Math.floor(1000 + Math.random() * 9000),
          subtotal,
          frete_valor: frete,
          desconto_valor: desconto,
          total,
        };
      }

      const pedidoCompleto = {
        itens,
        contato: form,
        tipo_entrega: tipoEntrega,
        zona: zona?.nome_bairro ?? null,
        forma_pagamento: "entrega",
        cadastro: querCadastro,
        ...resumo,
      };

      limpar();
      navegar("/confirmacao", { state: { pedido: pedidoCompleto }, replace: true });
    } catch (err) {
      setErro(err.message || "Não foi possível concluir o pedido.");
      setEnviando(false);
    }
  }

  return (
    <form className="checkout container" onSubmit={aoEnviar}>
      <header className="checkout__cabeca">
        <span className="olho">Quase lá</span>
        <h1>Finalizar pedido</h1>
      </header>

      <div className="checkout__grade">
        <div className="checkout__campos">
          {/* Contato */}
          <section className="cartao-form">
            <h2>Seus dados</h2>
            <div className="campo">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Como podemos te chamar?"
                required
              />
            </div>
            <div className="campo">
              <label htmlFor="tel">WhatsApp / telefone</label>
              <input
                id="tel"
                type="tel"
                value={form.telefone}
                onChange={(e) => atualizar("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </section>

          {/* Entrega */}
          <section className="cartao-form">
            <h2>Entrega</h2>
            <div className="segmentado">
              <button
                type="button"
                className={tipoEntrega === "entrega" ? "seg--ativo" : ""}
                onClick={() => setTipoEntrega("entrega")}
              >
                🛵 Entregar
              </button>
              <button
                type="button"
                className={tipoEntrega === "retirada" ? "seg--ativo" : ""}
                onClick={() => setTipoEntrega("retirada")}
              >
                🏠 Retirar
              </button>
            </div>

            {tipoEntrega === "entrega" ? (
              <>
                <div className="campo">
                  <label htmlFor="zona">Bairro</label>
                  <select
                    id="zona"
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value)}
                    required
                  >
                    <option value="">Selecione seu bairro…</option>
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.nome_bairro} — {moeda(z.valor_frete)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="end">Endereço</label>
                  <input
                    id="end"
                    value={form.endereco}
                    onChange={(e) => atualizar("endereco", e.target.value)}
                    placeholder="Rua, número, complemento"
                    required
                  />
                </div>
              </>
            ) : (
              <p className="checkout__nota">
                Você retira no balcão da doceria. Combinamos o horário pelo
                WhatsApp após o pedido. 🤍
              </p>
            )}
          </section>

          {/* Cadastro opcional */}
          <section className="cartao-form cartao-form--desconto">
            <label className="opcao-cadastro">
              <input
                type="checkbox"
                checked={querCadastro}
                onChange={(e) => setQuerCadastro(e.target.checked)}
              />
              <span>
                <strong>
                  Quero me cadastrar e ganhar {descontoPct}% na 1ª compra
                </strong>
                <small>Guardamos seu histórico e ofertas com carinho.</small>
              </span>
            </label>
            {querCadastro && (
              <div className="campo campo--surgir">
                <label htmlFor="email">E-mail para o cadastro</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => atualizar("email", e.target.value)}
                  placeholder="voce@email.com"
                  required
                />
              </div>
            )}
          </section>

          {/* Pagamento */}
          <section className="cartao-form">
            <h2>Pagamento</h2>
            <div className="pagamento-fixo">
              <span className="pagamento-fixo__badge">Na entrega</span>
              <p>
                Você paga quando receber (dinheiro, Pix ou cartão na maquininha).
                Pagamento online chega em breve.
              </p>
            </div>
            <div className="campo">
              <label htmlFor="obs">Observações (opcional)</label>
              <textarea
                id="obs"
                rows="3"
                value={form.observacoes}
                onChange={(e) => atualizar("observacoes", e.target.value)}
                placeholder="Alguma preferência, recado ou ponto de referência?"
              />
            </div>
          </section>
        </div>

        {/* Resumo */}
        <aside className="checkout__resumo">
          <h2 className="resumo__titulo">Seu pedido</h2>
          <ul className="checkout__itens">
            {itens.map((i) => (
              <li key={i.assinatura}>
                <span className="checkout__qtd">{i.qtd}×</span>
                <span className="checkout__nome-item">{i.nome}</span>
                <span>{moeda(i.preco_unit * i.qtd)}</span>
              </li>
            ))}
          </ul>

          <div className="resumo__linha">
            <span>Subtotal</span>
            <span>{moeda(subtotal)}</span>
          </div>
          <div className="resumo__linha">
            <span>Frete</span>
            <span>
              {tipoEntrega === "retirada"
                ? "Retirada"
                : zona
                  ? moeda(frete)
                  : "—"}
            </span>
          </div>
          {desconto > 0 && (
            <div className="resumo__linha resumo__linha--desconto">
              <span>Desconto 1ª compra</span>
              <span>−{moeda(desconto)}</span>
            </div>
          )}
          <div className="resumo__total">
            <span>Total</span>
            <strong>{moeda(total)}</strong>
          </div>

          {erro && <p className="checkout__erro">{erro}</p>}

          <Botao
            type="submit"
            variante="primario"
            className="botao--bloco"
            disabled={!podeEnviar || enviando}
          >
            {enviando ? "Enviando…" : "Confirmar pedido"}
          </Botao>
          <p className="checkout__seguro">
            🔒 O valor final é conferido no servidor antes de confirmar.
          </p>
        </aside>
      </div>
    </form>
  );
}
