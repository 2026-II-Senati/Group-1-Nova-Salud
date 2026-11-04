// Logo de la marca. "sobre" indica el fondo donde se coloca:
// "verde" (portada del login) usa el logo blanco; "blanco" (menú lateral) usa el teal.
const LOGOS = {
  verde: "/anumka-login.svg",
  blanco: "/anumka-panel.svg",
};

function MarcaLogo({ sobre = "verde", className = "" }) {
  return (
    <img
      src={LOGOS[sobre] ?? LOGOS.verde}
      alt=""
      aria-hidden="true"
      className={`object-contain ${className}`}
    />
  );
}

export default MarcaLogo;