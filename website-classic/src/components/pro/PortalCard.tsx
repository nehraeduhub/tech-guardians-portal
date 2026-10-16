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
    <SmartLink item={{ href, external }} className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_16px_36px_-24px_hsl(var(--primary)/0.45)] transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.05),0_24px_48px_-24px_hsl(var(--primary)/0.55)]">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-6 w-6" /></span>
      <h3 className="mt-4 text-base font-bold text-foreground">{portal.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{portal.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open portal <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
    </SmartLink>
  );
};

export default PortalCard;
