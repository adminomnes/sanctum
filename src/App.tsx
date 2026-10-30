import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeBanner } from './components/MarqueeBanner';
import { Services } from './components/Services';
import { Gallery } from './components/Gallery';
import { Coverage } from './components/Coverage';
import { Conversion } from './components/Conversion';
import { QuoteForm } from './components/QuoteForm';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Footer } from './components/Footer';
import { AdminRoot } from './admin/AdminRoot';
import { apiFetch } from './api';

export const App: React.FC = () => {
  // Simple client route checking for /admin or #admin
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname.toLowerCase().startsWith('/admin') || window.location.hash === '#admin'
      ? '/admin'
      : '/';
  });

  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState<string>('');
  const [selectedCityForQuote, setSelectedCityForQuote] = useState<string>('');
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  // Sync content dynamically from backend
  const fetchContent = () => {
    apiFetch('/api/public/content')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.content) {
          setSiteContent(data.content);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchContent();

    const handlePopState = () => {
      const isAdm = window.location.pathname.toLowerCase().startsWith('/admin') || window.location.hash === '#admin';
      setCurrentPath(isAdm ? '/admin' : '/');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setCurrentPath('/admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSite = () => {
    window.history.pushState(null, '', '/');
    setCurrentPath('/');
    fetchContent(); // re-fetch content to ensure latest changes are seen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToQuote = (service?: string) => {
    if (service) {
      setSelectedServiceForQuote(service);
    }
    const element = document.getElementById('cotizacion');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCity = (cityName: string) => {
    setSelectedCityForQuote(cityName);
    const element = document.getElementById('cotizacion');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If in /admin private portal:
  if (currentPath === '/admin') {
    return <AdminRoot onBackToSite={navigateToSite} />;
  }

  // Public Website
  return (
    <div className="sanctum-app-root">
      {/* Editorial Grain Overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Modern Navigation Header with provisional typography */}
      <Header onOpenQuote={() => scrollToQuote()} />

      {/* Main Experience Flow */}
      <main>
        {/* Screen 1: High Impact Visual Hero */}
        <Hero onOpenQuote={() => scrollToQuote()} siteContent={siteContent} />

        {/* Dynamic Movement Marquee Banner */}
        <MarqueeBanner siteContent={siteContent} />

        {/* Section 4: Services with big pictures & zero boredom */}
        <Services onSelectService={(svc) => scrollToQuote(svc)} siteContent={siteContent} />

        {/* Inverted Accent Marquee Banner */}
        <MarqueeBanner inverted={true} siteContent={siteContent} />

        {/* Section 6: Curated Visual Campaign Gallery with lightbox & filters */}
        <div id="eventos">
          <Gallery />
        </div>

        {/* Section 7: Geographic North Chile Coverage */}
        <Coverage onSelectCity={handleSelectCity} />

        {/* Section 8: Closing High-Impact Commercial Conversion Block */}
        <Conversion onOpenQuote={() => scrollToQuote()} siteContent={siteContent} />

        {/* Section 9: Real Operational Quote Form */}
        <QuoteForm 
          initialService={selectedServiceForQuote} 
          initialCity={selectedCityForQuote} 
        />
      </main>

      {/* Floating WhatsApp Action Button */}
      <WhatsAppFloat onOpenQuote={() => scrollToQuote()} siteContent={siteContent} />

      {/* Section 11: Editorial Carbon Footer */}
      <Footer onOpenQuote={() => scrollToQuote()} onNavigateToAdmin={navigateToAdmin} siteContent={siteContent} />
    </div>
  );
};

export default App;
