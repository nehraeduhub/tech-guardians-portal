import {
  BookOpen, Bot, Brain, Bug, ClipboardCheck, Cloud, Code, Code2, Cpu, Crosshair, Database, Eye, Fingerprint, Globe, Globe2,
  GraduationCap, HardDrive, Key, Lock, MonitorCog, Network, Newspaper, Package, Radar, ScanSearch, Search, Server, Shield,
  ShieldCheck, Siren, Skull, Smartphone, Wrench, Users, Laptop, Settings, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  BookOpen, Bot, Brain, Bug, ClipboardCheck, Cloud, Code, Code2, Cpu, Crosshair, Database, Eye, Fingerprint, Globe, Globe2,
  GraduationCap, HardDrive, Key, Lock, MonitorCog, Network, Newspaper, Package, Radar, ScanSearch, Search, Server, Shield,
  ShieldCheck, Siren, Skull, Smartphone, Wrench, Users, Laptop, Settings,
};

export const iconFor = (name?: string): LucideIcon => (name && ICONS[name]) || ShieldCheck;
export const ICON_NAMES = Object.keys(ICONS);
