import { useEffect } from 'react';
import Header from '@/components/Header/Header';
import HeroSection from '@/components/HeroSection/HeroSection';
import InfoSection from '@/components/InfoSection/InfoSection';
import BenefitsSection from '@/components/BenefitsSection/BenefitsSection';
import ModeSection from '@/components/ModeSection/ModeSection';
import SpeedSection from '@/components/SpeedSection/SpeedSection';
import CreativitySection from '@/components/CreativitySection/CreativitySection';
import CTASection from '@/components/CTASection/CTASection';
import Footer from '@/components/Footer/Footer';

const LandingPage = () => {
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-dark');
    document.documentElement.setAttribute('data-dark', 'false');
    return () => {
      if (prev !== null) document.documentElement.setAttribute('data-dark', prev);
    };
  }, []);

  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <InfoSection />
        <BenefitsSection />
        <ModeSection />
        <SpeedSection />
        <CreativitySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;