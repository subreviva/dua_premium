"use client";

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';
import { useRichLinkDetection } from '@/hooks/useLinkDetection';
import { LinkPreview } from './link-preview';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  const { links, hasLinks, textParts } = useRichLinkDetection(content);

  // Debug: Log links detectados e conteúdo
  console.log('📝 Content:', content);
  console.log('🔗 hasLinks:', hasLinks);
  console.log('🔗 Links detectados:', links);
  console.log('📄 textParts:', textParts);

  // Remover URLs do conteúdo para evitar duplicação
  // ReactMarkdown vai renderizar o texto sem os links
  const contentWithoutLinks = hasLinks 
    ? links.reduce((text, link) => {
        return text.replace(link.text, ''); // Remove o link do texto
      }, content)
    : content;

  return (
    <div className={cn("prose prose-invert max-w-none space-y-3", className)}>
      {/* Renderizar texto com Markdown (sem os links que serão previews) */}
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
          
          // Links - Remover renderização padrão, vamos usar LinkPreview
          a({ href, children }) {
            // Se o link está na lista de links detectados, não renderizar aqui
            // Será renderizado como preview abaixo
            if (hasLinks && links.some(link => link.url === href)) {
              return null;
            }
            
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
        {contentWithoutLinks.trim() || ' '}
      </ReactMarkdown>

      {/* Renderizar previews de links detectados */}
      <AnimatePresence mode="popLayout">
        {hasLinks && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="space-y-3 mt-4"
          >
            {/* Debug: Mostrar quantidade de links */}
            <div className="text-xs text-white/40 mb-2">
              {links.length} link{links.length !== 1 ? 's' : ''} detectado{links.length !== 1 ? 's' : ''}
            </div>
            
            {links.map((link, index) => (
              <motion.div
                key={`${link.url}-${index}`}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 300,
                  damping: 25 
                }}
              >
                <LinkPreview url={link.url} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
