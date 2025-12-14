import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Auth.css';

function LinkAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkingManager, setLinkingManager] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const signupCode = searchParams.get('code');

  useEffect(() => {
    if (!signupCode) {
      navigate('/signup');
      return;
    }
    validateSignupCode(signupCode);
  }, [signupCode]);

  const validateSignupCode = async (code) => {
    const { data, error } = await supabase
      .from('manager_signup_codes')
      .select('manager_id, profiles!inner(full_name, agency_name)')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (data && !error) {
      setLinkingManager({
        id: data.manager_id,
        name: data.profiles.full_name,
        agency: data.profiles.agency_name
      });
    } else {
      setError('Invalid or expired signup link');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Step 2: Update their profile to link to this manager
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          manager_id: linkingManager.id,
          signup_code: signupCode 
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      setSuccess(`Successfully linked to ${linkingManager.name}'s team!`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!linkingManager) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Insurance Tracker</h1>
          <div className="error-message">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Insurance Tracker</h1>
        <h2>Link Your Account</h2>
        
        <div className="info-message">
          You're linking your existing account to <strong>{linkingManager.name}'s</strong> team
          {linkingManager.agency && ` at ${linkingManager.agency}`}
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Your Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Linking account...' : 'Link My Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>Don't have an account? <Link to={`/signup?code=${signupCode}`}>Create one instead</Link></p>
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LinkAccount;
