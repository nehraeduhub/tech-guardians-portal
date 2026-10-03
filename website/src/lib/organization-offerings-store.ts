import { readSetting, publishSetting } from '@/lib/shared-settings';
export interface OrganizationOffering {
  id: string;
  title: string;
  description: string;
  page: string;
  /** Short name used in the TG Portals menu and footer. */
  menuLabel?: string;
  buttonText: string;
  homeVisible: boolean;
  menuVisible: boolean;
  type: 'assessment' | 'range' | 'custom';
}

export const ORGANIZATION_OFFERINGS_KEY = 'tg_organization_offerings';

export const DEFAULT_ORGANIZATION_OFFERINGS: OrganizationOffering[] = [
  {
    id: 'security-assessment',
    title: 'Secure Your Organization Before Attackers Find the Weaknesses',
    description: 'Expert network, firewall, vulnerability and security architecture assessments with a clear remediation roadmap.',
    page: '/security-assessment',
    menuLabel: 'Security Assessment',
    buttonText: 'Explore Security Assessment',
    homeVisible: true,
    menuVisible: true,
    type: 'assessment',
  },
  {
    id: 'cyber-range',
    title: 'Launch Your Own Cyber Range',
    description: 'Build an in-house training and simulation lab with 200+ realistic cyberattack scenarios for teams, students and defenders.',
    page: '/cyber-range',
    menuLabel: 'Cyber Range',
    buttonText: 'Explore Cyber Range',
    homeVisible: true,
    menuVisible: true,
    type: 'range',
  },
];

export const loadOrganizationOfferings = (): OrganizationOffering[] => readSetting(ORGANIZATION_OFFERINGS_KEY, DEFAULT_ORGANIZATION_OFFERINGS);
export const saveOrganizationOfferings = (rows: OrganizationOffering[]) => publishSetting(ORGANIZATION_OFFERINGS_KEY, rows);

export const emptyOrganizationOffering = (): OrganizationOffering => ({
  id: `offering-${Date.now()}`,
  title: '',
  description: '',
  page: '/',
  buttonText: 'Learn More',
  homeVisible: true,
  menuVisible: true,
  type: 'custom',
});

/** Name for menus: the admin's menu label, else a short default, else the title. */
export const offeringMenuLabel = (o: OrganizationOffering) =>
  o.menuLabel?.trim() || DEFAULT_ORGANIZATION_OFFERINGS.find((d) => d.id === o.id)?.menuLabel || o.title;

export const getOrganizationOffering = (id: string) =>
  loadOrganizationOfferings().find((offering) => offering.id === id);