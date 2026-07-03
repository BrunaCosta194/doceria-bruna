import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { carregarCatalogo, carregarConfiguracoes } from "../lib/dados";
import ProdutoCard from "../componentes/ProdutoCard";
import Botao from "../componentes/Botao";
import "./Catalogo.css";

const MODOS = {
  dia: {
    olho: "Catálogo do dia",
    titulo: "Pronto para levar hoje",
    sub: "Feito no dia, disponível para entrega ou retirada agora mesmo.",
    encomenda: false,
  },
  encomenda: {
    olho: "Encomendas",
    titulo: "Encomende com carinho",
    sub: "Escolha a data e a Bruna prepara especialmente para você.",
    encomenda: true,
  },
};

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const modo = params.get("modo") === "encomenda" ? "encomenda" : "dia";
  const [filtro, setFiltro] = useState("todos");
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [descontoPct, setDescontoPct] = useState(10);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    Promise.all([carregarCatalogo(), carregarConfiguracoes()]).then(
      ([catalogo, config]) => {
        if (!ativo) return;
        setCategorias(catalogo.categorias);
        setProdutos(catalogo.produtos);
        setDescontoPct(config?.desconto_1a_compra_pct ?? 10);
        setCarregando(false);
      }
    );
    return () => {
      ativo = false;
    };
  }, []);

  function trocarModo(novo) {
    setFiltro("todos");
    setParams(novo === "encomenda" ? { modo: "encomenda" } : {});
  }

  const doModo = MODOS[modo];

  const visiveis = useMemo(
    () =>
      produtos.filter(
        (p) =>
          Boolean(p.sob_encomenda) === doModo.encomenda &&
          (filtro === "todos" || p.categoria_id === filtro)
      ),
    [produtos, filtro, doModo.encomenda]
  );

  return (
    <>
      <section className="hero">
        <div className="container hero__grade">
          <div className="hero__texto surgir">
            <span className="olho">Doceria artesanal · feito no dia</span>
            <h1 className="hero__titulo">
              Doçura que <em>abraça</em> a sua mesa.
            </h1>
            <p className="hero__sub">
              Pães quentinhos, bolos afetivos e caldos de conforto. Monte seu
              pedido e pague na entrega — simples assim.
            </p>
            <div className="hero__acoes">
              <Botao como="link" para="#catalogo" variante="primario">
                Ver o catálogo
              </Botao>
              <Botao como="link" para="/conta/meus-pedidos" variante="fantasma">
                Já sou cliente
              </Botao>
            </div>
            <p className="hero__desconto">
              🎁 <strong>Cadastre-se e ganhe {descontoPct}%</strong> na primeira
              compra.
            </p>
          </div>

          <div className="hero__cartoes" aria-hidden="true">
            <div className="hero__foto hero__foto--1">🍰</div>
            <div className="hero__foto hero__foto--2">🍞</div>
            <div className="hero__foto hero__foto--3">🧁</div>
          </div>
        </div>
      </section>

      <section id="catalogo" className="catalogo container">
        <div className="catalogo-modos" role="tablist" aria-label="Tipo de catálogo">
          <button
            role="tab"
            aria-selected={modo === "dia"}
            className={`catalogo-modo ${modo === "dia" ? "catalogo-modo--ativo" : ""}`}
            onClick={() => trocarModo("dia")}
          >
            <span aria-hidden="true">🧺</span> Do dia
            <small>Pronta entrega</small>
          </button>
          <button
            role="tab"
            aria-selected={modo === "encomenda"}
            className={`catalogo-modo ${modo === "encomenda" ? "catalogo-modo--ativo" : ""}`}
            onClick={() => trocarModo("encomenda")}
          >
            <span aria-hidden="true">📅</span> Encomenda
            <small>Escolha a data</small>
          </button>
        </div>

        <header className="catalogo__cabeca">
          <div>
            <span className="olho">{doModo.olho}</span>
            <h2 className="catalogo__titulo">{doModo.titulo}</h2>
            <p className="catalogo__sub">{doModo.sub}</p>
          </div>

          <div className="filtros" role="tablist" aria-label="Categorias">
            <button
              className={`filtro ${filtro === "todos" ? "filtro--ativo" : ""}`}
              onClick={() => setFiltro("todos")}
            >
              Tudo
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                className={`filtro ${filtro === c.id ? "filtro--ativo" : ""}`}
                onClick={() => setFiltro(c.id)}
              >
                {c.nome}
              </button>
            ))}
          </div>
        </header>

        {carregando ? (
          <div className="catalogo__grade">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="produto-esqueleto" />
            ))}
          </div>
        ) : visiveis.length === 0 ? (
          <p className="catalogo__vazio">
            {modo === "encomenda"
              ? "Nenhuma encomenda disponível no momento. Volte em breve! 🤍"
              : "Nada pronto para hoje ainda. Volte em breve! 🤍"}
          </p>
        ) : (
          <div className="catalogo__grade">
            {visiveis.map((p, i) => (
              <ProdutoCard key={p.id} produto={p} indice={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
