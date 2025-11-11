import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'User'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                Welcome, {username}
              </h1>
              <p className="dashboard-subtitle">Manage your medical records</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card turquoise">
              <h3 className="stat-title">Total Records</h3>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-card purple">
              <h3 className="stat-title">Appointments</h3>
              <p className="stat-value">0</p>
            </div>
            <div className="stat-card orange">
              <h3 className="stat-title">Prescriptions</h3>
              <p className="stat-value">0</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-content">
              <div className="info-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="info-text">
                <h4>Getting Started</h4>
                <p>
                  Your dashboard is ready! This is where you'll be able to view, upload, and manage your medical records securely.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-grid">
            <button className="action-btn purple">
              📄 Upload Medical Record
            </button>
            <button className="action-btn turquoise">
              📅 Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

