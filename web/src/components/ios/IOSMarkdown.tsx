import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface IOSMarkdownProps {
  content: string;
  className?: string;
}

export function IOSMarkdown({ content, className = '' }: IOSMarkdownProps) {
  return (
    <div className={`ios-markdown ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
