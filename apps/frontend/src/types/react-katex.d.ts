
declare module 'react-katex' {
    import { ComponentType, ReactNode } from 'react';
    export interface LatexProps {
        children?: ReactNode;
        displayMode?: boolean;
        className?: string;
    }
    const Latex: ComponentType<LatexProps>;
    export default Latex;
}
