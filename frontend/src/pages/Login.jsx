import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getErrorMessage } from '../utils/api';
import * as authService from '../services/authService';
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
            login(await authService.login(trimmedEmail, password));
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setLoginError(getErrorMessage(err, 'Login failed'));
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