import SiteFrame from '@/components/SiteFrame';
import TGBlogsSection from '@/components/TGBlogsSection';
import PageHero from '@/components/pro/PageHero';

const TGBlogs = () => (
  <SiteFrame>
    <PageHero variant="network" eyebrow="TG Blogs" title="Guides and articles" accent="from Tech Guardians" lead="Cyber security explained simply — tutorials, awareness and real case studies." compact />
    <TGBlogsSection />
  </SiteFrame>
);

export default TGBlogs;
