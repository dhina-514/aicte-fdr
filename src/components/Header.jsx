import React, { useState } from 'react';
import { 
  Building2, 
  Landmark, 
  FileText, 
  LogOut, 
  User,
  Shield,
  Award,
  CheckCircle2,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

export default function Header({ 
  currentUser, 
  activeView, 
  setActiveView, 
  onLogout 
}) {
  const [lang, setLang] = useState('EN');
  const [fontSizeLevel, setFontSizeLevel] = useState(1); // 0: Small, 1: Normal, 2: Large

  const handleFontSize = (delta) => {
    const next = Math.max(0, Math.min(2, fontSizeLevel + delta));
    setFontSizeLevel(next);
    const root = document.documentElement;
    if (next === 0) root.style.fontSize = '14.5px';
    else if (next === 1) root.style.fontSize = '16px';
    else if (next === 2) root.style.fontSize = '17.5px';
  };

  return (
    <header style={{ width: '100%', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
      {/* 1. Official Government of India Top Accessibility & Ministry Bar */}
      <div style={{
        background: '#07172c',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '5px 28px',
        fontSize: '0.74rem',
        color: '#e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Left: Official Ministry Identification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>🇮🇳</span>
            <span style={{ color: '#fbbf24', fontWeight: 800, letterSpacing: '0.03em' }}>
              भारत सरकार | GOVERNMENT OF INDIA
            </span>
          </div>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontWeight: 600, color: '#94a3b8' }}>
            शिक्षा मंत्रालय | Ministry of Education
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>
            अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)
          </span>
        </div>

        {/* Right: Accessibility Controls & Security Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Screen Reader & Text Resize */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #334155', paddingRight: '12px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Text Size:</span>
            <button 
              type="button"
              onClick={() => handleFontSize(-1)}
              title="Decrease Font Size"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#e2e8f0', padding: '1px 5px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700 }}
            >
              A-
            </button>
            <button 
              type="button"
              onClick={() => handleFontSize(1 - fontSizeLevel)}
              title="Reset Font Size"
              style={{ background: fontSizeLevel === 1 ? 'rgba(255,255,255,0.15)' : 'transparent', border: '1px solid #334155', color: '#e2e8f0', padding: '1px 5px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
            >
              A
            </button>
            <button 
              type="button"
              onClick={() => handleFontSize(1)}
              title="Increase Font Size"
              style={{ background: 'transparent', border: '1px solid #334155', color: '#e2e8f0', padding: '1px 5px', borderRadius: '3px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700 }}
            >
              A+
            </button>
          </div>

          {/* Language Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid #334155', paddingRight: '12px' }}>
            <Globe size={12} color="#38bdf8" />
            <button 
              type="button" 
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {lang === 'EN' ? 'English | हिन्दी' : 'हिन्दी | English'}
            </button>
          </div>

          {/* Real-time SFMS Banking Gateway Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot" style={{ color: '#22c55e' }}></span>
            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.72rem' }}>
              SFMS Central Gateway: 100% OPERATIONAL
            </span>
          </div>
        </div>
      </div>

      {/* 2. Indian National Tricolor Ribbon (Tiranga) */}
      <div className="tricolor-ribbon" style={{ height: '4.5px' }}></div>

      {/* 3. Main Official Brand Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '2px solid #e2e8f0',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: National State Emblem & AICTE Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Official Emblem of India (Ashoka Lion Capital Crest) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRight: '2px solid #cbd5e1',
            paddingRight: '16px',
            lineHeight: 1.1
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#091f3c', letterSpacing: '0.04em' }}>
              🏛️
            </div>
            <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
              सत्यमेव जयते
            </span>
          </div>

          {/* AICTE SURAKSHA-FDR Official Crest */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #091f3c 0%, #0f2e5a 50%, #1e40af 100%)',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 10px rgba(15, 46, 90, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <Shield size={26} color="#38bdf8" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontSize: '1.35rem', 
                  fontWeight: 900, 
                  color: '#091f3c',
                  letterSpacing: '-0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  AICTE SURAKSHA-FDR
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fde68a' }}>
                    सुरक्षा-FDR
                  </span>
                </span>

                <span className="badge badge-verified" style={{ fontSize: '0.64rem', padding: '2px 8px' }}>
                  APH 2026-27 STATUTORY PORTAL
                </span>
                <span className="badge" style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.64rem', padding: '2px 8px' }}>
                  NIC ZERO-TRUST ARCHITECTURE
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                <strong>Statutory Unified Regulatory & Anti-fraud Knowledge Handshake</strong> for Institutional Fixed Deposits
              </div>
            </div>
          </div>
        </div>

        {/* Center: View Switcher (For AICTE Officers) */}
        {currentUser?.role === 'AICTE_OFFICER' && (
          <div style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            padding: '4px', 
            borderRadius: '8px', 
            border: '1px solid #cbd5e1',
            gap: '4px'
          }}>
            <button 
              id="btn-nav-console"
              type="button"
              className={`btn btn-sm ${activeView === 'MAIN' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveView('MAIN')}
              style={{
                borderRadius: '6px',
                fontSize: '0.8rem',
                padding: '6px 14px',
                border: activeView === 'MAIN' ? 'none' : 'transparent',
                background: activeView === 'MAIN' ? '#0f2e5a' : 'transparent',
                color: activeView === 'MAIN' ? '#ffffff' : '#334155',
                boxShadow: activeView === 'MAIN' ? '0 2px 4px rgba(15, 46, 90, 0.2)' : 'none'
              }}
            >
              <Landmark size={14} />
              <span>Surveillance Console</span>
            </button>

            <button 
              id="btn-nav-audit"
              type="button"
              className={`btn btn-sm ${activeView === 'AUDIT' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveView('AUDIT')}
              style={{
                borderRadius: '6px',
                fontSize: '0.8rem',
                padding: '6px 14px',
                border: activeView === 'AUDIT' ? 'none' : 'transparent',
                background: activeView === 'AUDIT' ? '#0f2e5a' : 'transparent',
                color: activeView === 'AUDIT' ? '#ffffff' : '#334155',
                boxShadow: activeView === 'AUDIT' ? '0 2px 4px rgba(15, 46, 90, 0.2)' : 'none'
              }}
            >
              <FileText size={14} />
              <span>Statutory Audit Ledger</span>
            </button>
          </div>
        )}

        {/* Right: Authenticated User Profile Badge & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 14px',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#0f2e5a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}>
              {currentUser?.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
              <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#091f3c' }}>
                {currentUser?.full_name}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                {currentUser?.designation} • {currentUser?.region || 'Headquarters'}
              </div>
            </div>
          </div>

          <button 
            id="btn-logout"
            className="btn btn-outline btn-sm"
            style={{ 
              borderColor: '#fca5a5', 
              color: '#dc2626', 
              background: '#fff5f5',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
            onClick={onLogout}
            title="Secure Sign Out from AICTE Central Network"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
