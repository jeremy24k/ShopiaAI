import LandingHero from '../components/landing/LandingHero';
import MultiplePerspectives from '../components/landing/MultiplePerspectives';
import LandingFeatures from '../components/landing/LandingFeatures';
import BetaNotice from '../components/landing/BetaNotice';
import HowItWorks from '../components/landing/HowItWorks';
import LandingPricing from '../components/landing/LandingPricing';
import LandingTestimonials from '../components/landing/LandingTestimonials';
import LandingFAQ from '../components/landing/LandingFAQ';
import AboutProject from '../components/landing/AboutProject';
import ContactForm from '../components/landing/ContactForm';
import LandingFooter from '../components/landing/LandingFooter';
import styles from '../styles/Landing.module.css';

function Landing() {
  return (
    <div className={styles.landing}>
      <LandingHero />
      <MultiplePerspectives />
      <LandingFeatures />
      <BetaNotice />
      <HowItWorks />
      <LandingPricing />
      {/* <LandingTestimonials /> */}
      <LandingFAQ />
      <AboutProject />
      <ContactForm />
      <LandingFooter />
    </div>
  );
}

export default Landing;
