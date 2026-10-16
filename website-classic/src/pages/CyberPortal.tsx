import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Phone, Mail, CreditCard, Car, Camera, Smartphone, MapPin, Activity,
  ShieldAlert, FileWarning, UserX, Lock, Globe, Database, AlertTriangle, Eye,
  Building2, Scale, BookOpen, ExternalLink, Heart, Fingerprint, KeyRound,
  Cpu, Radar, Bug, Network, Mail as MailIcon, Hash, FileCheck, Loader2,
} from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import { waLink } from '@/lib/site-settings';
import ScrollReveal from '@/components/ScrollReveal';
import GlassCard from '@/components/GlassCard';

type Item = {
  name: string;
  desc: string;
  url: string;
  icon: any;
  badge?: string;
};

// === REAL-TIME LOOKUP ENGINES (top, expanded) ===
const lookups: Item[] = [
  { name: 'Mobile Number Lookup', desc: 'Identify spam, scam and unknown callers with risk scoring.', url: 'https://www.truecaller.com/', icon: Phone, badge: 'Live' },
  { name: 'Email Breach Check', desc: 'See if your email appeared in any public data breach.', url: 'https://haveibeenpwned.com/', icon: MailIcon, badge: 'Live' },
  { name: 'Password Breach Check', desc: 'Test if your password is part of leaked credential dumps.', url: 'https://haveibeenpwned.com/Passwords', icon: KeyRound, badge: 'Live' },
  { name: 'Privacy Analyzer', desc: 'Scan your digital footprint across trackers and data brokers.', url: 'https://privacyanalyzer.net/', icon: Eye, badge: 'New' },
  { name: 'Vehicle Info (RC Lookup)', desc: 'Verify any Indian vehicle registration via Parivahan.', url: 'https://vahan.parivahan.gov.in/nrservices/faces/user/searchstatus.xhtml', icon: Car, badge: 'Govt' },
  { name: 'Driving Licence Lookup', desc: 'Check DL validity across all Indian states.', url: 'https://parivahan.gov.in/parivahan/en/content/driving-licence-0', icon: Fingerprint, badge: 'Govt' },
  { name: 'Leaked Credit / Debit Card', desc: 'Verify if your card BIN/PAN appeared in leaked dumps.', url: 'https://bincheck.io/', icon: CreditCard, badge: 'Live' },
  { name: 'Google Activity & My Account', desc: 'Audit every login, device, and app linked to your Google account.', url: 'https://myactivity.google.com/myactivity', icon: Activity, badge: 'Live' },
  { name: 'Google Location Timeline', desc: 'See every place your phone tracked across days and years.', url: 'https://www.google.com/maps/timeline', icon: MapPin, badge: 'Live' },
  { name: 'Photo Forensics & Deepfake Check', desc: 'Analyze EXIF, manipulations, AI generation and deepfakes.', url: 'https://fotoforensics.com/', icon: Camera, badge: 'Forensic' },
  { name: 'Reverse Image Search', desc: 'Find where any photo appears online — useful for catfishing.', url: 'https://images.google.com/', icon: Search },
  { name: 'KYC Leak Check (Aadhaar / PAN)', desc: 'Verify if your KYC documents leaked via UIDAI tools.', url: 'https://myaadhaar.uidai.gov.in/', icon: ShieldAlert, badge: 'UIDAI' },
  { name: 'PAN ↔ Aadhaar Link Status', desc: 'Verify PAN-Aadhaar link & PAN validity via Income Tax.', url: 'https://www.incometax.gov.in/iec/foportal/', icon: Scale, badge: 'Govt' },
  { name: 'IP / Domain Reputation', desc: 'Check if an IP or domain is malicious or blacklisted.', url: 'https://www.virustotal.com/', icon: Globe, badge: 'Live' },
  { name: 'Data Broker Opt-Out Scan', desc: 'Find brokers exposing your name, address and phone.', url: 'https://www.spokeo.com/', icon: Database },
  { name: 'Phone Number OSINT', desc: 'Deeper public-record lookup for any phone number.', url: 'https://www.numlookup.com/', icon: Smartphone },
  { name: 'Username Search (300+ sites)', desc: 'Enumerate accounts using the same username across networks.', url: 'https://github.com/sherlock-project/sherlock', icon: UserX, badge: 'OSINT' },
  { name: 'Domain WHOIS & DNS', desc: 'Lookup ownership, history, and DNS records of any domain.', url: 'https://securitytrails.com/', icon: Network },
];

// === LIVE QUERY TOOLS (IP + PIN code) — interactive ===
type IpData = {
  ip?: string; city?: string; region?: string; country_name?: string;
  latitude?: number; longitude?: number; timezone?: string; org?: string;
  asn?: string; postal?: string; error?: boolean; reason?: string;
};
type PinOffice = { Name: string; BranchType: string; District: string; State: string; Division: string; Region: string };

// === SANCHAR SAATHI — fixed redirects to actual fill-up forms ===
const sanchar: Item[] = [
  { name: 'Chakshu — Report Suspicious Communications', desc: 'Report SMS scams, phishing calls and financial fraud attempts.', url: 'https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp', icon: Eye, badge: 'Form' },
  { name: 'CEIR — Block Stolen / Lost Mobile', desc: 'Centralised IMEI blocking across all Indian networks.', url: 'https://www.ceir.gov.in/Request/CeirUserBlockRequestDirect.jsp', icon: Lock, badge: 'Form' },
  { name: 'TAFCOP — Verify Mobile Connections', desc: 'See every number issued on your Aadhaar/ID & block unknown ones.', url: 'https://tafcop.sancharsaathi.gov.in/telecomUser/', icon: Smartphone, badge: 'Form' },
  { name: 'Know Your Mobile — IMEI Verification', desc: 'Verify device authenticity before purchase using IMEI.', url: 'https://www.ceir.gov.in/Device/CeirIMEIVerification.jsp', icon: Fingerprint, badge: 'Form' },
  { name: 'International Call Fraud Reporting', desc: 'Report spoofed +91 / international scam calls (Form).', url: 'https://sancharsaathi.gov.in/sfc/Home/sfc-complaint.jsp', icon: Phone, badge: 'Form' },
  { name: 'Verified Contact Directory', desc: 'Trusted contact numbers of govt agencies, banks & telcos.', url: 'https://sancharsaathi.gov.in/KYM/', icon: FileCheck, badge: 'Form' },
];

// === COMPLAINT & REPORTING PORTALS (NEW: data leak, fraud, women safety, etc.) ===
const reporting: Item[] = [
  { name: 'National Cyber Crime Reporting Portal', desc: 'File any cyber crime complaint — fraud, hacking, harassment.', url: 'https://cybercrime.gov.in/Webform/Accept.aspx', icon: ShieldAlert, badge: '24×7' },
  { name: 'Helpline 1930 — Financial Fraud', desc: 'Call within 24h of any UPI / bank fraud. Block transactions fast.', url: 'tel:1930', icon: Phone, badge: 'Hotline' },
  { name: 'Cyber Fraud Complaint (Banking / UPI)', desc: 'Report UPI & netbanking fraud via RBI Sachet portal.', url: 'https://sachet.rbi.org.in/', icon: CreditCard, badge: 'RBI' },
  { name: 'Data Leak / Privacy Violation Complaint', desc: 'File under the DPDP Act for personal-data misuse.', url: 'https://cybercrime.gov.in/Webform/Accept.aspx', icon: FileWarning, badge: 'DPDP' },
  { name: 'Women Safety & Cyber Harassment', desc: 'NCW dedicated portal for online harassment against women.', url: 'http://ncwapps.nic.in/onlinecomplaintsv2/', icon: Heart, badge: 'NCW' },
  { name: 'Child Sexual Abuse / POCSO Reporting', desc: 'Report CSAM and online child exploitation content.', url: 'https://cybercrime.gov.in/Webform/Accept.aspx', icon: UserX, badge: 'POCSO' },
  { name: 'CERT-In Incident Reporting', desc: 'Report security incidents, breaches & vulnerabilities.', url: 'https://www.cert-in.org.in/s2cMainServlet?pageid=PUBRPTINCDNT', icon: AlertTriangle, badge: 'CERT-In' },
  { name: 'National Consumer Helpline', desc: 'Report e-commerce, refund and online shopping fraud.', url: 'https://consumerhelpline.gov.in/', icon: Building2 },
];

// === THREAT INTELLIGENCE ===
const threat: Item[] = [
  { name: 'VirusTotal', desc: 'Analyze files, URLs and IPs with 70+ antivirus engines.', url: 'https://www.virustotal.com/', icon: Bug },
  { name: 'Shodan', desc: 'Search engine for Internet-connected devices and exposed services.', url: 'https://www.shodan.io/', icon: Radar },
  { name: 'Censys', desc: 'Internet-wide scanning and attack-surface management.', url: 'https://search.censys.io/', icon: Search },
  { name: 'AbuseIPDB', desc: 'Check IP reputation and report malicious sources.', url: 'https://www.abuseipdb.com/', icon: ShieldAlert },
  { name: 'GreyNoise', desc: 'Distinguish real threats from internet background noise.', url: 'https://www.greynoise.io/', icon: Activity },
  { name: 'URLScan.io', desc: 'Scan and analyze any URL — screenshots, redirects, threats.', url: 'https://urlscan.io/', icon: Globe },
  { name: 'Hybrid Analysis', desc: 'Automated malware analysis sandbox & behaviour reports.', url: 'https://www.hybrid-analysis.com/', icon: Cpu },
  { name: 'AlienVault OTX', desc: 'Open Threat Exchange — global IOC sharing community.', url: 'https://otx.alienvault.com/', icon: Network },
  { name: 'Pulsedive', desc: 'Threat intelligence research — IOCs, risk and tracking.', url: 'https://pulsedive.com/', icon: Radar },
  { name: 'MXToolbox', desc: 'Email security tests — SPF, DKIM, DMARC, DNS diagnostics.', url: 'https://mxtoolbox.com/', icon: MailIcon },
  { name: 'SecurityTrails', desc: 'DNS history, WHOIS and subdomain discovery.', url: 'https://securitytrails.com/', icon: Database },
  { name: 'crt.sh', desc: 'Certificate transparency logs and subdomain enumeration.', url: 'https://crt.sh/', icon: Hash },
];

// === PRIVACY & OSINT ===
const osint: Item[] = [
  { name: 'EFF Cover Your Tracks', desc: 'Test browser fingerprinting and tracking-protection level.', url: 'https://coveryourtracks.eff.org/', icon: Eye },
  { name: 'BrowserLeaks', desc: 'Comprehensive browser leak tests — WebRTC, canvas, IP.', url: 'https://browserleaks.com/', icon: Globe },
  { name: 'Have I Been Pwned', desc: 'Check if your email or password was in any data breach.', url: 'https://haveibeenpwned.com/', icon: ShieldAlert },
  { name: 'Privacy Analyzer', desc: 'Audit data brokers and digital footprint exposure.', url: 'https://privacyanalyzer.net/', icon: Eye, badge: 'New' },
  { name: 'Sherlock', desc: 'Search a username across 300+ social networks.', url: 'https://github.com/sherlock-project/sherlock', icon: UserX },
  { name: 'Hunter.io', desc: 'Email finder & verification — domain email-pattern discovery.', url: 'https://hunter.io/', icon: MailIcon },
  { name: 'OSINT Framework', desc: 'Curated collection of every major OSINT tool.', url: 'https://osintframework.com/', icon: Network },
];

// Quick-access tiles (kept from original HTML)
const quickAccess = [
  { name: 'Sanchar Saathi', url: 'https://sancharsaathi.gov.in', icon: Phone },
  { name: 'Cyber Crime Portal', url: 'https://cybercrime.gov.in', icon: ShieldAlert },
  { name: 'UIDAI Services', url: 'https://uidai.gov.in', icon: Fingerprint },
  { name: 'Parivahan Portal', url: 'https://parivahan.gov.in', icon: Car },
];

const stats = [
  { value: '150+', label: 'Tools' },
  { value: '25+', label: 'Live Lookups' },
  { value: '100%', label: 'Free Access' },
  { value: 'Live', label: 'Monitoring' },
];

const sections = [
  { id: 'lookups', title: 'Real-Time Lookup Engine', tag: 'Live Intelligence', items: lookups, color: '--cyber-green' as const, icon: Search, desc: 'Instant verification, investigation and audit tools. Always check these first.' },
  { id: 'sanchar', title: 'Sanchar Saathi Services', tag: 'Citizen Services', items: sanchar, color: '--cyber-blue' as const, icon: Smartphone, desc: 'Official Department of Telecom forms — every link goes straight to the actual fill-up form.' },
  { id: 'reporting', title: 'Complaint & Reporting Portals', tag: 'Action', items: reporting, color: '--destructive' as const, icon: ShieldAlert, desc: 'Government and regulator portals for cyber fraud, data leaks, women safety and more.' },
  { id: 'threat', title: 'Threat Intelligence & Security Analysis', tag: 'Professional Tools', items: threat, color: '--cyber-orange' as const, icon: Radar, desc: 'Enterprise-grade tools used by analysts for malware, threat hunting and vulnerability research.' },
  { id: 'osint', title: 'Privacy Analysis & OSINT Tools', tag: 'Intelligence Gathering', items: osint, color: '--cyber-purple' as const, icon: Eye, desc: 'Privacy testing, browser fingerprinting and open-source intelligence.' },
];

const IntelligenceHub = () => {
  const [q, setQ] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [pinData, setPinData] = useState<PinOffice[] | null>(null);
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const filtered = useMemo(() =>
    sections.map(s => ({
      ...s,
      items: s.items.filter(i => !q || (i.name + ' ' + i.desc).toLowerCase().includes(q.toLowerCase())),
    })),
  [q]);

  const lookupIP = async () => {
    const ip = ipInput.trim();
    if (!ip) return;
    setIpLoading(true);
    setIpData(null);
    try {
      const r = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
      const d = await r.json();
      setIpData(d);
    } catch (e: any) {
      setIpData({ error: true, reason: e?.message || 'Network error' });
    } finally {
      setIpLoading(false);
    }
  };

  const lookupPin = async () => {
    const pin = pinInput.trim();
    setPinError('');
    setPinData(null);
    if (!/^\d{6}$/.test(pin)) { setPinError('Enter a valid 6-digit PIN code'); return; }
    setPinLoading(true);
    try {
      const r = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const d = await r.json();
      if (d?.[0]?.Status === 'Success' && d[0].PostOffice) setPinData(d[0].PostOffice as PinOffice[]);
      else setPinError(`No data found for PIN ${pin}`);
    } catch (e: any) {
      setPinError(e?.message || 'Network error');
    } finally {
      setPinLoading(false);
    }
  };

  useEffect(() => { document.title = 'Tech Guardians — Intelligence Hub'; }, []);

  return (
    <SiteFrame mainClassName="pt-24">
      {/* HERO */}
      <section className="section-padding pb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-cyber-green/10 blur-[140px]" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-green/40 bg-cyber-green/10 mb-6">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-cyber-green opacity-75 animate-ping" />
                <span className="relative w-2 h-2 rounded-full bg-cyber-green" />
              </span>
              <span className="text-[11px] font-display tracking-[0.2em] uppercase text-cyber-green">
                Advanced OSINT & Cyber Intelligence
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-5" style={{ lineHeight: 1.05, textWrap: 'balance' }}>
              <span className="neon-text text-primary">Intelligence</span> at Your<br />
              <span className="neon-text-green text-cyber-green">Fingertips</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed mb-8">
              Comprehensive toolkit for threat intelligence, OSINT investigations, privacy analysis and digital security. Access 150+ professional-grade utilities in one unified platform.
            </p>

            <div className="max-w-xl mx-auto relative mb-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by IP, domain, username, email or threat indicator..."
                className="w-full bg-muted/40 border border-border rounded-full pl-11 pr-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:border-cyber-green/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="glass-card py-4 text-center">
                  <div className="font-display text-2xl font-bold text-cyber-green tabular-nums">{s.value}</div>
                  <div className="text-[10px] font-display tracking-wider uppercase text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LIVE QUERY TOOLS (IP + PIN) — at top under hero */}
      <section className="section-padding pt-6 pb-10">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-green">⚡ Live Query Tools</span>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* IP */}
            <ScrollReveal direction="left">
              <GlassCard glowColor="green" className="h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-cyber-green" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">IP Intelligence</h3>
                    <p className="text-[11px] text-muted-foreground">Geolocation & ISP information</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && lookupIP()}
                    placeholder="Enter IP address (e.g. 8.8.8.8)"
                    className="flex-1 bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyber-green/50 focus:border-cyber-green/50 transition-all"
                  />
                  <button onClick={lookupIP} className="cyber-btn-green flex items-center gap-2 px-5" disabled={ipLoading}>
                    {ipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                  </button>
                </div>
                {ipData && (
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-4 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
                    {ipData.error || ipData.reason ? (
                      <div className="text-destructive">⚠ {ipData.reason || 'Invalid IP'}</div>
                    ) : (
                      <>
                        <div className="text-cyber-green font-bold border-b border-border/40 pb-2 mb-2">✓ Intelligence Report</div>
                        {[
                          ['IP', ipData.ip], ['Location', `${ipData.city || '—'}, ${ipData.region || '—'}, ${ipData.country_name || '—'}`],
                          ['Coords', `${ipData.latitude ?? '—'}, ${ipData.longitude ?? '—'}`], ['Timezone', ipData.timezone],
                          ['ISP', ipData.org], ['ASN', ipData.asn], ['Postal', ipData.postal],
                        ].map(([k, v]) => (
                          <div key={k as string} className="grid grid-cols-[90px_1fr] gap-2">
                            <span className="text-muted-foreground">{k}:</span>
                            <span className="text-foreground break-words">{(v as string) || '—'}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </GlassCard>
            </ScrollReveal>

            {/* PIN */}
            <ScrollReveal direction="right">
              <GlassCard glowColor="blue" className="h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold">PIN Code Finder</h3>
                    <p className="text-[11px] text-muted-foreground">Indian postal code details</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && lookupPin()}
                    placeholder="Enter 6-digit PIN (e.g. 110001)"
                    maxLength={6}
                    className="flex-1 bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                  <button onClick={lookupPin} className="cyber-btn-primary flex items-center gap-2 px-5" disabled={pinLoading}>
                    {pinLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </div>
                {(pinError || pinData) && (
                  <div className="rounded-lg border border-border/40 bg-muted/20 p-4 font-mono text-xs max-h-72 overflow-y-auto">
                    {pinError && <div className="text-destructive">⚠ {pinError}</div>}
                    {pinData && (
                      <>
                        <div className="text-primary font-bold border-b border-border/40 pb-2 mb-3">✓ Found {pinData.length} Post Office(s)</div>
                        <div className="space-y-3">
                          {pinData.map((o, i) => (
                            <div key={i} className="rounded-md border border-border/40 bg-cyber-green/5 p-3">
                              <div className="text-cyber-green font-semibold mb-2">📍 {o.Name}</div>
                              {[['Type', o.BranchType], ['District', o.District], ['State', o.State], ['Division', o.Division], ['Region', o.Region]].map(([k, v]) => (
                                <div key={k} className="grid grid-cols-[80px_1fr] gap-2">
                                  <span className="text-muted-foreground">{k}:</span>
                                  <span className="text-foreground">{v}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="section-padding py-10">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span className="text-[10px] font-display tracking-[0.3em] uppercase text-cyber-green mb-3 block">Quick Access</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Government Services & Resources</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAccess.map((q) => (
                <a key={q.name} href={q.url} target="_blank" rel="noopener noreferrer"
                  className="glass-card p-5 flex flex-col items-center gap-3 hover:border-cyber-green/40 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <q.icon className="w-5 h-5 text-cyber-green" />
                  </div>
                  <span className="text-xs font-display font-semibold text-center group-hover:text-cyber-green transition-colors">{q.name}</span>
                </a>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* DYNAMIC SECTIONS */}
      {filtered.map((section) => (
        <section key={section.id} id={section.id} className="section-padding pt-10">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                    style={{
                      background: `hsl(var(${section.color}) / 0.12)`,
                      borderColor: `hsl(var(${section.color}) / 0.4)`,
                    }}
                  >
                    <section.icon className="w-6 h-6" style={{ color: `hsl(var(${section.color}))` }} />
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-display tracking-[0.3em] uppercase block"
                      style={{ color: `hsl(var(${section.color}))` }}
                    >
                      {section.tag} · {section.items.length} tools
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{section.title}</h2>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-3xl">{section.desc}</p>
            </ScrollReveal>

            {section.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No tools match "{q}".</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.items.map((item, i) => (
                  <motion.a
                    key={item.name}
                    href={item.url}
                    target={item.url.startsWith('tel:') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ delay: (i % 6) * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -3 }}
                    className="group glass-card p-5 h-full flex flex-col transition-all duration-300"
                    style={{ borderColor: `hsl(var(${section.color}) / 0.2)` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border shrink-0"
                        style={{
                          background: `hsl(var(${section.color}) / 0.1)`,
                          borderColor: `hsl(var(${section.color}) / 0.3)`,
                        }}
                      >
                        <item.icon className="w-5 h-5" style={{ color: `hsl(var(${section.color}))` }} />
                      </div>
                      {item.badge && (
                        <span
                          className="text-[9px] font-display tracking-wider uppercase px-2 py-0.5 rounded-md border"
                          style={{
                            color: `hsl(var(${section.color}))`,
                            borderColor: `hsl(var(${section.color}) / 0.4)`,
                            background: `hsl(var(${section.color}) / 0.08)`,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3
                      className="font-display text-sm font-semibold text-foreground mb-2 leading-snug transition-colors"
                      style={{}}
                    >
                      <span className="group-hover:opacity-90" style={{ color: 'inherit' }}>{item.name}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[10px] font-display tracking-wider uppercase text-muted-foreground">
                      <span className="truncate max-w-[160px]">
                        {item.url.startsWith('tel:') ? item.url.replace('tel:', '☎ ') : new URL(item.url).hostname.replace('www.', '')}
                      </span>
                      <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" style={{ color: `hsl(var(${section.color}))` }} />
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* HELP STRIP */}
      <section className="section-padding pt-10 pb-20">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <GlassCard glowColor="purple" className="p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-cyber-purple mx-auto mb-3" />
              <h3 className="font-display text-xl md:text-2xl font-bold mb-2">Need help filing a complaint?</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-5">
                Our team can walk you through every form — cybercrime.gov.in, TAFCOP, RBI Sachet, NCW and more. Free guidance, immediate response.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="/cyber-crime-support" className="cyber-btn-primary">Get Free Support</a>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="cyber-btn-green">WhatsApp Us</a>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>
    </SiteFrame>
  );
};

export default IntelligenceHub;
