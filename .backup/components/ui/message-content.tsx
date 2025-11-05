"use client";

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          // Code blocks com syntax highlighting
          code(props) {
            const { node, className, children, ...rest } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const inline = !match;
            
            return !inline ? (
              <SyntaxHighlighter
                style={oneDark as any}
                language={language}
                PreTag="div"
                className="rounded-lg !bg-black/40 !mt-2 !mb-2"
                showLineNumbers
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-neutral-900/60 text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono" 
                {...rest}
              >
                {children}
              </code>
            );
          },
          
          // Parágrafos
          p({ children }) {
            return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
          },
          
          // Links
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },
          
          // Listas
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>;
          },
          
          // Headings
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>;
          },
          
          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-neutral-600 pl-4 italic my-2 text-neutral-300">
                {children}
              </blockquote>
            );
          },
          
          // Strong/Bold
          strong({ children }) {
            return <strong className="font-bold text-white">{children}</strong>;
          },
          
          // Emphasis/Italic
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
