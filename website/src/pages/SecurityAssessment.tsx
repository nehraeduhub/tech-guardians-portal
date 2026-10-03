import { useEffect, useState } from 'react';
import SiteFrame from '@/components/SiteFrame';
import ScrollReveal from '@/components/ScrollReveal';
import {
  Network,
  ShieldCheck,
  Layers,
  Lock,
  Server,
  Bug,
  Laptop,
  ScrollText,
  DatabaseBackup,
  Router,
} from 'lucide-react';
import { waLink } from '@/lib/site-settings';
import { getOrganizationOffering, type OrganizationOffering } from '@/lib/organization-offerings-store';

const services = [
  {
    icon: Network,
    title: 'Network Security Assessment',
    desc: 'End-to-end review of your LAN, WAN and wireless environment to identify exposed services, weak trust boundaries and misconfigurations.',
    points: ['Topology and asset discovery', 'Exposed service review', 'Wireless and remote access checks'],
  },
  {
    icon: Layers,
    title: 'Secure Network Architecture Review',
    desc: 'Design-level review of how traffic flows across your perimeter, DMZ, internal zones and cloud links against defence-in-depth principles.',
    points: ['Perimeter and DMZ design', 'Zero-trust alignment', 'Redundancy and failover review'],
  },
  {
    icon: Lock,
    title: 'Firewall & ACL Assessment',
    desc: 'Rule-base audit of your firewall and router ACLs to remove permissive, shadowed and unused rules that quietly widen the attack surface.',
    points: ['Rule-base hygiene audit', 'Any-any and shadow rule cleanup', 'Policy hardening baseline'],
  },
  {
    icon: Router,
    title: 'VLAN & Network Segmentation',
    desc: 'Validation of segmentation between users, servers, guests, IoT/CCTV and management networks to contain lateral movement.',
    points: ['VLAN and inter-VLAN policy review', 'Management network isolation', 'Lateral movement testing'],
  },
  {
    icon: ShieldCheck,
    title: 'NAT / VPN Security',
    desc: 'Assessment of NAT mappings, published services and remote-access VPN configuration, encryption strength and authentication controls.',
    points: ['NAT and port-forward review', 'VPN crypto and MFA checks', 'Split-tunnel risk analysis'],
  },
  {
    icon: Server,
    title: 'Server & Active Directory Security',
    desc: 'Hardening review of Windows/Linux servers and Active Directory: privileged accounts, delegation, GPO baselines and password policy.',
    points: ['Privileged account review', 'GPO and hardening baselines', 'AD attack path analysis'],
  },
  {
    icon: Bug,
    title: 'Vulnerability Assessment',
    desc: 'Authenticated and unauthenticated scanning with manual validation, so you get a prioritised, false-positive-free remediation plan.',
    points: ['Internal and external scanning', 'Manual validation of findings', 'Risk-ranked remediation roadmap'],
  },
  {
    icon: Laptop,
    title: 'Endpoint Security',
    desc: 'Review of antivirus/EDR coverage, patch levels, USB and application control, disk encryption and local administrator exposure.',
    points: ['EDR/AV coverage gaps', 'Patch and configuration drift', 'Device and USB control'],
  },
  {
    icon: ScrollText,
    title: 'Logging & Monitoring',
    desc: 'Verification that critical events are collected, retained and actually alertable — so incidents are detected, not discovered later.',
    points: ['Log source coverage matrix', 'Retention and integrity checks', 'Alert and use-case tuning'],
  },
  {
    icon: DatabaseBackup,
    title: 'Backup & Disaster Recovery',
    desc: 'Assessment of backup design, offline/immutable copies and restore testing to ensure ransomware resilience and business continuity.',
    points: ['3-2-1 backup validation', 'Immutable / offline copy review', 'Restore and RTO/RPO testing'],
  },
];

const SecurityAssessment = () => {
  const [offering, setOffering] = useState<OrganizationOffering | undefined>();

  useEffect(() => {
    const refresh = () => setOffering(getOrganizationOffering('security-assessment'));
    refresh();
    window.addEventListener('tg-settings-changed', refresh);
    return () => window.removeEventListener('tg-settings-changed', refresh);
  }, []);

  return (
  <SiteFrame>
    <section className="px-4 pt-8 pb-12">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <ShieldCheck className="w-3.5 h-3.5" /> Security Assessment Services
          </span>
          <h1 className="font-display mt-5 text-3xl md:text-5xl font-bold leading-tight text-foreground max-w-4xl">
            {offering?.title || 'Secure Your Organization Before Attackers Find the Weaknesses.'}
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base text-muted-foreground leading-relaxed">
            {offering?.description || 'Tech Guardians delivers expert cybersecurity guidance, network security assessment, firewall consulting, vulnerability assessment and security awareness training — carried out by experienced professionals and reported in plain, actionable language.'}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
               href={waLink('Hi Tech Guardians, I would like to book a Security Assessment.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-bold text-background shadow-[0_10px_40px_-10px_hsl(var(--cyber-green)/0.8)] hover:brightness-110 transition-all"
              style={{ background: 'linear-gradient(90deg, hsl(var(--cyber-green)), hsl(var(--primary)))' }}
            >
              Book Assessment
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* Services */}
    <section className="px-4 pb-14">
      <div className="container mx-auto max-w-6xl grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <ScrollReveal key={s.title}>
            <div className="h-full rounded-2xl border border-border bg-card/70 backdrop-blur p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_10px_40px_-20px_hsl(var(--primary)/0.6)]">
              <div className="w-11 h-11 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display mt-4 text-lg font-semibold text-foreground">{s.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              <ul className="mt-4 space-y-1.5">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2 text-[12.5px] text-foreground/80">
                    <span className="text-primary">▸</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>

    {/* Architecture diagram */}
    <section className="px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 md:p-9">
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Secure Network Architecture — Security Perspective
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
              A layered reference design showing how traffic is inspected, segmented and monitored
              from the internet edge down to endpoints, servers and backup.
            </p>

            <div className="mt-6 overflow-x-auto">
              <svg viewBox="0 0 980 560" role="img" aria-label="Secure network architecture diagram" className="min-w-[760px] w-full">
                <defs>
                  <style>{`
                    .zn{fill:hsl(var(--card));stroke:hsl(var(--border));stroke-width:1.5;rx:12}
                    .zt{font:600 13px sans-serif;fill:hsl(var(--foreground))}
                    .zs{font:400 11px sans-serif;fill:hsl(var(--muted-foreground))}
                    .lbl{font:600 10px sans-serif;fill:hsl(var(--primary));letter-spacing:1px}
                    .ln{stroke:hsl(var(--primary));stroke-width:2;fill:none;opacity:.75}
                    .ln2{stroke:hsl(var(--muted-foreground));stroke-width:1.5;fill:none;stroke-dasharray:5 5;opacity:.6}
                  `}</style>
                  <marker id="ar" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
                    <path d="M0,0 L9,4.5 L0,9 z" fill="hsl(var(--primary))" />
                  </marker>
                </defs>

                {/* Internet */}
                <rect className="zn" x="380" y="16" width="220" height="54" rx="12" />
                <text className="zt" x="490" y="40" textAnchor="middle">Internet / Untrusted Zone</text>
                <text className="zs" x="490" y="58" textAnchor="middle">Attackers · Phishing · Botnets</text>

                {/* Edge router */}
                <rect className="zn" x="380" y="100" width="220" height="52" rx="12" />
                <text className="zt" x="490" y="122" textAnchor="middle">Edge Router + ISP Link</text>
                <text className="zs" x="490" y="139" textAnchor="middle">Anti-spoof ACLs · Rate limiting</text>

                {/* Firewall */}
                <rect className="zn" x="330" y="182" width="320" height="62" rx="12" />
                <text className="lbl" x="490" y="203" textAnchor="middle">POLICY ENFORCEMENT POINT</text>
                <text className="zt" x="490" y="221" textAnchor="middle">Next-Gen Firewall (IPS · Web/App Filter · NAT · VPN)</text>
                <text className="zs" x="490" y="237" textAnchor="middle">Deny-by-default rule base · SSL inspection · Geo-blocking</text>

                {/* DMZ */}
                <rect className="zn" x="40" y="200" width="240" height="86" rx="12" />
                <text className="lbl" x="60" y="222">DMZ</text>
                <text className="zt" x="60" y="243">Public Services</text>
                <text className="zs" x="60" y="261">Web · Mail relay · Reverse proxy</text>
                <text className="zs" x="60" y="277">No direct path to internal LAN</text>

                {/* Remote access */}
                <rect className="zn" x="700" y="200" width="240" height="86" rx="12" />
                <text className="lbl" x="720" y="222">REMOTE ACCESS</text>
                <text className="zt" x="720" y="243">VPN + MFA</text>
                <text className="zs" x="720" y="261">Encrypted tunnels · No split tunnel</text>
                <text className="zs" x="720" y="277">Least-privilege access policies</text>

                {/* Core switch */}
                <rect className="zn" x="360" y="286" width="260" height="52" rx="12" />
                <text className="zt" x="490" y="308" textAnchor="middle">Core Switch — VLAN Segmentation</text>
                <text className="zs" x="490" y="325" textAnchor="middle">Inter-VLAN ACLs · Port security · 802.1X</text>

                {/* Segments */}
                <rect className="zn" x="40" y="378" width="210" height="84" rx="12" />
                <text className="lbl" x="60" y="400">VLAN 10</text>
                <text className="zt" x="60" y="421">User Endpoints</text>
                <text className="zs" x="60" y="439">EDR · Patching · Disk encryption</text>
                <text className="zs" x="60" y="455">USB &amp; application control</text>

                <rect className="zn" x="270" y="378" width="210" height="84" rx="12" />
                <text className="lbl" x="290" y="400">VLAN 20</text>
                <text className="zt" x="290" y="421">Server Farm / AD</text>
                <text className="zs" x="290" y="439">Tiered admin model · GPO baseline</text>
                <text className="zs" x="290" y="455">Hardened Windows / Linux</text>

                <rect className="zn" x="500" y="378" width="210" height="84" rx="12" />
                <text className="lbl" x="520" y="400">VLAN 30</text>
                <text className="zt" x="520" y="421">Guest / IoT / CCTV</text>
                <text className="zs" x="520" y="439">Fully isolated from corporate</text>
                <text className="zs" x="520" y="455">Internet-only egress</text>

                <rect className="zn" x="730" y="378" width="210" height="84" rx="12" />
                <text className="lbl" x="750" y="400">VLAN 99</text>
                <text className="zt" x="750" y="421">Management Network</text>
                <text className="zs" x="750" y="439">Jump host · MFA · Restricted</text>
                <text className="zs" x="750" y="455">No internet exposure</text>

                {/* Monitoring & backup */}
                <rect className="zn" x="140" y="492" width="320" height="52" rx="12" />
                <text className="zt" x="300" y="514" textAnchor="middle">Logging &amp; Monitoring (SIEM)</text>
                <text className="zs" x="300" y="531" textAnchor="middle">Centralised logs · Alerting · Retention</text>

                <rect className="zn" x="520" y="492" width="320" height="52" rx="12" />
                <text className="zt" x="680" y="514" textAnchor="middle">Backup &amp; Disaster Recovery</text>
                <text className="zs" x="680" y="531" textAnchor="middle">3-2-1 · Immutable copies · Restore tests</text>

                {/* Links */}
                <path className="ln" d="M490,70 L490,100" markerEnd="url(#ar)" />
                <path className="ln" d="M490,152 L490,182" markerEnd="url(#ar)" />
                <path className="ln" d="M330,213 L280,235" markerEnd="url(#ar)" />
                <path className="ln" d="M650,213 L700,235" markerEnd="url(#ar)" />
                <path className="ln" d="M490,244 L490,286" markerEnd="url(#ar)" />
                <path className="ln" d="M420,338 L145,378" markerEnd="url(#ar)" />
                <path className="ln" d="M470,338 L375,378" markerEnd="url(#ar)" />
                <path className="ln" d="M520,338 L605,378" markerEnd="url(#ar)" />
                <path className="ln" d="M570,338 L835,378" markerEnd="url(#ar)" />
                <path className="ln2" d="M300,462 L300,492" />
                <path className="ln2" d="M680,462 L680,492" />
              </svg>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>

    {/* CTA */}
    <section className="px-4 pb-20">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-6 py-10 md:px-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Ready to find your weaknesses before attackers do?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">
              Talk to our assessment team, or bring cyber awareness training to your school, college or organisation.
            </p>
            <div className="mt-7 flex justify-center">
              <a
                href={waLink('Hi Tech Guardians, I want to book a security assessment.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-9 py-3.5 text-sm font-bold text-background shadow-[0_10px_40px_-10px_hsl(var(--cyber-green)/0.8)] hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(90deg, hsl(var(--cyber-green)), hsl(var(--primary)))' }}
              >
                Book Assessment
              </a>
            </div>
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Keep Learning, Keep Sharing
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  </SiteFrame>
  );
};

export default SecurityAssessment;
