import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Heart } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="logo-icon">
                    <img src="/MediTrackLogo.png" alt="meditrack-logo" />
                </div>
                <span>MediTrack</span>
            </Link>


            <div className="sidebar-footer">
                <Link to="/profile" className="user-profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="user-avatar">
                        <User size={20} />
                    </div>
                    <div className="user-info">
                        <span className="user-name">User Profile</span>
                        <span className="user-role">View Details</span>
                    </div>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/reports" className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
                            <FileText size={20} />
                            <span>Reports</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/doctors" className={`nav-item ${isActive('/doctors') ? 'active' : ''}`}>
                            <Heart size={20} />
                            <span>Doctors</span>
                        </Link>
                    </li>


                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;