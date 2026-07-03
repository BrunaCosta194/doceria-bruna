import { Link } from "react-router-dom";
import "./Botao.css";

export default function Botao({
  children,
  variante = "primario",
  como = "button",
  para,
  className = "",
  ...resto
}) {
  const classes = `botao botao--${variante} ${className}`.trim();

  if (como === "link") {
    return (
      <Link to={para} className={classes} {...resto}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...resto}>
      {children}
    </button>
  );
}
