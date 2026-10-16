import { Fragment, type ReactNode } from 'react';

// Renders admin-written text safely (no HTML): blank line = paragraph,
// "- " = bullet, **bold**, bare http(s) links and emails become links,
// and {placeholders} are filled from `vars`.

const inline = (text: string, key: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g).map((part, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <b key={k}>{part.slice(2, -2)}</b>;
    if (/^https?:\/\//.test(part)) return <a key={k} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline">{part.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>;
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) return <a key={k} href={`mailto:${part}`} className="text-primary underline">{part}</a>;
    return <Fragment key={k}>{part}</Fragment>;
  });

const RichText = ({ text, vars = {} }: { text: string; vars?: Record<string, string> }) => {
  const filled = text.replace(/\{(\w+)\}/g, (m, name: string) => vars[name] ?? m);
  return (
    <>
      {filled.split(/\n\s*\n/).map((block, b) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return null;
        if (lines.every((l) => l.startsWith('- '))) {
          return <ul key={b}>{lines.map((l, i) => <li key={i}>{inline(l.slice(2), `${b}-${i}`)}</li>)}</ul>;
        }
        return <p key={b}>{inline(lines.join(' '), String(b))}</p>;
      })}
    </>
  );
};

export default RichText;
