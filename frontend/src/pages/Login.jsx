import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setLoginError('Please enter email and password');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: trimmedEmail, password })
            });
            const data = await response.json();
            if (!response.ok) {
                setLoginError(data?.message || 'Login failed');
                return;
            }


            login({
                username: data.data?.firstName || trimmedEmail.split('@')[0],
                firstName: data.data?.firstName || trimmedEmail.split('@')[0],
                token: data.token
            });

            navigate('/dashboard', { replace: true });
        } catch (err) {
            setLoginError('Network error. Please try again.');
        }
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-inner">
                <form onSubmit={handleSubmit}>
                    <h3>Login</h3>
                    <div className="structure">
                        <label>Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="structure">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {loginError && <p style={{ color: 'red', marginBottom: '10px' }}>{loginError}</p>}
                    <div className="d-grid">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                    <p className="forgot-password text-right">
                        New user <a href="/signup">Register Here</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login;