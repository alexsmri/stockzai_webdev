import { useEffect, useRef } from 'react';
import '../assets/scss/landing/landing.scss';
import COM_Footer from '../components/COM_Footer';
import COM_LandNavbar from '../components/landing/COM_LandNavbar';
import COM_LandHero from '../components/landing/COM_LandHero';
import COM_LandUnderstand from '../components/landing/COM_LandUnderstand';
import COM_LandFundamentals from '../components/landing/COM_LandFundamentals';
import COM_LandBacktest from '../components/landing/COM_LandBacktest';
import COM_LandPricing from '../components/landing/COM_LandPricing';
import COM_LandFaq from '../components/landing/COM_LandFaq';
import { useRevealOnScroll } from '../hooks/hooks';

function PAG_Landing() {
  const refPage = useRef<HTMLDivElement>(null);
  useRevealOnScroll(refPage);

  useEffect(() => {
    document.title = 'stockz.ai – Understand any stock in three scores';
    // arriving from a doc page via /#pricing etc.: the section only exists once this page has rendered
    const { hash } = window.location;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, []);

  return (
    <div ref={refPage} className="lp">
      <COM_LandNavbar />
      <main>
        <COM_LandHero />
        <COM_LandUnderstand />
        <COM_LandFundamentals />
        <COM_LandBacktest />
        <COM_LandPricing />
        <COM_LandFaq />
      </main>
      <COM_Footer />
    </div>
  );
}

export default PAG_Landing;
