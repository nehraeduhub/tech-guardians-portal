import { readSetting, publishSetting } from '@/lib/shared-settings';
export interface OrganizationOffering {
  id: string;
  title: string;
  description: string;
  page: string;
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
    buttonText: 'Explore Security Assessment',
    homeVisible: true,
    menuVisible: false,
    type: 'assessment',
  },
  {
    id: 'cyber-range',
    title: 'Launch Your Own Cyber Range',
    description: 'Build an in-house training and simulation lab with 200+ realistic cyberattack scenarios for teams, students and defenders.',
    page: '/cyber-range',
    buttonText: 'Explore Cyber Range',
    homeVisible: true,
    menuVisible: false,
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

export const getOrganizationOffering = (id: string) =>
  loadOrganizationOfferings().find((offering) => offering.id === id);