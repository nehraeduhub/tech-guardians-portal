import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

const TGBlogsButton = () => (
  <section className="px-4 pb-16 md:px-8 md:pb-20">
    <div className="container mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="flex flex-col items-center justify-between gap-5 border-y border-border/70 bg-card/40 px-5 py-7 text-center sm:flex-row sm:text-left md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Tech Guardians Blogs</h2>
              <p className="mt-1 text-sm text-muted-foreground">Practical cyber safety insights, guides, and expert analysis.</p>
            </div>
          </div>
          <Link to="/tg-blogs" className="cyber-btn-primary shrink-0">
            Explore TG Blogs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default TGBlogsButton;