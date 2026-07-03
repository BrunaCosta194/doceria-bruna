import { useEffect, useState } from "react";
import {
  listarProdutosAdmin,
  listarCategoriasAdmin,
  salvarProduto,
  excluirProduto,
  enviarFotoProduto,
} from "../lib/admin";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";

const VAZIO = {
  nome: "",
  descricao: "",
  categoria_id: "",
  preco_base: "",
  foto_url: "",
  ativo: true,
  sob_encomenda: false,
  antecedencia_dias: 0,
};

export default function PainelProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(null); // produto ou null
  const [erro, setErro] = useState("");

  async function recarregar() {
    const [prods, cats] = await Promise.all([
      listarProdutosAdmin(),
      listarCategoriasAdmin(),
    ]);
    setProdutos(prods);
    setCategorias(cats);
  }

  useEffect(() => {
    recarregar()
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  function novo() {
    setEditando({ ...VAZIO, variacoes: [] });
  }

  async function aoExcluir(p) {
    if (!confirm(`Excluir "${p.nome}"? Isso não pode ser desfeito.`)) return;
    try {
      await excluirProduto(p.id);
      setProdutos((l) => l.filter((x) => x.id !== p.id));
    } catch (e) {
      setErro(e.message);
    }
  }

  function nomeCategoria(id) {
    return categorias.find((c) => c.id === id)?.nome ?? "—";
  }

  if (editando) {
    return (
      <EditorProduto
        produto={editando}
        categorias={categorias}
        aoCancelar={() => setEditando(null)}
        aoSalvar={async () => {
          await recarregar();
          setEditando(null);
        }}
      />
    );
  }

  return (
    <div className="painel-secao">
      <header className="painel-secao__cabeca">
        <div>
          <span className="olho">Catálogo</span>
          <h1>Produtos</h1>
        </div>
        <Botao variante="primario" onClick={novo}>
          + Novo produto
        </Botao>
      </header>

      {erro && <p className="painel-erro">{erro}</p>}

      {carregando ? (
        <p className="painel-vazio">Carregando produtos…</p>
      ) : produtos.length === 0 ? (
        <p className="painel-vazio">Nenhum produto cadastrado ainda.</p>
      ) : (
        <div className="grade-produtos-admin">
          {produtos.map((p) => (
            <article key={p.id} className="cartao-produto-admin">
              <div className="cartao-produto-admin__foto">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.nome} />
                ) : (
                  <span aria-hidden="true">🧁</span>
                )}
                {!p.ativo && <span className="tag-inativo">Inativo</span>}
              </div>
              <div className="cartao-produto-admin__corpo">
                <h3>{p.nome}</h3>
                <p className="cartao-produto-admin__cat">
                  {nomeCategoria(p.categoria_id)}
                </p>
                <p className="cartao-produto-admin__preco">
                  {moeda(p.preco_base)}
                  {p.variacoes.length > 0 && (
                    <small> · {p.variacoes.length} variações</small>
                  )}
                </p>
                <div className="cartao-produto-admin__acoes">
                  <button
                    className="link-btn"
                    onClick={() => setEditando({ ...p })}
                  >
                    Editar
                  </button>
                  <button
                    className="link-btn link-btn--perigo"
                    onClick={() => aoExcluir(p)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorProduto({ produto, categorias, aoCancelar, aoSalvar }) {
  const [form, setForm] = useState({
    ...VAZIO,
    ...produto,
    preco_base: produto.preco_base ?? "",
  });
  const [variacoes, setVariacoes] = useState(produto.variacoes ?? []);
  const [enviando, setEnviando] = useState(false);
  const [subindoFoto, setSubindoFoto] = useState(false);
  const [erro, setErro] = useState("");

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function addVariacao() {
    setVariacoes((v) => [...v, { grupo: "", nome: "", preco_delta: 0 }]);
  }
  function setVariacao(i, campo, valor) {
    setVariacoes((v) =>
      v.map((x, idx) => (idx === i ? { ...x, [campo]: valor } : x))
    );
  }
  function removerVariacao(i) {
    setVariacoes((v) => v.filter((_, idx) => idx !== i));
  }

  async function aoEscolherFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubindoFoto(true);
    setErro("");
    try {
      const url = await enviarFotoProduto(file);
      set("foto_url", url);
    } catch (err) {
      setErro("Não consegui enviar a foto: " + err.message);
    } finally {
      setSubindoFoto(false);
    }
  }

  async function submeter(e) {
    e.preventDefault();
    if (enviando) return;
    setErro("");
    if (!form.nome.trim()) {
      setErro("O produto precisa de um nome.");
      return;
    }
    setEnviando(true);
    try {
      await salvarProduto(form, variacoes);
      await aoSalvar();
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="painel-secao">
      <header className="painel-secao__cabeca">
        <div>
          <span className="olho">Catálogo</span>
          <h1>{produto.id ? "Editar produto" : "Novo produto"}</h1>
        </div>
      </header>

      {erro && <p className="painel-erro">{erro}</p>}

      <form className="form-admin" onSubmit={submeter}>
        <div className="form-admin__grade">
          <div className="campo">
            <label htmlFor="p-nome">Nome</label>
            <input
              id="p-nome"
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex.: Bolo de cenoura com brigadeiro"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="p-cat">Categoria</label>
            <select
              id="p-cat"
              value={form.categoria_id ?? ""}
              onChange={(e) => set("categoria_id", e.target.value)}
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="p-preco">Preço base (R$)</label>
            <input
              id="p-preco"
              type="number"
              step="0.01"
              min="0"
              value={form.preco_base}
              onChange={(e) => set("preco_base", e.target.value)}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="p-antec">Antecedência (dias)</label>
            <input
              id="p-antec"
              type="number"
              min="0"
              value={form.antecedencia_dias ?? 0}
              onChange={(e) => set("antecedencia_dias", e.target.value)}
              disabled={!form.sob_encomenda}
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="p-desc">Descrição</label>
          <textarea
            id="p-desc"
            rows={3}
            value={form.descricao ?? ""}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Um textinho gostoso sobre o produto…"
          />
        </div>

        <div className="form-admin__toggles">
          <label className="alternador">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
            />
            Ativo (aparece na loja)
          </label>
          <label className="alternador">
            <input
              type="checkbox"
              checked={form.sob_encomenda}
              onChange={(e) => set("sob_encomenda", e.target.checked)}
            />
            Sob encomenda (pede data)
          </label>
        </div>

        <div className="campo">
          <label>Foto</label>
          <div className="form-admin__foto">
            <div className="form-admin__foto-previa">
              {form.foto_url ? (
                <img src={form.foto_url} alt="Prévia" />
              ) : (
                <span aria-hidden="true">🧁</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={aoEscolherFoto}
                disabled={subindoFoto}
              />
              {subindoFoto && <small>Enviando…</small>}
              {form.foto_url && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => set("foto_url", "")}
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-admin__variacoes">
          <div className="form-admin__variacoes-cabeca">
            <h3>Variações</h3>
            <button type="button" className="link-btn" onClick={addVariacao}>
              + Adicionar
            </button>
          </div>
          <p className="dica">
            Ex.: grupo <em>Tamanho</em>, opção <em>Grande</em>, +R$ 10,00.
          </p>
          {variacoes.length === 0 ? (
            <p className="painel-vazio painel-vazio--pequeno">
              Sem variações.
            </p>
          ) : (
            <div className="linhas-variacao">
              {variacoes.map((v, i) => (
                <div key={i} className="linha-variacao">
                  <input
                    placeholder="Grupo"
                    value={v.grupo}
                    onChange={(e) => setVariacao(i, "grupo", e.target.value)}
                  />
                  <input
                    placeholder="Opção"
                    value={v.nome}
                    onChange={(e) => setVariacao(i, "nome", e.target.value)}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Δ preço"
                    value={v.preco_delta}
                    onChange={(e) =>
                      setVariacao(i, "preco_delta", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="link-btn link-btn--perigo"
                    onClick={() => removerVariacao(i)}
                    aria-label="Remover variação"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-admin__acoes">
          <Botao variante="fantasma" type="button" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao variante="primario" type="submit" disabled={enviando}>
            {enviando ? "Salvando…" : "Salvar produto"}
          </Botao>
        </div>
      </form>
    </div>
  );
}
