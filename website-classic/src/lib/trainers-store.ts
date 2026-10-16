import { readSetting, publishSetting } from '@/lib/shared-settings';
import {
  Briefcase,
  Building2,
  Cpu,
  Factory,
  GraduationCap,
  Landmark,
  Network,
  School,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface TrainerOrg {
  id: string;
  name: string;
  place: string;
  icon: TrainerIconName;
  from: string;
  to: string;
  enabled: boolean;
}

export const TRAINER_ICONS = {
  Building2,
  Briefcase,
  Cpu,
  Factory,
  GraduationCap,
  Landmark,
  Network,
  School,
  Server,
  ShieldCheck,
} as const;

export type TrainerIconName = keyof typeof TRAINER_ICONS;

export const TRAINER_ICON_NAMES = Object.keys(TRAINER_ICONS) as TrainerIconName[];

export const getTrainerIcon = (name: string): LucideIcon =>
  TRAINER_ICONS[(name as TrainerIconName) in TRAINER_ICONS ? (name as TrainerIconName) : 'Building2'];

export const TRAINER_GRADIENTS: { label: string; from: string; to: string }[] = [
  { label: 'Green → Cyan', from: 'var(--cyber-green)', to: 'var(--primary)' },
  { label: 'Cyan → Violet', from: 'var(--primary)', to: 'var(--cyber-purple)' },
  { label: 'Violet → Amber', from: 'var(--cyber-purple)', to: 'var(--cyber-orange)' },
  { label: 'Amber → Green', from: 'var(--cyber-orange)', to: 'var(--cyber-green)' },
];

export const TRAINERS_KEY = 'tg_trainers_at';

export const DEFAULT_TRAINERS: TrainerOrg[] = [
  { id: 't1', name: 'Nexrise Infotech', place: 'Okhla, New Delhi', icon: 'Building2', from: 'var(--cyber-green)', to: 'var(--primary)', enabled: true },
  { id: 't2', name: 'Bluecrest Softwares', place: 'Janakpuri, New Delhi', icon: 'Cpu', from: 'var(--primary)', to: 'var(--cyber-purple)', enabled: true },
  { id: 't3', name: 'Vertex Netsol', place: 'Rohini, New Delhi', icon: 'Network', from: 'var(--cyber-purple)', to: 'var(--cyber-orange)', enabled: true },
  { id: 't4', name: 'Skyline Data Services', place: 'Laxmi Nagar, New Delhi', icon: 'Server', from: 'var(--cyber-orange)', to: 'var(--cyber-green)', enabled: true },
];

export const loadTrainers = (): TrainerOrg[] => readSetting(TRAINERS_KEY, DEFAULT_TRAINERS);
export const saveTrainers = (rows: TrainerOrg[]) => publishSetting(TRAINERS_KEY, rows);

export const emptyTrainer = (): TrainerOrg => ({
  id: `t${Date.now()}`,
  name: '',
  place: '',
  icon: 'Building2',
  from: 'var(--cyber-green)',
  to: 'var(--primary)',
  enabled: true,
});
