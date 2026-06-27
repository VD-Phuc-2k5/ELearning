import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'phantom-ui': {
        loading?: boolean;
        animation?: 'shimmer' | 'pulse' | 'breathe' | 'solid';
        duration?: number;
        stagger?: number;
        reveal?: number;
        count?: number;
        'count-gap'?: number;
        'background-color'?: string;
        'shimmer-color'?: string;
        className?: string;
        style?: React.CSSProperties;
        children?: React.ReactNode;
      };
    }
  }
}
