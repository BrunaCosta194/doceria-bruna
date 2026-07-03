import { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabase";

const AuthContexto = createContext(null);

function traduzErro(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem cadastro. Tente entrar.";
  if (m.includes("password") && m.includes("6"))
    return "A senha precisa de pelo menos 6 caracteres.";
  if (m.includes("email") && m.includes("valid"))
    return "Digite um e-mail válido.";
  return msg || "Algo deu errado. Tente novamente.";
}

export function ProvedorAuth({ children }) {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(undefined); // undefined = ainda carregando
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    if (!supabaseConfigurado) {
      setCarregandoSessao(false);
      setPerfil(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregandoSessao(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
    });
    return () => subscription.unsubscribe();
  }, []);

  const usuario = sessao?.user ?? null;

  useEffect(() => {
    if (!supabaseConfigurado || !usuario) {
      setPerfil(usuario ? undefined : null);
      return;
    }
    let ativo = true;
    setPerfil(undefined);
    supabase
      .from("perfis")
      .select("*")
      .eq("id", usuario.id)
      .single()
      .then(({ data }) => {
        if (ativo) setPerfil(data ?? null);
      });
    return () => {
      ativo = false;
    };
  }, [usuario?.id]);

  async function entrar(email, senha) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) throw new Error(traduzErro(error.message));
  }

  async function cadastrar(email, senha, nome) {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) throw new Error(traduzErro(error.message));
  }

  async function sair() {
    await supabase.auth.signOut();
  }

  // carregando enquanto a sessão resolve, ou o perfil de um usuário logado.
  const carregando =
    carregandoSessao || (Boolean(usuario) && perfil === undefined);

  const valor = {
    usuario,
    perfil: perfil === undefined ? null : perfil,
    ehAdmin: perfil?.papel === "admin",
    carregando,
    configurado: supabaseConfigurado,
    entrar,
    cadastrar,
    sair,
  };

  return (
    <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <ProvedorAuth>");
  return ctx;
}
