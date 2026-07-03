import { configuracoes } from "../lib/dados-exemplo";

// Versículo bíblico discreto. Reutilizável no rodapé e na confirmação.
export default function Versiculo({ className = "" }) {
  const { texto_versiculo, referencia_versiculo } = configuracoes;
  return (
    <figure className={`bloco-versiculo ${className}`.trim()}>
      <blockquote className="versiculo">“{texto_versiculo}”</blockquote>
      {referencia_versiculo && (
        <figcaption className="bloco-versiculo__ref">
          {referencia_versiculo}
        </figcaption>
      )}
    </figure>
  );
}
