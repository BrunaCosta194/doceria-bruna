import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContexto";
import Botao from "../componentes/Botao";
import "./conta.css";

export default function Entrar() {
  const { entrar, cadastrar, entrarComGoogle, configurado } = useAuth();
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

  async function aoEntrarGoogle() {
    setErro("");
    try {
      await entrarComGoogle();
    } catch (err) {
      setErro(err.message);
    }
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

        <button
          type="button"
          className="botao-google"
          onClick={aoEntrarGoogle}
          disabled={!configurado}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
            />
          </svg>
          Continuar com Google
        </button>

        <div className="conta-divisor" aria-hidden="true">
          <span>ou</span>
        </div>

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
