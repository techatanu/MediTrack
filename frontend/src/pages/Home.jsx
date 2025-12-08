import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Folder, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <p className="hero-subtitle">Professional Medical Application</p>
            <h1 className="hero-title">Never Lose Your Medical Records Again.</h1>
            <p className="hero-description">
              Visiting a new doctor? Need an old prescription? Stop digging through WhatsApp chats and messy folders. Upload once, access forever—from any device, anytime.
            </p>
            <div className="hero-actions">
              <Link to="/signup">
                <Button variant="primary" size="large">Get started</Button>
              </Link>
              <Button variant="outline" size="large">Learn more →</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <Lock size={24} />
            </div>
            <h3>Secure Storage</h3>
            <p>Upload your prescriptions, lab reports, and blood test results once. We store them safely so only you can see them. No more asking family members to send old documents or searching through your phone's gallery at the doctor's office.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Folder size={24} />
            </div>
            <h3>Easy Organization</h3>
            <p>All your health records in one place—organized by date, so you can actually find what you need. Whether it's last year's prescription or your blood group report, it's right there when the doctor asks for it.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Smartphone size={24} />
            </div>
            <h3>Anywhere Access</h3>
            <p>At a new hospital? Traveling? Emergency situation? Just log in from any phone or computer and your complete medical history is ready. No more 'I left it at home' moments when doctors need your previous reports.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
