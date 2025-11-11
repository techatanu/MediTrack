import { Link } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon">
          <span>M</span>
        </div>
        <span className="navbar-brand">MediTrack</span>
      </Link>
      <div className="navbar-actions">
        <Link to="/login" className="navbar-link">
          Login
        </Link>
        <Link to="/signup" className="navbar-btn">
          Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar

