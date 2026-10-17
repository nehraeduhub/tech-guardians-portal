import { Fragment, type ReactNode } from 'react';

// Renders blog text written in simple Markdown — safely, without HTML:
// ## Heading, ### Subheading, > quote, - bullets, 1. numbered, ``` code ```,
// **bold**, *italic*, `code`, [text](https://link) and bare https:// links.

const safeHref = (u: string) => (/^https?:\/\//i.test(u) ? u : undefined);

const inline = (text: string, key = 'i'): ReactNode[] => {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^)\s]+)\)|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={`${key}-t${n++}`}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    const k = `${key}-${n++}`;
    if (tok.startsWith('**')) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={k} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('[')) {
      const label = tok.slice(1, tok.indexOf(']'));
      out.push(<a key={k} href={safeHref(m[2])} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">{label}</a>);
    } else if (tok.startsWith('*')) out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    else out.push(<a key={k} href={safeHref(tok)} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary underline decoration-primary/40 underline-offset-2">{tok}</a>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<Fragment key={`${key}-end`}>{text.slice(last)}</Fragment>);
  return out;
};

const BlogBody = ({ text }: { text: string }) => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;
  const isList = (l: string) => /^\s*[-*•]\s+/.test(l);
  const isNum = (l: string) => /^\s*\d+[.)]\s+/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { i++; continue; }
    if (t.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={k++} className="my-6 overflow-x-auto rounded-xl border border-border bg-[hsl(var(--tg-navy))] p-4 font-mono text-sm leading-6 text-slate-100"><code>{code.join('\n')}</code></pre>);
      continue;
    }
    if (/^###\s+/.test(t)) { blocks.push(<h3 key={k++} className="mb-3 mt-8 text-xl font-bold text-foreground">{inline(t.replace(/^###\s+/, ''), `h${k}`)}</h3>); i++; continue; }
    if (/^##\s+/.test(t) || /^#\s+/.test(t)) { blocks.push(<h2 key={k++} className="mb-4 mt-10 text-2xl font-extrabold text-foreground">{inline(t.replace(/^#+\s+/, ''), `h${k}`)}</h2>); i++; continue; }
    if (/^(-{3,}|\*{3,})$/.test(t)) { blocks.push(<hr key={k++} className="my-8 border-border" />); i++; continue; }
    if (t.startsWith('>')) {
      const q: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) q.push(lines[i++].trim().replace(/^>\s?/, ''));
      blocks.push(<blockquote key={k++} className="my-6 border-l-4 border-primary bg-primary/5 py-3 pl-5 pr-4 italic text-foreground/85">{inline(q.join(' '), `q${k}`)}</blockquote>);
      continue;
    }
    if (isList(line) || isNum(line)) {
      const ordered = isNum(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? isNum(lines[i]) : isList(lines[i]))) items.push(lines[i++].replace(/^\s*([-*•]|\d+[.)])\s+/, ''));
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(
        <Tag key={k++} className={`my-5 space-y-2 pl-6 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-primary`}>
          {items.map((it, j) => <li key={j} className="pl-1">{inline(it, `l${k}-${j}`)}</li>)}
        </Tag>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>|```|\s*[-*•]\s|\s*\d+[.)]\s)/.test(lines[i].trim())) para.push(lines[i++].trim());
    if (!para.length) { para.push(t); i++; }
    blocks.push(<p key={k++} className="my-5">{inline(para.join(' '), `p${k}`)}</p>);
  }
  return <div className="blog-prose text-[17px] leading-8 text-foreground/90">{blocks}</div>;
};

export default BlogBody;
