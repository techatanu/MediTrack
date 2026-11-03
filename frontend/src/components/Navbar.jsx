import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ['Home', '/#home'],
    ['Features', '/#features'],
    ['How it works', '/#how-it-works'],
    ['AI assistant', '/#assistant'],
    ['About', '/#about'],
  ];

  return (
    <header className="mt-nav">
      <div className="mt-nav-inner">
        <Link to="/" className="mt-nav-brand" aria-label="MediTrack home">
          <span className="mt-nav-mark"><HeartPulse size={19} strokeWidth={2.1} /></span>
          <span>MediTrack<small>YOUR HEALTH, IN ONE PLACE</small></span>
        </Link>
        <nav className={`mt-nav-links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {links.map(([label, href]) => <a href={href} key={label} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <div className="mt-nav-mobile-actions"><Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link><Link to="/signup" onClick={() => setMenuOpen(false)}>Get started <span>↗</span></Link></div>
        </nav>
        <div className="mt-nav-actions"><Link to="/login" className="mt-nav-login">Log in</Link><Link to="/signup" className="mt-nav-cta">Get started <span>↗</span></Link></div>
        <button className="mt-nav-toggle" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </header>
  );
};

export default Navbar;
