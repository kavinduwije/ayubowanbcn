export function SunMark({ className = "", small = false }: { className?: string; small?: boolean }) {
  return <svg className={className} width={small ? 28 : 44} height={small ? 28 : 44} viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="9" stroke="currentColor" strokeWidth="1.7" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d="M22 3V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform={`rotate(${i * 30} 22 22)`} />)}
    <path d="M17 23c2 3 8 3 10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="18.5" cy="19.5" r=".8" fill="currentColor" /><circle cx="25.5" cy="19.5" r=".8" fill="currentColor" />
  </svg>;
}

export function Brand() {
  return <span className="brand"><SunMark /><span><span className="brand-name">Ayubowan<span>.</span></span><span className="brand-location">BARCELONA</span></span></span>;
}
