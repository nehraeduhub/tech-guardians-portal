import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
const CyberCrimeBanner = lazy(() => import('@/components/CyberCrimeBanner'));
const SocialHackingVideoSection = lazy(() => import('@/components/SocialHackingVideoSection'));
const OrganizationOfferingsSection = lazy(() => import('@/components/OrganizationOfferingsSection'));
const AwarenessSection = lazy(() => import('@/components/AwarenessSection'));
const EnrollFormSection = lazy(() => import('@/components/EnrollFormSection'));
const NewsEventsSection = lazy(() => import('@/components/NewsEventsSection'));
const AboutSection = lazy(() => import('@/components/AboutSection'));
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const ProtectionPlatformSection = lazy(() => import('@/components/ProtectionPlatformSection'));
const SecurityModulesSection = lazy(() => import('@/components/SecurityModulesSection'));
const StepByStepSection = lazy(() => import('@/components/StepByStepSection'));
const IndianCyberSection = lazy(() => import('@/components/IndianCyberSection'));
const CyberTerminalSection = lazy(() => import('@/components/CyberTerminalSection'));
const ThreatIntelCard = lazy(() => import('@/components/ThreatIntelCard'));
const CyberNewsPortalCard = lazy(() => import('@/components/CyberNewsPortalCard'));
const ForensicEngineCard = lazy(() => import('@/components/ForensicEngineCard'));
const SecurityAssessmentBanner = lazy(() => import('@/components/SecurityAssessmentBanner'));
const DownloadToolsSection = lazy(() => import('@/components/DownloadToolsSection'));
const PdfLibrarySection = lazy(() => import('@/components/PdfLibrarySection'));
const MediaGallerySection = lazy(() => import('@/components/MediaGallerySection'));
const YouTubeSection = lazy(() => import('@/components/YouTubeSection'));
const FoundersSection = lazy(() => import('@/components/FoundersSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const TrustSection = lazy(() => import('@/components/TrustSection'));
const EnrollSection = lazy(() => import('@/components/EnrollSection'));
const ContactSection = lazy(() => import('@/components/ContactSection'));
import CustomSection from '@/components/CustomSection';
const PdfStoreSection = lazy(() => import('@/components/PdfStoreSection'));
import { CtaSection, EcosystemSection, EventsSection, HighlightsSection, PortalsSection, ProductsSection, ProgramsSection } from '@/components/home/HomeSections';
import SiteFrame from '@/components/SiteFrame';
import { orderedSectionIds, useLayout } from '@/lib/layout';
import { CUSTOM_SECTIONS, useList } from '@/lib/content-lists';

const SECTIONS: Record<string, ComponentType> = {
  hero: HeroSection,
  highlights: HighlightsSection,
  ecosystem: EcosystemSection,
  courses: ProgramsSection,
  products: ProductsSection,
  events: EventsSection,
  portals: PortalsSection,
  contact: CtaSection,
  'cyber-crime-banner': CyberCrimeBanner,
  'featured-training': SocialHackingVideoSection,
  'pdf-store': PdfStoreSection,
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
  'contact-form': ContactSection,
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
        return Section ? <div key={id} data-tg-section={id} style={{ display: 'contents' }}><Suspense fallback={null}><Section /></Suspense></div> : null;
      })}
    </SiteFrame>
  );
};

export default Index;
