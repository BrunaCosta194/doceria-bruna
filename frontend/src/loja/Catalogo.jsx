import { useEffect, useMemo, useState } from "react";
import { carregarCatalogo, carregarConfiguracoes } from "../lib/dados";
import ProdutoCard from "../componentes/ProdutoCard";
import Botao from "../componentes/Botao";
import "./Catalogo.css";

export default function Catalogo() {
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

  const visiveis = useMemo(
    () =>
      produtos.filter(
        (p) => filtro === "todos" || p.categoria_id === filtro
      ),
    [produtos, filtro]
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
        <header className="catalogo__cabeca">
          <div>
            <span className="olho">Nosso cardápio</span>
            <h2 className="catalogo__titulo">Escolha seus favoritos</h2>
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
            Nenhum produto por aqui ainda. Volte em breve! 🤍
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
