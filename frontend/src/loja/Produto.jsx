import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { carregarProduto, carregarCategoria } from "../lib/dados";
import { moeda, agruparVariacoes, precoComVariacoes } from "../lib/formato";
import { useCarrinho } from "./CarrinhoContexto";
import Botao from "../componentes/Botao";
import "./Produto.css";

function dataMinima(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export default function Produto() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { adicionar } = useCarrinho();

  const [produto, setProduto] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [selecao, setSelecao] = useState({});
  const [qtd, setQtd] = useState(1);
  const [dataEncomenda, setDataEncomenda] = useState("");
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    carregarProduto(id).then(async (p) => {
      if (!ativo) return;
      setProduto(p);
      if (p) {
        const grupos = agruparVariacoes(p.variacoes);
        const inicial = {};
        for (const [grupo, opcoes] of Object.entries(grupos)) {
          inicial[grupo] = opcoes[0];
        }
        setSelecao(inicial);
        setCategoria(await carregarCategoria(p.categoria_id));
      }
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [id]);

  const grupos = useMemo(
    () => agruparVariacoes(produto?.variacoes),
    [produto]
  );

  if (carregando) {
    return (
      <div className="container produto-carregando">
        <div className="produto-esqueleto produto-esqueleto--foto" />
        <div className="produto-esqueleto produto-esqueleto--info" />
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="container vazio-simples">
        <h2>Produto não encontrado</h2>
        <Botao como="link" para="/" variante="secundario">
          Voltar ao catálogo
        </Botao>
      </div>
    );
  }

  const min = dataMinima(produto.antecedencia_dias);
  const precoUnit = precoComVariacoes(produto, selecao);
  const faltaData = produto.sob_encomenda && !dataEncomenda;

  function aoAdicionar() {
    if (faltaData) return;
    adicionar(produto, {
      variacoes: selecao,
      qtd,
      dataEncomenda: dataEncomenda || null,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <div className="produto-pagina container">
      <nav className="migalhas" aria-label="Você está em">
        <Link to="/">Catálogo</Link>
        <span aria-hidden="true">/</span>
        <span>{categoria?.nome}</span>
      </nav>

      <div className="produto-pagina__grade">
        <div className="produto-pagina__foto surgir">
          {produto.foto_url ? (
            <img src={produto.foto_url} alt={produto.nome} />
          ) : (
            <div className="produto-pagina__sem-foto" aria-hidden="true">
              🧁
            </div>
          )}
          {produto.sob_encomenda && (
            <span className="produto-pagina__selo">
              Sob encomenda · {produto.antecedencia_dias} dia
              {produto.antecedencia_dias > 1 ? "s" : ""} de antecedência
            </span>
          )}
        </div>

        <div
          className="produto-pagina__info surgir"
          style={{ animationDelay: "80ms" }}
        >
          <span className="olho">{categoria?.nome}</span>
          <h1 className="produto-pagina__nome">{produto.nome}</h1>
          <p className="produto-pagina__desc">{produto.descricao}</p>

          <div className="produto-pagina__preco">{moeda(precoUnit)}</div>

          {Object.entries(grupos).map(([grupo, opcoes]) => (
            <fieldset className="grupo-var" key={grupo}>
              <legend>{grupo}</legend>
              <div className="grupo-var__opcoes">
                {opcoes.map((op) => {
                  const ativo = selecao[grupo]?.id === op.id;
                  return (
                    <button
                      key={op.id}
                      className={`chip ${ativo ? "chip--ativo" : ""}`}
                      onClick={() =>
                        setSelecao((s) => ({ ...s, [grupo]: op }))
                      }
                    >
                      {op.nome}
                      {op.preco_delta > 0 && (
                        <span className="chip__delta">
                          +{moeda(op.preco_delta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {produto.sob_encomenda && (
            <div className="grupo-var">
              <label htmlFor="data-enc" className="grupo-var__legenda">
                Data de entrega
              </label>
              <input
                id="data-enc"
                type="date"
                className="campo-data"
                min={min}
                value={dataEncomenda}
                onChange={(e) => setDataEncomenda(e.target.value)}
              />
              <p className="grupo-var__dica">
                Pedimos ao menos {produto.antecedencia_dias} dia
                {produto.antecedencia_dias > 1 ? "s" : ""} para preparar com
                capricho.
              </p>
            </div>
          )}

          <div className="produto-pagina__compra">
            <div className="stepper" role="group" aria-label="Quantidade">
              <button
                onClick={() => setQtd((q) => Math.max(1, q - 1))}
                aria-label="Diminuir"
              >
                −
              </button>
              <span>{qtd}</span>
              <button onClick={() => setQtd((q) => q + 1)} aria-label="Aumentar">
                +
              </button>
            </div>

            <Botao
              variante={adicionado ? "salvia" : "primario"}
              className="botao--bloco"
              onClick={aoAdicionar}
              disabled={faltaData}
            >
              {adicionado
                ? "Adicionado ✓"
                : `Adicionar · ${moeda(precoUnit * qtd)}`}
            </Botao>
          </div>

          {faltaData && (
            <p className="produto-pagina__aviso">
              Escolha a data de entrega para continuar.
            </p>
          )}

          <button
            className="produto-pagina__ir-carrinho"
            onClick={() => navegar("/carrinho")}
          >
            Ir para o carrinho →
          </button>
        </div>
      </div>
    </div>
  );
}
