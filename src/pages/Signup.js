import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const signupCode = searchParams.get('code');

  useEffect(() => {
    fetchManagers();
    if (signupCode) {
      // If there's a signup code, find and pre-select the manager
      validateSignupCode(signupCode);
    }
  }, [signupCode]);

  const validateSignupCode = async (code) => {
    const { data, error } = await supabase
      .from('manager_signup_codes')
      .select('manager_id')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (data && !error) {
      setSelectedManager(data.manager_id);
    }
  };

  const fetchManagers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, agency_name')
      .eq('role', 'manager')
      .order('full_name');

    if (data && !error) {
      setManagers(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const managerId = selectedManager || null;

    const { error } = await signUp(email, password, fullName, 'agent', managerId, signupCode);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Success - redirect to login
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Insurance Tracker</h1>
        <h2>Agent Signup</h2>
        
        {signupCode && (
          <div className="info-message">
            You're signing up with a manager invitation link
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {!signupCode && (
            <div className="form-group">
              <label>Manager (Optional)</label>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
              >
                <option value="">Independent Agent</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.full_name} {manager.agency_name ? `- ${manager.agency_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
