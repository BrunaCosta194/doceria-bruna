import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorCarrinho } from "./loja/CarrinhoContexto";
import Layout from "./componentes/Layout";
import Catalogo from "./loja/Catalogo";
import Produto from "./loja/Produto";
import Carrinho from "./loja/Carrinho";
import Checkout from "./loja/Checkout";
import Confirmacao from "./loja/Confirmacao";
import MeusPedidos from "./conta/MeusPedidos";

export default function App() {
  return (
    <ProvedorCarrinho>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Catalogo />} />
            <Route path="produto/:id" element={<Produto />} />
            <Route path="carrinho" element={<Carrinho />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmacao" element={<Confirmacao />} />
            <Route path="conta/meus-pedidos" element={<MeusPedidos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProvedorCarrinho>
  );
}
