import { useEffect, useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { ExternalLink, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { loadPdfs, type PdfResource } from '@/lib/local-content';

const categories = ['Networking', 'Hacking', 'Forensics', 'AI', 'Cybercrime', 'Awareness'];

const PdfLibrarySection = () => {
  const [resources, setResources] = useState<PdfResource[]>([]);

  useEffect(() => {
    void loadPdfs().then(setResources);
  }, []);

  const grouped = resources.reduce<Record<string, PdfResource[]>>((acc, r) => {
    const cat = r.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(r);
    return acc;
  }, {});

  const displayCategories = resources.length > 0 ? Object.keys(grouped) : categories;

  return (
    <section id="pdf-library" className="section-padding relative">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-display tracking-[0.3em] uppercase text-primary mb-4 block">Resources</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Your Knowledge <span className="neon-text text-primary">Arsenal</span>
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="multiple" className="space-y-3">
            {displayCategories.map((cat) => (
              <AccordionItem
                key={cat}
                value={cat}
                className="border border-border/60 rounded-xl bg-card/40 backdrop-blur-sm px-5 overflow-hidden"
              >
                <AccordionTrigger className="py-4 hover:no-underline gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-display text-sm font-semibold text-foreground">{cat}</span>
                    {grouped[cat] && (
                      <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {grouped[cat].length}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {grouped[cat] && grouped[cat].length > 0 ? (
                    <ul className="space-y-3">
                      {grouped[cat].map((r) => (
                        <li
                          key={r.id}
                          className="flex items-start justify-between gap-4 p-3 rounded-lg bg-background/40 border border-border/40"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                            {r.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>
                            )}
                          </div>
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-cyber-green transition-colors mt-0.5"
                          >
                            Open <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No resources in this category yet.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <Button asChild variant="outline" className="h-auto border-primary/30 bg-background/20 px-6 py-3 text-primary hover:bg-primary/10">
              <a href="/blog">Read the Blog</a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PdfLibrarySection;
