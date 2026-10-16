import { ArrowUpRight } from 'lucide-react';
import { portalHref, portalIsExternal, type Portal } from '@/lib/catalog';
import { iconFor } from './icons';
import SmartLink from './SmartLink';

/** A portal tile. Opens the portal's own subdomain when the admin set one. */
const PortalCard = ({ portal }: { portal: Portal }) => {
  const Icon = iconFor(portal.icon_name);
  const href = portalHref(portal);
  const external = portalIsExternal(portal) && portal.newTab;
  return (
    <SmartLink item={{ href, external }} className="group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all hover:-translate-y-1 hover:border-[#3b8bff]/60 hover:bg-white/[0.07]">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#2563eb]/20 text-[#60a5fa] transition-colors group-hover:bg-[#2563eb] group-hover:text-white"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 text-base font-bold text-white">{portal.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{portal.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#60a5fa]">Open portal <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
    </SmartLink>
  );
};

export default PortalCard;
