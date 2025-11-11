import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FeatureCard from '../components/FeatureCard'
import './Home.css'

// Icons (using SVG components)
const CloudUploadIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const LockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const DocumentSearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const Home = () => {
  return (
    <div className="home-wrapper">
      <Navbar />
      
      <div className="home-container">
        {/* Main Card Container */}
        <div className="home-card">
          {/* Hero Section */}
          <div className="hero-section">
            <h1 className="hero-title">
              Your medical records, organized and accessible <br />whenever you need them.
            </h1>
            <p className="hero-description">
              No more digging through folders or old messages — find your health info in seconds.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="hero-btn-primary">
                View My Dashboard
              </Link>
              <Link to="/login" className="hero-btn-secondary">
                Login
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="features-grid">
            <FeatureCard
              icon={CloudUploadIcon}
              title="Easy Upload"
              description="Effortlessly add new reports from any device."
              iconColor="green"
            />
            <FeatureCard
              icon={LockIcon}
              title="Secure Storage"
              description="Your data encrypted and protected."
              iconColor="blue"
            />
            <FeatureCard
              icon={DocumentSearchIcon}
              title="Quick Access"
              description="Find what you need in seconds."
              iconColor="blue"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

