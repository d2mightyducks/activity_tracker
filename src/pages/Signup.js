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
  const [showLinkOption, setShowLinkOption] = useState(false);
  const [linkingManager, setLinkingManager] = useState(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const signupCode = searchParams.get('code');

  useEffect(() => {
    fetchManagers();
    if (signupCode) {
      validateSignupCode(signupCode);
    }
  }, [signupCode]);

const validateSignupCode = async (code) => {
  // First get the signup code
  const { data: codeData, error: codeError } = await supabase
    .from('manager_signup_codes')
    .select('manager_id')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (!codeData || codeError) return;

  // Then get the manager details
  const { data: managerData, error: managerError } = await supabase
    .from('profiles')
    .select('full_name, agency_name')
    .eq('id', codeData.manager_id)
    .single();

  if (managerData && !managerError) {
    setSelectedManager(codeData.manager_id);
    setLinkingManager({
      id: codeData.manager_id,
      name: managerData.full_name,
      agency: managerData.agency_name
    });
    setShowLinkOption(true);
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
      navigate('/login');
    }
  };

  // NEW: Link existing account to manager
  const handleLinkAccount = () => {
    navigate(`/link-account?code=${signupCode}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Insurance Tracker</h1>
        <h2>Agent Signup</h2>
        
        {linkingManager && (
          <div className="info-message">
            You're joining <strong>{linkingManager.name}'s</strong> team
            {linkingManager.agency && ` at ${linkingManager.agency}`}
          </div>
        )}

        {showLinkOption && (
          <div className="link-option-card">
            <p><strong>Already have an account?</strong></p>
            <button onClick={handleLinkAccount} className="btn-secondary" style={{width: '100%', marginBottom: '16px'}}>
              Link My Existing Account
            </button>
            <p style={{textAlign: 'center', color: '#666', fontSize: '14px', margin: '16px 0'}}>
              — or create a new account below —
            </p>
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
