import SiteFrame from '@/components/SiteFrame';
import { ShieldCheck, FolderOpen } from 'lucide-react';

// Local-folder content management notice page.
// All editable content now lives in /public/content/*.json and /public/(images|pdfs|media|videos)/.
const Admin = () => {
  return (
    <SiteFrame mainClassName="pt-28">
      <section className="section-padding">
        <div className="container mx-auto max-w-2xl">
          <div className="glass-card p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">Local Content Management</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              This site reads everything from your local <code className="text-primary">public/</code> folder.
              To update content, edit the matching JSON file or drop assets into the relevant folder, then rebuild.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left text-xs">
              {[
                { label: 'Blog posts', path: 'public/content/blogs.json' },
                { label: 'Courses list', path: 'public/content/courses.json' },
                { label: 'PDF library', path: 'public/content/pdfs.json' },
                { label: 'Media gallery', path: 'public/content/media.json' },
                { label: 'YouTube videos', path: 'public/content/videos.json' },
                { label: 'Course pages (HTML)', path: 'public/courses/*.html' },
                { label: 'Images', path: 'public/images/' },
                { label: 'PDFs', path: 'public/pdfs/' },
              ].map(item => (
                <div key={item.path} className="flex items-start gap-2 p-3 rounded-lg border border-border/60 bg-background/40">
                  <FolderOpen className="w-4 h-4 text-cyber-green mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-foreground">{item.label}</div>
                    <code className="text-[11px] text-muted-foreground break-all">{item.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
};

export default Admin;
