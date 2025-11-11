import React, { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError(null);
        
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            setLoginError('Please enter email and password');
            return;
        }

        console.log("Mock login:", trimmedEmail);
        localStorage.setItem('username', trimmedEmail.split('@')[0]);
        localStorage.setItem('token', 'mock-token-123');
        navigate('/dashboard', { replace: true });
    }
    
    return (
        <div className="auth-wrapper">
            <div className="auth-i">
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
                    {loginError && <p style={{color:'red', marginBottom: '10px'}}>{loginError}</p>}
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