import { useEffect, useState } from "react";
import { listarZonasAdmin, salvarZona, excluirZona } from "../lib/admin";
import { moeda } from "../lib/formato";
import Botao from "../componentes/Botao";

export default function PainelZonas() {
  const [zonas, setZonas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [nova, setNova] = useState({ nome_bairro: "", valor_frete: "" });
  const [salvando, setSalvando] = useState(false);

  async function recarregar() {
    setZonas(await listarZonasAdmin());
  }

  useEffect(() => {
    recarregar()
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (salvando || !nova.nome_bairro.trim()) return;
    setSalvando(true);
    setErro("");
    try {
      await salvarZona({ ...nova, ativo: true });
      setNova({ nome_bairro: "", valor_frete: "" });
      await recarregar();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(z) {
    try {
      await salvarZona({ ...z, ativo: !z.ativo });
      setZonas((l) =>
        l.map((x) => (x.id === z.id ? { ...x, ativo: !x.ativo } : x))
      );
    } catch (e) {
      setErro(e.message);
    }
  }

  async function aoExcluir(z) {
    if (!confirm(`Excluir a zona "${z.nome_bairro}"?`)) return;
    try {
      await excluirZona(z.id);
      setZonas((l) => l.filter((x) => x.id !== z.id));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="painel-secao">
      <header className="painel-secao__cabeca">
        <div>
          <span className="olho">Entrega</span>
          <h1>Zonas de entrega</h1>
        </div>
      </header>

      {erro && <p className="painel-erro">{erro}</p>}

      <form className="form-linha" onSubmit={adicionar}>
        <input
          placeholder="Nome do bairro"
          value={nova.nome_bairro}
          onChange={(e) =>
            setNova((n) => ({ ...n, nome_bairro: e.target.value }))
          }
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Frete (R$)"
          value={nova.valor_frete}
          onChange={(e) =>
            setNova((n) => ({ ...n, valor_frete: e.target.value }))
          }
        />
        <Botao variante="primario" type="submit" disabled={salvando}>
          Adicionar
        </Botao>
      </form>

      {carregando ? (
        <p className="painel-vazio">Carregando zonas…</p>
      ) : zonas.length === 0 ? (
        <p className="painel-vazio">Nenhuma zona cadastrada ainda.</p>
      ) : (
        <ul className="lista-zonas">
          {zonas.map((z) => (
            <li key={z.id} className={z.ativo ? "" : "inativa"}>
              <span className="lista-zonas__nome">{z.nome_bairro}</span>
              <span className="lista-zonas__frete">{moeda(z.valor_frete)}</span>
              <label className="alternador alternador--compacto">
                <input
                  type="checkbox"
                  checked={z.ativo}
                  onChange={() => alternarAtivo(z)}
                />
                {z.ativo ? "Ativa" : "Inativa"}
              </label>
              <button
                className="link-btn link-btn--perigo"
                onClick={() => aoExcluir(z)}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
