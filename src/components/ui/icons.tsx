// Ícones em SVG de traço, próprios do app (sem arte oficial do jogo).

type IconProps = { size?: number; color?: string };

export function LogoStar({ size = 34 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M17 2 L19.5 14.5 L32 17 L19.5 19.5 L17 32 L14.5 19.5 L2 17 L14.5 14.5 Z" stroke="#dfe7f2" strokeWidth="1.2" />
      <path d="M6 9 Q11 4 17 6 M28 9 Q23 4 17 6" stroke="#8fdcef" strokeWidth="1" />
      <circle cx="17" cy="17" r="2" fill="#8fdcef" />
    </svg>
  );
}

export function CheckIcon({ size = 16, color = "#2a1d05" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5 L6.5 12 L13 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CrossIcon({ size = 12, color = "#a87880" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3 L9 9 M9 3 L3 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CrownIcon({ size = 12, color = "#2a1d05" }: IconProps) {
  return (
    <svg width={size} height={(size * 10) / 12} viewBox="0 0 12 10" fill="none" aria-hidden="true">
      <path d="M1 9 L1 3 L4 5.5 L6 1 L8 5.5 L11 3 L11 9 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoIcon({ size = 16, color = "#8fdcef" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.2" />
      <path d="M8 7 V12 M8 4.5 V5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WarningIcon({ size = 16, color = "#f0c86a" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5 L15 14 H1 Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8 6 V9.5 M8 11.5 V12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ClockIcon({ size = 16, color = "#e7a0aa" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke={color} strokeWidth="1.2" />
      <path d="M8 4 V8 L10.5 9.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
