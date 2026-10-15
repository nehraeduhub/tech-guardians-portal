import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import SiteFrame from '@/components/SiteFrame';
import HeroBand from '@/components/pro/HeroBand';

const NotFound = () => (
  <SiteFrame>
    <HeroBand variant="radar" align="center" className="py-28 md:py-36">
      <div className="tg-container text-center">
        <p className="tg-eyebrow justify-center text-[#60a5fa]">Error 404</p>
        <h1 className="mt-4 text-4xl font-extrabold text-white md:text-6xl">This page could not be found</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">The link may be old, or the page has moved. Try one of these instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="tg-btn-primary">Go to the homepage <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/training" className="tg-btn-outline"><Search className="h-4 w-4" /> Training Programs</Link>
        </div>
      </div>
    </HeroBand>
  </SiteFrame>
);

export default NotFound;
