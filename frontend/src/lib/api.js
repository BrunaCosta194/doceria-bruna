import { supabase, supabaseConfigurado } from "./supabase";

// Chama a Edge Function `criar-pedido`. O servidor é a fonte de verdade:
// recalcula subtotal, frete e desconto e devolve o pedido gravado.
export async function criarPedido(payload) {
  if (!supabaseConfigurado) {
    throw new Error("SEM_SUPABASE");
  }
  const { data, error } = await supabase.functions.invoke("criar-pedido", {
    body: payload,
  });
  if (error) {
    // A função devolve { erro } com mensagem amigável no corpo.
    let mensagem = "Não foi possível concluir o pedido. Tente novamente.";
    try {
      const corpo = await error.context?.json?.();
      if (corpo?.erro) mensagem = corpo.erro;
    } catch {
      /* usa a mensagem padrão */
    }
    throw new Error(mensagem);
  }
  return data.pedido;
}
