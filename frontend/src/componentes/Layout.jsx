import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Cabecalho from "./Cabecalho";
import Rodape from "./Rodape";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="app-shell">
      <Cabecalho />
      <main>
        <Outlet />
      </main>
      <Rodape />
    </div>
  );
}
