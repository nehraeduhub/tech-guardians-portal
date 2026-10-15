import { Instagram, Mail, MessageCircle, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import tgLogo from '@/assets/tg-logo.png';
import { useHomeContent } from '@/lib/home-content';
import { useSiteMenus } from '@/lib/site-nav';
import { getWhatsAppNumber, waLink } from '@/lib/site-settings';
import SmartLink from '@/components/pro/SmartLink';

const Footer = () => {
  const home = useHomeContent();
  const menus = useSiteMenus();
  const wa = getWhatsAppNumber();
  const phone = `+${wa.slice(0, wa.length - 10)} ${wa.slice(-10, -5)} ${wa.slice(-5)}`;
  const columns = ['training', 'security', 'portals', 'resources']
    .map((id) => menus.find((m) => m.id === id))
    .filter((m): m is NonNullable<typeof m> => !!m);

  return (
    <footer className="tg-dark border-t border-white/5 bg-[#050f26]">
      <div className="tg-container grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img src={tgLogo} alt="" className="h-11 w-11 object-contain" />
            <span className="font-display text-xl font-extrabold text-white">Tech <span className="text-[#3b8bff]">Guardians</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{home.footerAbout}</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-300">
            <li><a href={waLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 text-[#60a5fa]" />{phone}</a></li>
            <li><a href="mailto:ittechguardians@gmail.com" className="inline-flex items-center gap-2 hover:text-white"><Mail className="h-4 w-4 text-[#60a5fa]" />ittechguardians@gmail.com</a></li>
          </ul>
          <div className="mt-5 flex gap-2">
            {[
              { href: 'https://www.instagram.com/techguardianss/', label: 'Instagram', Icon: Instagram },
              { href: 'https://www.youtube.com/@TECHGUARDIANS_IT', label: 'YouTube', Icon: Youtube },
              { href: waLink(), label: 'WhatsApp', Icon: MessageCircle },
            ].map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 hover:border-[#3b8bff] hover:bg-[#2563eb] hover:text-white">
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((m) => (
          <div key={m.id}>
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-white">{m.label}</h2>
            <ul className="mt-4 space-y-2.5">
              {m.items.slice(0, 6).map((i) => (
                <li key={i.href + i.label}><SmartLink item={i} className="text-sm text-slate-400 hover:text-white">{i.label}</SmartLink></li>
              ))}
              {m.footer && <li><SmartLink item={m.footer} className="text-sm font-semibold text-[#60a5fa] hover:text-white">{m.footer.label} →</SmartLink></li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="tg-container flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Tech Guardians. All rights reserved.</span>
          <span>Keep Learning · Keep Sharing</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
