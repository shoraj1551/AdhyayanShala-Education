
import 'katex/dist/katex.min.css';
import Latex from 'react-katex';

interface MathRendererProps {
    text: string;
    block?: boolean;
}

export const MathRenderer = ({ text, block = false }: MathRendererProps) => {
    if (!text) return null;

    // Simple regex to detect $...$ for inline math
    const parts = text.split(/(\$[^\$]+\$)/g);

    return (
        <span className={block ? "block my-2" : ""}>
            {parts.map((part, i) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    // Remove $ symbols
                    const math = part.slice(1, -1);
                    return <Latex key={i}>{math}</Latex>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};
