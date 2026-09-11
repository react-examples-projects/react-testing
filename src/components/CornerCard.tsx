type CrossProps = { color?: string; size?: string };

/**
 * Dibuja una cruz (+) con dos <span> superpuestos:
 *
 * Lógica:
 * 1. El contenedor tiene `relative` + `flex items-center justify-center`,
 *    lo que establece el contexto de posición y centra su contenido.
 *    Al definir el tamaño del contenedor las cruces se escalan proporcionalmente.
 *
 * 2. El primer <span> tiene `w-full h-px`: ocupa todo el ancho del contenedor (0.75rem = 12px)
 *    pero solo 1px de alto → forma la línea horizontal.
 *
 * 3. El segundo <span> tiene `w-px h-full`: ocupa todo el alto del contenedor (0.75rem = 12px)
 *    pero solo 1px de ancho → forma la línea vertical.
 *
 * 4. Ambos spans son `absolute` sin coordenadas (top/left/right/bottom),
 *    por lo que se posicionan en la esquina superior izquierda (0,0) del
 *    contenedor. El flexbox del padre los centra automáticamente,
 *    haciendo que se crucen justo en el medio y formen una cruz perfecta.
 */
function Cross({ color = "bg-zinc-400", size = "w-3 h-3" }: CrossProps) {
  return (
    <div className={`relative flex items-center justify-center ${size}`}>
      {/* Línea horizontal: ancho completo, 1px de alto */}
      <span className={`absolute w-full h-px ${color}`} />

      {/* Línea vertical: 1px de ancho, alto completo */}
      <span className={`absolute w-px h-full ${color}`} />
    </div>
  );
}

// Posiciones de las 4 esquinas con el offset para centrar cada cruz en el borde
const CORNER_POSITIONS = [
  "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const;

/** Renderiza una cruz en cada una de las 4 esquinas del contenedor padre. */
function Corners({ color, size }: CrossProps) {
  return (
    <>
      {CORNER_POSITIONS.map((pos) => (
        <span key={pos} className={`absolute ${pos}`}>
          <Cross color={color} size={size} />
        </span>
      ))}
    </>
  );
}

type CornerDotCardProps = {
  title: string;
  status: string;
  description: string;
  version: string;
  heading?: string;
  buttonLabel?: string;
  onAction?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function CornerDotCard({
  title,
  status,
  description,
  version,
  heading = "Dark Interface\nDesign System",
  buttonLabel = "EXPLORE →",
  onAction,
  className,
  ...props
}: CornerDotCardProps) {
  // Soporta títulos multilínea: cada "\n" se convierte en un <br />
  const headingLines = heading.split("\n");

  return (
    <div
      className={`relative p-8 bg-zinc-950 text-zinc-100 w-80 border border-zinc-700 overflow-visible ${className ?? ""}`}
      {...props}
    >
      {/* Esquinas decorativas de la card */}
      <Corners />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-mono">{title}</span>
          <span className="text-xs font-mono text-emerald-400">● {status}</span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 leading-tight">
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h2>

        <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-600 font-mono">v{version}</span>

          <button
            onClick={onAction}
            className="cursor-pointer relative text-xs font-mono text-zinc-300 px-4 py-1.5 group border border-zinc-600 hover:border-zinc-400 transition-colors overflow-visible"
          >
            {/*
             * Esquinas del botón: más pequeñas (w-2 h-2) que las de la card.
             * "group-hover:bg-zinc-300" cambia el color al hacer hover en el botón
             * gracias a la clase "group" del <button> padre.
             */}
            <Corners color="bg-zinc-500 group-hover:bg-zinc-300" size="w-2 h-2" />
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
