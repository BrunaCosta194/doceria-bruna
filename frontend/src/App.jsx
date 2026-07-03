import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProvedorCarrinho } from "./loja/CarrinhoContexto";
import { ProvedorAuth } from "./conta/AuthContexto";
import Layout from "./componentes/Layout";
import Catalogo from "./loja/Catalogo";
import Produto from "./loja/Produto";
import Carrinho from "./loja/Carrinho";
import Checkout from "./loja/Checkout";
import Confirmacao from "./loja/Confirmacao";
import Entrar from "./conta/Entrar";
import MeusPedidos from "./conta/MeusPedidos";
import RotaProtegida from "./componentes/RotaProtegida";
import PainelLayout from "./painel/PainelLayout";
import PainelPedidos from "./painel/PainelPedidos";
import PainelProdutos from "./painel/PainelProdutos";
import PainelZonas from "./painel/PainelZonas";
import PainelConfig from "./painel/PainelConfig";

export default function App() {
  return (
    <ProvedorAuth>
      <ProvedorCarrinho>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Catalogo />} />
              <Route path="produto/:id" element={<Produto />} />
              <Route path="carrinho" element={<Carrinho />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="confirmacao" element={<Confirmacao />} />
              <Route path="entrar" element={<Entrar />} />
              <Route path="conta/meus-pedidos" element={<MeusPedidos />} />
            </Route>

            <Route
              path="/painel"
              element={
                <RotaProtegida exigirAdmin>
                  <PainelLayout />
                </RotaProtegida>
              }
            >
              <Route index element={<PainelPedidos />} />
              <Route path="produtos" element={<PainelProdutos />} />
              <Route path="zonas" element={<PainelZonas />} />
              <Route path="config" element={<PainelConfig />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProvedorCarrinho>
    </ProvedorAuth>
  );
}
