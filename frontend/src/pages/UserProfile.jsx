import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/api';
import * as authService from '../services/authService';
import { User, Mail, Calendar, Activity, Ruler, Weight, LogOut, Save, Edit2, Lock } from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
    const { updateSession, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        height: '',
        weight: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const profile = await authService.getProfile();
            setUser(profile);
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
                gender: profile.gender || '',
                bloodGroup: profile.bloodGroup || '',
                height: profile.height || '',
                weight: profile.weight || ''
            });
        } catch (err) {
            setError(getErrorMessage(err, 'Failed to load profile'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updated = await authService.updateProfile({
                ...formData,
                gender: formData.gender || undefined,
                bloodGroup: formData.bloodGroup || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
                height: formData.height ? Number(formData.height) : undefined,
                weight: formData.weight ? Number(formData.weight) : undefined
            });
            setUser(updated);
            updateSession({ firstName: updated.firstName });
            setIsEditing(false);
        } catch (err) {
            setError(getErrorMessage(err, 'Update failed'));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="profile-title">
                            <h1>{user?.firstName} {user?.lastName}</h1>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-logout"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

                <div className="profile-content">
                    <div className="section-header">
                        <h2 className="section-title">Personal Information</h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-edit"
                            >
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            <span>{error}</span>
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="info-grid">
                            <div className="info-column">
                                <InfoItem icon={<User />} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                                <InfoItem icon={<Mail />} label="Email" value={user?.email} />
                                <InfoItem icon={<Calendar />} label="Date of Birth" value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'} />
                            </div>
                            <div className="info-column">
                                <InfoItem icon={<Activity />} label="Blood Group" value={user?.bloodGroup || 'Not set'} />
                                <InfoItem icon={<Ruler />} label="Height" value={user?.height ? `${user.height} cm` : 'Not set'} />
                                <InfoItem icon={<Weight />} label="Weight" value={user?.weight ? `${user.weight} kg` : 'Not set'} />
                                <InfoItem icon={<User />} label="Gender" value={user?.gender || 'Not set'} />
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="edit-form">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Blood Group</label>
                                <select
                                    value={formData.bloodGroup}
                                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Height (cm)</label>
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-save"
                                >
                                    <Save size={18} />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    <ChangePasswordForm
                        onPasswordChanged={(token) => updateSession({ token })}
                    />
                </div>
            </div>
        </div>
    );
};

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

const ChangePasswordForm = ({ onPasswordChanged }) => {
    const [form, setForm] = useState(emptyPasswordForm);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setSaving(true);
        try {
            const { token } = await authService.changePassword(form.currentPassword, form.newPassword);
            // The backend revokes all existing tokens, so switch this session to the new one.
            onPasswordChanged(token);
            setForm(emptyPasswordForm);
            setSuccess('Password changed. You have been signed out on other devices.');
        } catch (err) {
            setError(getErrorMessage(err, 'Could not change password'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="password-section">
            <div className="section-header">
                <h2 className="section-title">Change Password</h2>
            </div>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="success-message">
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        autoComplete="current-password"
                        required
                        value={form.currentPassword}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={form.newPassword}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn-save">
                        <Lock size={18} />
                        {saving ? 'Changing...' : 'Change Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="info-item">
        <div className="info-icon">{icon}</div>
        <div>
            <p className="info-label">{label}</p>
            <p className="info-value">{value}</p>
        </div>
    </div>
);

export default UserProfile;
