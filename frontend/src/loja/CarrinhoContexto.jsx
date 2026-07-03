import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { precoComVariacoes } from "../lib/formato";

const CarrinhoContexto = createContext(null);
const CHAVE = "doceria-carrinho";

export function ProvedorCarrinho({ children }) {
  const [itens, setItens] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  }, [itens]);

  function adicionar(produto, { variacoes = {}, qtd = 1, dataEncomenda = null }) {
    const precoUnit = precoComVariacoes(produto, variacoes);
    const assinatura =
      produto.id +
      "|" +
      Object.values(variacoes)
        .map((v) => v.id)
        .sort()
        .join(",") +
      "|" +
      (dataEncomenda ?? "");

    setItens((atual) => {
      const existente = atual.find((i) => i.assinatura === assinatura);
      if (existente) {
        return atual.map((i) =>
          i.assinatura === assinatura ? { ...i, qtd: i.qtd + qtd } : i
        );
      }
      return [
        ...atual,
        {
          assinatura,
          produto_id: produto.id,
          nome: produto.nome,
          foto_url: produto.foto_url,
          variacoes: Object.values(variacoes),
          data_encomenda: dataEncomenda,
          preco_unit: precoUnit,
          qtd,
        },
      ];
    });
  }

  function mudarQtd(assinatura, delta) {
    setItens((atual) =>
      atual
        .map((i) =>
          i.assinatura === assinatura ? { ...i, qtd: i.qtd + delta } : i
        )
        .filter((i) => i.qtd > 0)
    );
  }

  function remover(assinatura) {
    setItens((atual) => atual.filter((i) => i.assinatura !== assinatura));
  }

  function limpar() {
    setItens([]);
  }

  const subtotal = useMemo(
    () => itens.reduce((s, i) => s + i.preco_unit * i.qtd, 0),
    [itens]
  );
  const quantidadeTotal = useMemo(
    () => itens.reduce((s, i) => s + i.qtd, 0),
    [itens]
  );

  const valor = {
    itens,
    subtotal,
    quantidadeTotal,
    adicionar,
    mudarQtd,
    remover,
    limpar,
  };

  return (
    <CarrinhoContexto.Provider value={valor}>
      {children}
    </CarrinhoContexto.Provider>
  );
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContexto);
  if (!ctx)
    throw new Error("useCarrinho precisa estar dentro de <ProvedorCarrinho>");
  return ctx;
}
