/// <reference types="vite/client" />

// Allow Iconify web component in TSX
declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      icon?: string;
      width?: string | number;
      height?: string | number;
      inline?: boolean;
    };
  }
}