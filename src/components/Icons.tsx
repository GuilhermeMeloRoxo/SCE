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
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.36a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
    </svg>
    );
}

export function ProfileIcon({
    className = "w-6 h-6",
    viewBox="0 0 20 20",
    fill="currentColor",
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
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
      </svg>
    )
}

export function GithubIcon({
    className = "w-6 h-6",
    viewBox = "0 0 24 24",
    fill = "currentColor",
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
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
  )
}