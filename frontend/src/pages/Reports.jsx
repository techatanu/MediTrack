import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, FlaskConical, FileText, ChevronRight, Plus, Eye, ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import axios from 'axios';
import './Dashboard.css';

const Reports = () => {
    const [searchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');

                const query = searchTerm ? `?search=${searchTerm}` : '';
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/reports${query}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setReports(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching reports:", err);
                setError('Failed to load reports.');
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchReports();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            navigate('/reports', { replace: true });
        } else {
            navigate(`/reports?search=${searchTerm}`, { replace: true });
        }
    }, [searchTerm, navigate]);

    return (
        <div className="dashboard-layout">
            <Sidebar />

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="header-search" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center'
                            }}
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.7)' }} />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }} 
                            />
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="icon-btn" style={{ opacity: 0.5 }}><Search size={20} /></div>
                        <div className="user-profile">
                            <img src="/demo user.png" alt="User" className="avatar" />
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="section-header">
                        <h2>All Reports</h2>
                        <Link to="/upload">
                            <Button variant="primary">
                                <Plus size={18} /> Upload New
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="loading-state">Loading reports...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : reports.length === 0 ? (
                        <div className="empty-state">No reports found.</div>
                    ) : (
                        <div className="reports-list">
                            {reports.map((report) => (
                                <div key={report._id} className="report-item" onClick={() => navigate(`/reports/${report._id}`)} style={{ cursor: 'pointer' }}>
                                    <div className={`report-icon ${report.category === 'Lab' ? 'bg-blue' : 'bg-green'}`}>
                                        {report.category === 'Lab' ? <FlaskConical size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className="report-info">
                                        <h4>{report.category}</h4>
                                        <p>{report.title}</p>
                                        <span className="report-date" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                            {new Date(report.reportDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="small" onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/reports/${report._id}`);
                                    }}>
                                        <Eye size={16} /> View
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Reports;