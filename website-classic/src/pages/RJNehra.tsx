import { motion } from 'framer-motion';
import { Award, BookOpen, Bot, BriefcaseBusiness, CheckCircle2, ExternalLink, Network, ServerCog, ShieldCheck, TerminalSquare } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import { waLink } from '@/lib/site-settings';
import portrait from '@/assets/founder-rj-nehra.jpg';

const expertise = [
  'Cyber Security Operations', 'Digital Forensics', 'Ethical Hacking', 'Cyber Threat Intelligence',
  'Incident Response', 'Endpoint Detection & Response', 'Network & Infrastructure Security',
  'Firewall & WAF Security', 'Active Directory', 'Windows & Linux Security', 'Data Centre Security',
  'Cybersecurity Awareness & Training',
];

const projects = [
  { icon: Network, title: 'In-House Cyber Range', text: 'Designed and implemented practical cyber ranges for training, controlled testing, and hands-on attack-and-defence learning, including advanced Proxmox-based environments.' },
  { icon: ShieldCheck, title: 'Threat Intelligence & News Portals', text: 'Developed a cyber threat intelligence portal and a live cybersecurity news platform designed to keep security information current and accessible.' },
  { icon: Bot, title: 'AI & Automation Systems', text: 'Built an AI-powered cybersecurity assistant bot, automated awareness-poster workflows, AI-assisted websites, and practical n8n integrations.' },
  { icon: ServerCog, title: 'Enterprise Security Infrastructure', text: 'Hands-on work across data centres, servers, networks, firewalls, monitoring technologies, endpoint security, and secure enterprise environments.' },
  { icon: TerminalSquare, title: 'Product Development', text: 'Developing remote-support, e-commerce, and video-conferencing platforms while exploring AI agents and modern web technologies.' },
  { icon: BriefcaseBusiness, title: 'Training & Awareness', text: 'Delivers practical, mentor-led cybersecurity learning for students, professionals, institutions, and security-conscious organizations.' },
];

const certifications = [
  'Certified Ethical Hacker (CEH)',
  'Computer Hacking Forensic Investigator (CHFI)',
  'Associate CISO',
  "Certified LEA's & Cyber Forensic",
  'Trend Micro EDR Certification',
  'Computer Hardware & Networking Trainer',
];

const RJNehra = () => (
  <SiteFrame>
    <section className="section-padding relative overflow-hidden border-b border-border/70">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
      <div className="container relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_360px]">
        <ScrollReveal>
          <span className="rl-eyebrow">Cyber Security Professional · Delhi, India</span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
            RJ <span className="cyber-gradient-text">Nehra</span>
          </h1>
          <p className="mt-4 font-mono text-sm text-primary md:text-base">Digital Forensics · Ethical Hacking · Threat Intelligence · Security Operations</p>
          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground">
            A cybersecurity and IT professional with 12 years of experience across enterprise infrastructure, data-centre operations, security technologies, digital forensics, networks, monitoring, and practical cyber training.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="cyber-btn-primary">Explore practical work</a>
            <a href={waLink('Hello RJ Nehra, I would like to connect regarding cybersecurity training or consulting.')} target="_blank" rel="noopener noreferrer" className="cyber-btn-outline">Connect on WhatsApp</a>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right">
          <motion.div whileHover={{ y: -5, rotateY: -2 }} className="glass-card overflow-hidden p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-primary/20">
              <img src={portrait} alt="RJ Nehra, Cyber Security Professional" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-6 pt-24">
                <p className="font-display text-xl font-bold text-foreground">RJ Nehra</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-cyber-green">Co-Founder · Tech Guardians</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center"><strong className="block text-xl text-primary">12</strong><span className="text-[11px] text-muted-foreground">Years in IT</span></div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center"><strong className="block text-xl text-cyber-orange">Silver</strong><span className="text-[11px] text-muted-foreground">CII SECEx 2025</span></div>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="max-w-3xl">
            <span className="rl-eyebrow">Professional profile</span>
            <h2 className="mt-4 text-3xl font-bold text-foreground">Infrastructure depth. Security mindset. Practical teaching.</h2>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">RJ Nehra combines extensive enterprise IT experience with a security-first approach. His work spans cybersecurity operations, incident-related activities, secure infrastructure, hands-on labs, digital investigations, awareness programs, and the development of useful security platforms under Tech Guardians.</p>
          </div>
        </ScrollReveal>
        <div className="mt-10 flex flex-wrap gap-2">
          {expertise.map((item) => <span key={item} className="rl-pill">{item}</span>)}
        </div>
      </div>
    </section>

    <section id="work" className="section-padding border-y border-border/60 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal><span className="rl-eyebrow">Selected hands-on work</span><h2 className="mt-4 text-3xl font-bold text-foreground">Building real environments, tools, and learning systems</h2></ScrollReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ScrollReveal key={project.title} delay={index * 0.06}>
              <div className="glass-card h-full p-6">
                <project.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 text-lg font-semibold text-foreground">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="section-padding">
      <div className="container mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <ScrollReveal direction="left">
          <div className="h-full rounded-xl border border-border bg-card/50 p-7">
            <Award className="h-8 w-8 text-cyber-orange" />
            <h2 className="mt-5 text-2xl font-bold text-foreground">Credentials & recognition</h2>
            <div className="mt-6 space-y-3">{certifications.map((item) => <div key={item} className="flex gap-3 text-sm text-muted-foreground"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyber-green" /><span>{item}</span></div>)}</div>
            <div className="mt-7 rounded-lg border border-cyber-orange/30 bg-cyber-orange/10 p-4"><strong className="text-cyber-orange">2nd Position — CII SECEx 2025</strong><p className="mt-1 text-xs text-muted-foreground">Recognized as a Silver Medalist.</p></div>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right">
          <div className="glass-card h-full p-7">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="mt-5 block text-xs uppercase tracking-widest text-cyber-green">Authored by RJ Nehra</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground">Cyber Jaal</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">A cybersecurity book created to help readers understand the digital traps, online risks, and practical habits needed for a safer connected life.</p>
            <a href="https://www.flipkart.com/" target="_blank" rel="noopener noreferrer" className="cyber-btn-primary mt-7">Buy on Flipkart <ExternalLink className="h-4 w-4" /></a>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="section-padding pt-0 text-center">
      <div className="container mx-auto max-w-4xl rounded-xl border border-primary/30 bg-primary/5 p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyber-green">Keep Learning and Keep Sharing</p>
        <h2 className="mt-4 text-3xl font-bold text-foreground">Practical cybersecurity for real-world challenges</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Connect for cybersecurity training, cyber-range development, awareness programs, enterprise security, and technical collaboration.</p>
        <a href={waLink('Hello RJ Nehra, I would like to discuss a cybersecurity project.')} target="_blank" rel="noopener noreferrer" className="cyber-btn-primary mt-7">Start a conversation</a>
      </div>
    </section>
  </SiteFrame>
);

export default RJNehra;