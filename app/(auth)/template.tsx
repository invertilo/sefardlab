/**
 * Se vuelve a montar en cada navegación (login ↔ registro): la tarjeta entra
 * con un fundido y una subida corta (`.route-enter` en globals.css).
 */
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>;
}
