import { useEffect, useState } from "react";
import { carregarConfiguracoes } from "../lib/dados";
import { salvarConfiguracoes } from "../lib/admin";
import Botao from "../componentes/Botao";

export default function PainelConfig() {
  const [form, setForm] = useState(null);
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarConfiguracoes()
      .then((c) => ativo && setForm(c))
      .catch((e) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, []);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setOk(false);
  }

  async function submeter(e) {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro("");
    setOk(false);
    try {
      await salvarConfiguracoes(form);
      setOk(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!form) {
    return (
      <div className="painel-secao">
        <p className="painel-vazio">Carregando configurações…</p>
      </div>
    );
  }

  return (
    <div className="painel-secao">
      <header className="painel-secao__cabeca">
        <div>
          <span className="olho">Ajustes</span>
          <h1>Configurações</h1>
        </div>
      </header>

      {erro && <p className="painel-erro">{erro}</p>}
      {ok && <p className="painel-ok">Configurações salvas com carinho. 💛</p>}

      <form className="form-admin" onSubmit={submeter}>
        <div className="form-admin__grade">
          <div className="campo">
            <label htmlFor="c-desc">Desconto 1ª compra (%)</label>
            <input
              id="c-desc"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={form.desconto_1a_compra_pct ?? 0}
              onChange={(e) =>
                set("desconto_1a_compra_pct", e.target.value)
              }
            />
          </div>
          <div className="campo">
            <label htmlFor="c-wpp">WhatsApp da Bruna</label>
            <input
              id="c-wpp"
              value={form.whatsapp_bruna ?? ""}
              onChange={(e) => set("whatsapp_bruna", e.target.value)}
              placeholder="55DDDNÚMERO"
            />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="c-vers">Versículo (aparece no rodapé)</label>
          <textarea
            id="c-vers"
            rows={2}
            value={form.texto_versiculo ?? ""}
            onChange={(e) => set("texto_versiculo", e.target.value)}
            placeholder="Provai e vede como o Senhor é bom…"
          />
        </div>
        <div className="campo">
          <label htmlFor="c-ref">Referência do versículo</label>
          <input
            id="c-ref"
            value={form.referencia_versiculo ?? ""}
            onChange={(e) => set("referencia_versiculo", e.target.value)}
            placeholder="Salmos 34:8"
          />
        </div>

        <div className="form-admin__acoes">
          <Botao variante="primario" type="submit" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar configurações"}
          </Botao>
        </div>
      </form>
    </div>
  );
}
