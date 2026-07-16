import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Scissors, Sparkles, Phone, Mail, MapPin, Clock, ExternalLink,
  ChevronRight, ChevronLeft, ChevronDown, Star, Zap,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { settingsApi } from '../../api/settings.api';
import { formatMoney } from '../../utils/formatMoney';
import './Landing.css';

const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'haircut', label: 'Haircuts' },
  { key: 'salon', label: 'Salon' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const { data: publicData, isLoading } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const { data } = await settingsApi.getPublic();
      return data.data;
    },
  });

  const shopInfo = publicData?.shopInfo || {};
  const services = publicData?.services || [];
  const storeHours = publicData?.storeHours;

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  /* ── Slideshow logic ── */
  useEffect(() => {
    setCurrentSlide(0);
  }, [activeCategory]);

  useEffect(() => {
    if (filteredServices.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % filteredServices.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [filteredServices.length, isPaused]);

  const goToSlide = useCallback((i) => setCurrentSlide(i), []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? filteredServices.length - 1 : prev - 1));
  }, [filteredServices.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % filteredServices.length);
  }, [filteredServices.length]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  };

  const weekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const dayLabels = {
    mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
    fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
  };

  return (
    <div className="landing">
      <PublicNavbar />

      {/* ─── Hero ─── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-shape landing-hero-shape--1" />
          <div className="landing-hero-shape landing-hero-shape--2" />
          <div className="landing-hero-shape landing-hero-shape--3" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Scissors size={14} />
            <span>Barber Shop &amp; Salon</span>
          </div>
          <h1 className="landing-hero-title">
            Sharp Looks,<br />Effortless Booking
          </h1>
          <p className="landing-hero-sub">
            {shopInfo.tagline || 'Book your next haircut or salon service in seconds. Pick a service, choose a time, and walk in looking your best.'}
          </p>
          <div className="landing-hero-actions">
            <Button size="lg" onClick={() => navigate('/register')}>
              Book Now <ChevronRight size={18} />
            </Button>
            <Button variant="ghost" size="lg" className="landing-btn-outline" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
          <div className="landing-hero-stats">
            <div className="landing-hero-stat">
              <Star size={18} />
              <span className="landing-hero-stat-num">{services.length}+</span>
              <span className="landing-hero-stat-label">Services</span>
            </div>
            <div className="landing-hero-stat">
              <Zap size={18} />
              <span className="landing-hero-stat-num">100%</span>
              <span className="landing-hero-stat-label">Online Booking</span>
            </div>
            <div className="landing-hero-stat">
              <Clock size={18} />
              <span className="landing-hero-stat-num">Fast</span>
              <span className="landing-hero-stat-label">&amp; Easy</span>
            </div>
          </div>
        </div>

        <a href="#services" className="landing-scroll-indicator" aria-label="Scroll to services">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* ─── Services Slideshow ─── */}
      <section id="services" className="landing-services-section">
        <div className="landing-services-header">
          <div className="landing-section-header">
            <h2 className="landing-section-title">Our Services</h2>
            <p className="landing-section-sub">Choose from our range of professional haircuts and salon services</p>
          </div>
          <div className="landing-tabs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`landing-tab ${activeCategory === tab.key ? 'landing-tab--active' : ''}`}
                onClick={() => setActiveCategory(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="landing-loading"><Spinner size={32} /></div>
        ) : filteredServices.length > 0 ? (
          <div
            className="landing-slideshow"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="landing-slideshow-viewport">
              <div
                className="landing-slideshow-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {filteredServices.map((svc) => (
                  <div key={svc._id} className="landing-slide">
                    <div className="landing-slide-image">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.name} loading="lazy" />
                      ) : (
                        <div className="landing-slide-image-placeholder">
                          <Scissors size={48} strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="landing-slide-content">
                      <span className="landing-slide-category">
                        {svc.category === 'haircut' ? 'Haircut' : 'Salon Service'}
                      </span>
                      <h3 className="landing-slide-name">{svc.name}</h3>
                      {svc.description && (
                        <p className="landing-slide-desc">{svc.description}</p>
                      )}
                      <div className="landing-slide-meta">
                        <span className="landing-slide-price">{formatMoney(svc.price)}</span>
                        {svc.durationMinutes && (
                          <span className="landing-slide-duration">
                            <Clock size={14} />
                            {svc.durationMinutes} min
                          </span>
                        )}
                      </div>
                      <Button size="lg" onClick={() => navigate('/register')}>
                        Book Now <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredServices.length > 1 && (
              <>
                <button className="landing-slideshow-arrow landing-slideshow-arrow--prev" onClick={prevSlide} aria-label="Previous service">
                  <ChevronLeft size={24} />
                </button>
                <button className="landing-slideshow-arrow landing-slideshow-arrow--next" onClick={nextSlide} aria-label="Next service">
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {filteredServices.length > 1 && (
              <div className="landing-slideshow-dots">
                {filteredServices.map((_, i) => (
                  <button
                    key={i}
                    className={`landing-slideshow-dot ${i === currentSlide ? 'landing-slideshow-dot--active' : ''}`}
                    onClick={() => goToSlide(i)}
                    aria-label={`Go to service ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="landing-empty">Services coming soon. Check back later!</p>
        )}
      </section>

      {/* ─── About ─── */}
      <section id="about" className="landing-section landing-section--alt">
        <div className="landing-section-header">
          <h2 className="landing-section-title">About AzCuts</h2>
          <p className="landing-section-sub">Your go-to destination for sharp looks and premium grooming</p>
        </div>
        <div className="landing-about">
          <div className="landing-about-text">
            <p>
              AzCuts is a modern barber shop and salon built on the belief that great grooming should be accessible,
              convenient, and enjoyable. We combine skilled craftsmanship with a seamless digital booking experience
              so you can spend less time waiting and more time looking your best.
            </p>
            <p>
              From classic haircuts to full salon treatments, our team is dedicated to delivering quality service
              every single visit.
            </p>
          </div>
          <div className="landing-team">
            <h3 className="landing-team-title">Meet the Team</h3>
            <div className="landing-team-grid">
              <div className="landing-team-card">
                <div className="landing-team-avatar"><Scissors size={20} /></div>
                <div>
                  <strong>Uelmark G. Valdehueza</strong>
                  <span>Head Developer</span>
                </div>
              </div>
              <div className="landing-team-card">
                <div className="landing-team-avatar"><Sparkles size={20} /></div>
                <div>
                  <strong>JM Nikko O. Gallardo</strong>
                  <span>Assistant Developer</span>
                </div>
              </div>
              <div className="landing-team-card">
                <div className="landing-team-avatar"><Sparkles size={20} /></div>
                <div>
                  <strong>Lara Angel A. Habagat</strong>
                  <span>Assistant Developer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section id="contact" className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Contact Us</h2>
          <p className="landing-section-sub">Get in touch for appointments and inquiries</p>
        </div>
        <div className="landing-contact-grid">
          <div className="landing-contact-card">
            <Phone size={24} />
            <div>
              <h4>Phone</h4>
              <p>{shopInfo.phone || 'Contact us'}</p>
            </div>
          </div>
          <div className="landing-contact-card">
            <Mail size={24} />
            <div>
              <h4>Email</h4>
              <p>{shopInfo.email || 'info@azcuts.com'}</p>
            </div>
          </div>
          {shopInfo.socials && Object.entries(shopInfo.socials).map(([platform, url]) => (
            <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="landing-contact-card">
              <ExternalLink size={24} />
              <div>
                <h4>{platform.charAt(0).toUpperCase() + platform.slice(1)}</h4>
                <p>Visit our page</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── Location ─── */}
      <section id="location" className="landing-section landing-section--alt">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Find Us</h2>
          <p className="landing-section-sub">{shopInfo.address || 'Visit us at our shop'}</p>
        </div>
        <div className="landing-location-grid">
          {shopInfo.mapEmbedUrl ? (
            <div className="landing-map">
              <iframe
                title="AzCuts Location"
                src={shopInfo.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="landing-map landing-map--placeholder">
              <MapPin size={48} strokeWidth={1} />
              <p>{shopInfo.address || 'Map coming soon'}</p>
            </div>
          )}
          {storeHours && (
            <div className="landing-hours">
              <h3><Clock size={18} /> Store Hours</h3>
              <ul className="landing-hours-list">
                {weekDays.map((day) => {
                  const h = storeHours[day];
                  if (!h) return null;
                  return (
                    <li key={day} className="landing-hours-row">
                      <span>{dayLabels[day]}</span>
                      <span>{h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Scissors size={18} />
            <span>AzCuts</span>
          </div>
          <p>&copy; {new Date().getFullYear()} AzCuts. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
