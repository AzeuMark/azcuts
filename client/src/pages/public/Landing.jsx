import PublicNavbar from '../../components/layout/PublicNavbar';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <PublicNavbar />

      <section className="landing-hero">
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">
            Sharp Looks,<br />Effortless Booking
          </h1>
          <p className="landing-hero-sub">
            Book your next haircut or salon service in seconds. Pick a service, choose a time, and walk in looking your best.
          </p>
          <div className="landing-hero-actions">
            <Button size="lg" onClick={() => navigate('/register')}>Book Now</Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>Login</Button>
          </div>
        </div>
      </section>

      <section id="services" className="landing-section">
        <h2 className="landing-section-title">Our Services</h2>
        <p className="landing-section-sub">Loading services...</p>
      </section>

      <section id="about" className="landing-section landing-section--alt">
        <h2 className="landing-section-title">About AzCuts</h2>
        <p className="landing-section-text">
          AzCuts is your go-to barber shop and salon — delivering sharp looks and a seamless booking experience.
        </p>
      </section>

      <section id="contact" className="landing-section">
        <h2 className="landing-section-title">Contact Us</h2>
        <p className="landing-section-text">Get in touch for appointments and inquiries.</p>
      </section>

      <section id="location" className="landing-section landing-section--alt">
        <h2 className="landing-section-title">Find Us</h2>
        <p className="landing-section-text">Visit us at our shop location.</p>
      </section>
    </div>
  );
}
