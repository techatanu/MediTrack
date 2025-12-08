import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, BarChart2, Clock, Phone, FlaskConical, FileText, ChevronRight, Plus, Stethoscope } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [reportsRes, doctorsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/reports`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/doctors`, { headers })
        ]);

        setReports(reportsRes.data.data);
        setDoctorsCount(doctorsRes.data.data.length);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/reports?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/reports');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="header-actions">
            <div className="icon-btn" onClick={handleSearch} style={{ cursor: 'pointer' }}>
              <Search size={20} />
            </div>
            <div className="user-profile">
              <img src="/demo user.png" alt="User" className="avatar" />
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="welcome-section">
            <div className="welcome-info">
              <img src="/demo user.png" alt="User" className="welcome-avatar" />
              <div>
                <h1>Welcome, {user?.firstName || 'User'}</h1>
                <p>Your professional medical application</p>
              </div>
            </div>
            <div className="welcome-actions">
              <Button variant="outline" className="profile-btn">
                <User size={16} /> User profile
              </Button>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <h3>Total Reports</h3>
                <FileText size={20} className="stat-icon" />
              </div>
              <div className="stat-value">
                <span className="value-icon"><FileText size={20} /></span>
                <span className="number">{reports.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h3>My Doctors</h3>
                <Stethoscope size={20} className="stat-icon" />
              </div>
              <div className="stat-value">
                <span className="value-icon"><Stethoscope size={20} /></span>
                <span className="number">{doctorsCount}</span>
              </div>
            </div>
          </div>

          <div className="reports-section">
            <div className="section-header">
              <h2>Recent Reports</h2>
              <Link to="/reports" className="view-all">View all</Link>
            </div>

            <div className="reports-grid">
              {loading ? (
                <div className="loading-state">Loading reports...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : reports.length === 0 ? (
                <div className="empty-state">No reports found. Upload your first report!</div>
              ) : (
                <div className="reports-list">
                  {reports.map((report) => (
                    <div key={report._id} className="report-item">
                      <div className={`report-icon ${report.category === 'Lab' ? 'bg-blue' : 'bg-green'}`}>
                        {report.category === 'Lab' ? <FlaskConical size={24} /> : <FileText size={24} />}
                      </div>
                      <div className="report-info">
                        <h4>{report.category}</h4>
                        <p>{report.title}</p>
                        {report.doctor && (
                          <span className="doctor-name">Dr. {report.doctor.name || 'Unknown'}</span>
                        )}
                      </div>
                      <span className="report-date">{formatDate(report.reportDate)}</span>
                      <ChevronRight
                        size={20}
                        className="arrow-icon"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/reports/${report._id}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="upload-action">
              <Link to="/upload">
                <Button variant="primary" size="large" className="upload-btn">
                  <Plus size={20} /> Upload New Report
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
