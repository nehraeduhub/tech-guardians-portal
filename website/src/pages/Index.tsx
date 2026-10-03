import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import CyberCrimeBanner from '@/components/CyberCrimeBanner';

import SocialHackingVideoSection from '@/components/SocialHackingVideoSection';
import OrganizationOfferingsSection from '@/components/OrganizationOfferingsSection';
import AwarenessSection from '@/components/AwarenessSection';
import EnrollFormSection from '@/components/EnrollFormSection';
import CoursesSection from '@/components/CoursesSection';
import NewsEventsSection from '@/components/NewsEventsSection';
import SiteFrame from '@/components/SiteFrame';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <SiteFrame>
      <HeroSection />
      <CyberCrimeBanner />

      <SocialHackingVideoSection />
      <CoursesSection />
      <NewsEventsSection />
      <OrganizationOfferingsSection />
      <AwarenessSection />
      <EnrollFormSection />
    </SiteFrame>
  );
};

export default Index;
