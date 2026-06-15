import { SVGProps } from "react";

/**
 * ────────────── INDEX DE ÍCONES DISPONÍVEIS ──────────────
 * 
 * LoadingIcon - Ícone de carregamento
 * StarIcon    - Ícone de estrela
 * 
 * ─────────────────────────────────────────────────────────
 */

type IconProps = SVGProps<SVGSVGElement>;

export function LoadingIcon({ 
  className = "w-6 h-6", 
  viewBox = "0 0 24 24",
  fill = "none",        
  ...props 
}: IconProps) {
  return (
    <svg 
      viewBox={viewBox}
      fill={fill}
      stroke="currentColor" 
      strokeWidth="2" 
      className={className}
      {...props} 
    >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export function StarIcon({
    className = "w-6 h-6",
    viewBox = "0 0 16 16",
    fill = "none",
    ...props
}: IconProps) {
    return (
    <svg 
      viewBox={viewBox}
      fill={fill}
      stroke="currentColor" 
      strokeWidth="2" 
      className={className}
      {...props} 
    >
    <path stroke-linecap="round" stroke-linejoin="round" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.36a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
    </svg>
    );
}
