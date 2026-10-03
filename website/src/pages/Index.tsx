import { useEffect, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import CyberCrimeBanner from '@/components/CyberCrimeBanner';
import SocialHackingVideoSection from '@/components/SocialHackingVideoSection';
import OrganizationOfferingsSection from '@/components/OrganizationOfferingsSection';
import AwarenessSection from '@/components/AwarenessSection';
import EnrollFormSection from '@/components/EnrollFormSection';
import CoursesSection from '@/components/CoursesSection';
import NewsEventsSection from '@/components/NewsEventsSection';
import AboutSection from '@/components/AboutSection';
import FeaturesSection from '@/components/FeaturesSection';
import ServicesSection from '@/components/ServicesSection';
import ProtectionPlatformSection from '@/components/ProtectionPlatformSection';
import SecurityModulesSection from '@/components/SecurityModulesSection';
import StepByStepSection from '@/components/StepByStepSection';
import IndianCyberSection from '@/components/IndianCyberSection';
import CyberTerminalSection from '@/components/CyberTerminalSection';
import ThreatIntelCard from '@/components/ThreatIntelCard';
import CyberNewsPortalCard from '@/components/CyberNewsPortalCard';
import ForensicEngineCard from '@/components/ForensicEngineCard';
import SecurityAssessmentBanner from '@/components/SecurityAssessmentBanner';
import DownloadToolsSection from '@/components/DownloadToolsSection';
import PdfLibrarySection from '@/components/PdfLibrarySection';
import MediaGallerySection from '@/components/MediaGallerySection';
import YouTubeSection from '@/components/YouTubeSection';
import FoundersSection from '@/components/FoundersSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import TrustSection from '@/components/TrustSection';
import EnrollSection from '@/components/EnrollSection';
import ContactSection from '@/components/ContactSection';
import CustomSection from '@/components/CustomSection';
import SiteFrame from '@/components/SiteFrame';
import { orderedSectionIds, useLayout } from '@/lib/layout';
import { CUSTOM_SECTIONS, useList } from '@/lib/content-lists';

const SECTIONS: Record<string, ComponentType> = {
  hero: HeroSection,
  'cyber-crime-banner': CyberCrimeBanner,
  'featured-training': SocialHackingVideoSection,
  courses: CoursesSection,
  'news-events': NewsEventsSection,
  'organization-offerings': OrganizationOfferingsSection,
  awareness: AwarenessSection,
  about: AboutSection,
  features: FeaturesSection,
  services: ServicesSection,
  'protection-platform': ProtectionPlatformSection,
  'security-modules': SecurityModulesSection,
  'step-by-step': StepByStepSection,
  'indian-cyber': IndianCyberSection,
  'cyber-terminal': CyberTerminalSection,
  'threat-intel-card': ThreatIntelCard,
  'cyber-news-card': CyberNewsPortalCard,
  'forensic-engine-card': ForensicEngineCard,
  'security-assessment-banner': SecurityAssessmentBanner,
  'download-tools': DownloadToolsSection,
  'pdf-library': PdfLibrarySection,
  'media-gallery': MediaGallerySection,
  youtube: YouTubeSection,
  founders: FoundersSection,
  testimonials: TestimonialsSection,
  trust: TrustSection,
  enroll: EnrollSection,
  'enroll-form': EnrollFormSection,
  contact: ContactSection,
};

const Index = () => {
  const location = useLocation();
  const layout = useLayout();
  const customRows = useList(CUSTOM_SECTIONS) || [];

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  const hidden = new Set(layout.hidden);
  const customById = new Map(customRows.map((row) => [`custom:${row.id}`, row]));

  return (
    <SiteFrame>
      {orderedSectionIds(layout, customRows.map((r) => r.id)).map((id) => {
        if (hidden.has(id)) return null;
        const custom = customById.get(id);
        if (custom) return custom.visible ? <CustomSection key={id} row={custom} /> : null;
        const Section = SECTIONS[id];
        return Section ? <div key={id} data-tg-section={id} style={{ display: 'contents' }}><Section /></div> : null;
      })}
    </SiteFrame>
  );
};

export default Index;
