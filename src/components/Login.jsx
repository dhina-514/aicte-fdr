import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  HelpCircle,
  Award,
  ShieldCheck
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('AICTE_OFFICER'); // 'AICTE_OFFICER' | 'COLLEGE_ADMIN' | 'BANK_OFFICER'
  const [identifier, setIdentifier] = useState('officer.southern@aicte.gov.in');
  const [password, setPassword] = useState('aicte@2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick pre-fills for testing different official accounts
  const handleSelectRoleTab = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'AICTE_OFFICER') {
      setIdentifier('officer.southern@aicte.gov.in');
      setPassword('aicte@2026');
    } else if (role === 'COLLEGE_ADMIN') {
      setIdentifier('principal@psgtech.edu');
      setPassword('psg@2026');
    } else if (role === 'BANK_OFFICER') {
      setIdentifier('mgr.peelamedu@canarabank.com');
      setPassword('bank@2026');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: selectedRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f1f5f9'
    }}>
      {/* Official Top National Banner */}
      <div className="official-gov-bar">
        <div className="gov-badge">
          <span className="gov-emblem-text">Government of India</span>
          <span>•</span>
          <span>Ministry of Education</span>
          <span>•</span>
          <span>All India Council for Technical Education (AICTE)</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#4ade80', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span>
            NIC National Portal Gateway: SECURED (TLS 1.3)
          </span>
        </div>
      </div>

      {/* Signature Indian Government Tricolor Ribbon */}
      <div className="tricolor-ribbon"></div>

      {/* Main Login Container */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '36px 20px' 
      }}>
        <div style={{ 
          maxWidth: '500px', 
          width: '100%',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)'
        }}>
          {/* Official Emblem & Portal Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #0f2e5a 0%, #1e4b85 100%)',
              margin: '0 auto 14px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(15, 46, 90, 0.25)',
              border: '2px solid #e2e8f0'
            }}>
              <Award size={34} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f2e5a' }}>
              National Security Deposit & e-FDR Portal
            </h1>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              All India Council for Technical Education • Ministry of Education
            </p>
          </div>

          {/* Authority Selection Tabs (Styled like Indian Govt Portals) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '6px', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => handleSelectRoleTab('AICTE_OFFICER')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 4px',
                borderRadius: 'var(--radius-sm)',
                border: selectedRole === 'AICTE_OFFICER' ? '1px solid #091f3c' : '1px solid transparent',
                background: selectedRole === 'AICTE_OFFICER' ? '#0f2e5a' : 'transparent',
                color: selectedRole === 'AICTE_OFFICER' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <Landmark size={16} />
              <span>AICTE Officer</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleTab('COLLEGE_ADMIN')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 4px',
                borderRadius: 'var(--radius-sm)',
                border: selectedRole === 'COLLEGE_ADMIN' ? '1px solid #b45309' : '1px solid transparent',
                background: selectedRole === 'COLLEGE_ADMIN' ? '#d97706' : 'transparent',
                color: selectedRole === 'COLLEGE_ADMIN' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <Building2 size={16} />
              <span>Institution / Trust</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRoleTab('BANK_OFFICER')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 4px',
                borderRadius: 'var(--radius-sm)',
                border: selectedRole === 'BANK_OFFICER' ? '1px solid #166534' : '1px solid transparent',
                background: selectedRole === 'BANK_OFFICER' ? '#15803d' : 'transparent',
                color: selectedRole === 'BANK_OFFICER' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <ShieldCheck size={16} />
              <span>Bank SFMS</span>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                {selectedRole === 'AICTE_OFFICER' 
                  ? 'Official Gov.in Email ID' 
                  : selectedRole === 'COLLEGE_ADMIN' 
                  ? 'AICTE Institute PID or Registered Email' 
                  : 'Bank Officer Email / Corporate ID'}
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                gap: '10px'
              }}>
                <Mail size={16} color="#64748b" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={selectedRole === 'COLLEGE_ADMIN' ? 'e.g. 1-9318281101' : 'e.g. officer@aicte.gov.in'}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Secure Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                gap: '10px'
              }}>
                <Lock size={16} color="#64748b" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '6px',
                background: selectedRole === 'COLLEGE_ADMIN' 
                  ? '#d97706' 
                  : selectedRole === 'BANK_OFFICER'
                  ? '#15803d'
                  : '#0f2e5a',
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              <span>{loading ? 'Authenticating with Central Registry...' : `Sign in to ${selectedRole === 'AICTE_OFFICER' ? 'AICTE Council Console' : selectedRole === 'COLLEGE_ADMIN' ? 'Institution Portal' : 'Bank SFMS Gateway'}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Credential Helper Chips */}
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '16px', 
            borderTop: '1px solid #e2e8f0' 
          }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={13} />
              <span>OFFICIAL TEST CREDENTIALS (CLICK TO AUTO-FILL):</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div 
                onClick={() => handleSelectRoleTab('AICTE_OFFICER')}
                style={{ 
                  fontSize: '0.72rem', 
                  color: '#334155', 
                  cursor: 'pointer', 
                  padding: '6px 8px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px' 
                }}
              >
                🏛️ <strong>AICTE Officer:</strong> <code style={{ color: '#0f2e5a', fontWeight: 700 }}>officer.southern@aicte.gov.in</code> / <code style={{ color: '#0f2e5a', fontWeight: 700 }}>aicte@2026</code>
              </div>

              <div 
                onClick={() => handleSelectRoleTab('COLLEGE_ADMIN')}
                style={{ 
                  fontSize: '0.72rem', 
                  color: '#334155', 
                  cursor: 'pointer', 
                  padding: '6px 8px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px' 
                }}
              >
                🏢 <strong>College Admin:</strong> <code style={{ color: '#d97706', fontWeight: 700 }}>principal@psgtech.edu</code> / <code style={{ color: '#d97706', fontWeight: 700 }}>psg@2026</code>
              </div>

              <div 
                onClick={() => handleSelectRoleTab('BANK_OFFICER')}
                style={{ 
                  fontSize: '0.72rem', 
                  color: '#334155', 
                  cursor: 'pointer', 
                  padding: '6px 8px', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px' 
                }}
              >
                🏦 <strong>Bank Officer:</strong> <code style={{ color: '#15803d', fontWeight: 700 }}>mgr.peelamedu@canarabank.com</code> / <code style={{ color: '#15803d', fontWeight: 700 }}>bank@2026</code>
              </div>
            </div>
          </div>

          {/* Legal / Security Footer */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.68rem', color: '#94a3b8' }}>
            Authorized Technical Institutions & Regulatory Personnel Only.
            <br />Secured under Information Technology Act, 2000 & RBI SFMS Protocols.
          </div>
        </div>
      </div>
    </div>
  );
}
