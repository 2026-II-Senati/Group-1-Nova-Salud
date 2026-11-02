function MarcaLogo({ sobre = "verde", className = "" }) {
  // Aquí irá el logo cuando el equipo lo defina
  const fondo =
    sobre === "verde" ? "bg-white/10 ring-1 ring-white/30" : "bg-botica";

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-2xl ${fondo} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3/5 w-3/5 text-white" fill="currentColor">
        <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
      </svg>
    </span>
  );
}

export default MarcaLogo;