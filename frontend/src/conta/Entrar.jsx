import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContexto";
import Botao from "../componentes/Botao";
import "./conta.css";

export default function Entrar() {
  const { entrar, cadastrar, configurado } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const destino = local.state?.de ?? "/";

  const [modo, setModo] = useState("entrar"); // entrar | cadastrar
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ehCadastro = modo === "cadastrar";

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function aoEnviar(e) {
    e.preventDefault();
    if (enviando) return;
    setErro("");
    setOk("");
    setEnviando(true);
    try {
      if (ehCadastro) {
        await cadastrar(form.email.trim(), form.senha, form.nome.trim());
        setOk(
          "Conta criada! Se pedirmos confirmação por e-mail, confira sua caixa de entrada."
        );
        // Se o projeto não exigir confirmação, a sessão já está ativa.
        setTimeout(() => navegar(destino, { replace: true }), 900);
      } else {
        await entrar(form.email.trim(), form.senha);
        navegar(destino, { replace: true });
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="container conta-pagina">
      <div className="conta-cartao">
        <span className="olho">{ehCadastro ? "Bem-vinda" : "Que bom te ver"}</span>
        <h1>{ehCadastro ? "Criar conta" : "Entrar"}</h1>
        <p className="conta-cartao__sub">
          {ehCadastro
            ? "Cadastre-se para acompanhar seus pedidos e ganhar desconto na 1ª compra."
            : "Acesse sua conta para ver seu histórico de pedidos."}
        </p>

        {!configurado && (
          <p className="conta-aviso">
            ⚠️ O login ainda não está ativo neste preview (Supabase não
            conectado).
          </p>
        )}

        <form onSubmit={aoEnviar} className="conta-form">
          {ehCadastro && (
            <div className="campo">
              <label htmlFor="nome">Seu nome</label>
              <input
                id="nome"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                placeholder="Como podemos te chamar?"
                required
              />
            </div>
          )}
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => atualizar("email", e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={form.senha}
              onChange={(e) => atualizar("senha", e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {erro && <p className="conta-erro">{erro}</p>}
          {ok && <p className="conta-ok">{ok}</p>}

          <Botao
            type="submit"
            variante="primario"
            className="botao--bloco"
            disabled={enviando || !configurado}
          >
            {enviando
              ? "Aguarde…"
              : ehCadastro
                ? "Criar minha conta"
                : "Entrar"}
          </Botao>
        </form>

        <p className="conta-alternar">
          {ehCadastro ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
          <button
            type="button"
            onClick={() => {
              setModo(ehCadastro ? "entrar" : "cadastrar");
              setErro("");
              setOk("");
            }}
          >
            {ehCadastro ? "Entrar" : "Criar conta"}
          </button>
        </p>

        <Link to="/" className="conta-voltar">
          ← Voltar ao catálogo
        </Link>
      </div>
    </div>
  );
}
