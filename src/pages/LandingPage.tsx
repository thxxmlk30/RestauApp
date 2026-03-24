import { NavBar } from '../components/layout/NavBar';
import Hero from '../components/landing/Hero';
import MenuSection from '../components/landing/MenuSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import AboutSection from '../components/landing/AboutSection';
import Footer from '../components/layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <MenuSection />
      <TestimonialsSection />
      <AboutSection />
      <Footer />
    </div>
  );
}