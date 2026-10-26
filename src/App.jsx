import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import Login from './components/Login';
import AicteDashboard from './components/AicteDashboard';
import CollegePortal from './components/CollegePortal';
import BankPortal from './components/BankPortal';
import AuditLedger from './components/AuditLedger';
import FdrDetailsModal from './components/FdrDetailsModal';
import EvcPlacardModal from './components/EvcPlacardModal';
import EvcInspectorModal from './components/EvcInspectorModal';
import EvcDossierModal from './components/EvcDossierModal';
import MultiLienRadarModal from './components/MultiLienRadarModal';
import DormantRecoveryModal from './components/DormantRecoveryModal';
import AccreditationAuditModal from './components/AccreditationAuditModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aicte_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState('MAIN'); // 'MAIN' | 'AUDIT'
  const [fdrRecords, setFdrRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedFdrForModal, setSelectedFdrForModal] = useState(null);
  const [selectedFdrForPlacard, setSelectedFdrForPlacard] = useState(null);
  const [selectedFdrForDossier, setSelectedFdrForDossier] = useState(null);
  const [selectedFdrForRadar, setSelectedFdrForRadar] = useState(null);
  const [selectedFdrForAccreditation, setSelectedFdrForAccreditation] = useState(null);
  const [showDormantModal, setShowDormantModal] = useState(false);
  const [showEvcInspector, setShowEvcInspector] = useState(false);
  const [evcInspectorTarget, setEvcInspectorTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Trigger Toast Notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch FDR data & Stats from backend API
  const refreshData = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. Fetch FDR records according to role
      let url = '/api/fdr?';
      if (currentUser.role === 'COLLEGE_ADMIN' && currentUser.aicte_pid) {
        url += `role=COLLEGE_ADMIN&aicte_pid=${encodeURIComponent(currentUser.aicte_pid)}`;
      } else if (currentUser.role === 'BANK_OFFICER') {
        url += 'role=BANK_OFFICER';
      } else {
        url += 'role=AICTE_OFFICER';
      }

      const fdrRes = await fetch(url);
      const fdrData = await fdrRes.json();
      if (fdrData.success && fdrData.records) {
        setFdrRecords(fdrData.records);
      }
    } catch (err) {
      console.error('Error fetching data from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  // Handle Login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveView('MAIN');
    localStorage.setItem('aicte_user', JSON.stringify(user));
    showToast(`Welcome, ${user.full_name} (${user.designation})`);
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('MAIN');
    localStorage.removeItem('aicte_user');
    setFdrRecords([]);
    setStats(null);
    showToast("Signed out successfully from AICTE Central Network.");
  };

  // Add New FDR (College submission)
  const handleAddNewFdr = async (newRecordPayload) => {
    try {
      const res = await fetch('/api/fdr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecordPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit FDR.');

      await refreshData();

      if (newRecordPayload.status === 'FLAGGED_FORGERY') {
        showToast("⚠️ Security Deposit Flagged for Font Tampering! Case forwarded to AICTE Vigilance.");
      } else {
        showToast("✅ e-FDR submitted successfully! Dispatched to Bank SFMS Queue for Joint Lien Lock.");
      }
    } catch (err) {
      alert('Submission error: ' + err.message);
    }
  };

  // Bank Manager Confirms Joint Lien
  const handleBankVerifyFdr = async (fdrId) => {
    try {
      const res = await fetch(`/api/fdr/${fdrId}/bank-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmed_by: `${currentUser?.full_name} (${currentUser?.designation})`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bank verification failed.');

      await refreshData();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`🔒 Core Banking Joint Lien confirmed for ${fdrId}! Token: ${data.token}`);
    } catch (err) {
      alert('Verification error: ' + err.message);
    }
  };

  // College Requests 10-Year Maturity Release
  const handleRequestRelease = async (fdrId, justification) => {
    try {
      const res = await fetch(`/api/fdr/${fdrId}/request-release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ justification: justification || '10-Year statutory tenure completed without regulatory infractions. Requesting AICTE NOC and lien discharge.' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit release request.');

      await refreshData();
      showToast(`📝 10-Year Maturity Release Request filed for ${fdrId}! Dispatched to AICTE Regional Director.`);
    } catch (err) {
      alert('Request error: ' + err.message);
    }
  };

  // AICTE Regional Officer Approves 10-Year Maturity Release
  const handleApproveRelease = async (fdrId) => {
    try {
      const res = await fetch(`/api/fdr/${fdrId}/approve-release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Release approval failed.');

      await refreshData();

      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });

      showToast(`🎉 10-Year Security Deposit Release Approved for ${fdrId} under APH Chapter 1!`);
    } catch (err) {
      alert('Approval error: ' + err.message);
    }
  };

  // Dispatch Auto-Notice (Show Cause or Renewal Notice)
  const handleSendNotice = async (institutionName, type) => {
    try {
      const payload = {
        institution_name: institutionName,
        notice_type: type,
        subject: type === 'SHOW_CAUSE_FORGERY' 
          ? 'Show-Cause Notice: Forensic Discrepancy in Uploaded Security Deposit Certificate'
          : 'Mandatory Notice: Approaching Expiration of 10-Year Fixed Deposit Joint Lien',
        message: type === 'SHOW_CAUSE_FORGERY'
          ? 'You are hereby directed to explain within 7 days the discrepancy identified between your uploaded FDR document and the Bank Core Banking System confirmation.'
          : 'Notice is served that your institutional security deposit matures within 90 days. Initiate renewal under AICTE APH norms.',
        issued_by: `${currentUser?.full_name} (${currentUser?.organization_name})`
      };

      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch notice.');

      showToast(`📢 Formal Regulatory Notice issued to ${institutionName}.`);
    } catch (err) {
      alert('Notice dispatch error: ' + err.message);
    }
  };

  const [publicEvcQuery, setPublicEvcQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('evc') || null;
  });

  // Standalone Public EVC Inspector Mode (When external committee scans QR code from phone without login!)
  if (publicEvcQuery) {
    return (
      <div className="app-wrapper" style={{ minHeight: '100vh', background: '#091f3c', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EvcInspectorModal 
          preselectedFdr={{ id: publicEvcQuery, fdr_number: publicEvcQuery }}
          onClose={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('evc');
            window.history.replaceState({}, '', url.pathname || '/');
            setPublicEvcQuery(null);
          }}
          onRefresh={refreshData}
        />
      </div>
    );
  }

  // If user is not logged in, render official Login screen
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-wrapper">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--blue-primary)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.86rem',
          fontWeight: 600
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header 
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-container">
        {activeView === 'AUDIT' ? (
          <AuditLedger />
        ) : (
          <>
            {currentUser.role === 'AICTE_OFFICER' && (
              <AicteDashboard 
                fdrRecords={fdrRecords}
                stats={stats}
                onViewDetails={(item) => setSelectedFdrForModal(item)}
                onApproveRelease={handleApproveRelease}
                onSendNotice={handleSendNotice}
                onRefresh={refreshData}
                onViewEvcDossier={(item) => setSelectedFdrForDossier(item)}
                onOpenMultiLienRadar={(fdr) => setSelectedFdrForRadar(fdr || { id: 'CNRB-FD-8921094', fdr_number: 'CNRB-FD-8921094' })}
                onOpenDormantRecovery={() => setShowDormantModal(true)}
                onOpenAccreditationAudit={(fdr) => setSelectedFdrForAccreditation(fdr || { id: 'FDR-2024-CAN-0891', fdr_number: 'CNRB-FD-8921094' })}
                onOpenEvcInspector={(fdr) => {
                  setEvcInspectorTarget(fdr || null);
                  setShowEvcInspector(true);
                }}
              />
            )}

            {currentUser.role === 'COLLEGE_ADMIN' && (
              <CollegePortal 
                currentUser={currentUser}
                myCollegeFdrList={fdrRecords}
                onAddNewFdr={handleAddNewFdr}
                onRequestRelease={handleRequestRelease}
                onOpenEvcPlacard={(fdr) => setSelectedFdrForPlacard(fdr)}
              />
            )}

            {currentUser.role === 'BANK_OFFICER' && (
              <BankPortal 
                currentUser={currentUser}
                fdrRecords={fdrRecords}
                onBankVerifyFdr={handleBankVerifyFdr}
              />
            )}
          </>
        )}
      </main>

      {/* Official Government of India & Ministry Footer */}
      <footer style={{ 
        borderTop: '3px solid #0f2e5a', 
        background: '#07172c',
        color: '#cbd5e1',
        marginTop: 'auto',
        fontSize: '0.78rem'
      }}>
        {/* Main Footer Links & Info Grid */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '36px 28px 24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '28px',
          lineHeight: 1.6
        }}>
          {/* Column 1: AICTE Headquarters */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏛️</span>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fbbf24', letterSpacing: '0.02em' }}>
                ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px' }}>
              Statutory Body under Ministry of Education, Government of India.<br/>
              Nelson Mandela Marg, Vasant Kunj, New Delhi-110070
            </p>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              <div>• National Helpdesk: 011-29581000 / 011-29581050</div>
              <div>• Technical Support: support-fdr@aicte.gov.in</div>
              <div>• Central Vigilance: vigilance@aicte.gov.in</div>
            </div>
          </div>

          {/* Column 2: Regulatory & Legal Framework */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #1e3a8a', paddingBottom: '6px' }}>
              Statutory & Regulatory Norms
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
              <li>• AICTE Act, 1987 (Act No. 52 of 1987)</li>
              <li>• Approval Process Handbook (APH) 2026-27</li>
              <li>• APH Chapter 1: Tripartite Escrow Protocol</li>
              <li>• APH Chapter 2.4: NBA/NAAC Concession Recovery</li>
              <li>• IT Act, 2000 Section 65B Electronic Proof</li>
            </ul>
          </div>

          {/* Column 3: Inter-Agency Gateways */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #1e3a8a', paddingBottom: '6px' }}>
              National Inter-Agency Networks
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
              <li>• RBI Structured Financial Messaging System (SFMS)</li>
              <li>• NeSL & CERSAI National Collateral Repository</li>
              <li>• National Board of Accreditation (e-NBA Registry)</li>
              <li>• National Assessment & Accreditation Council (NAAC)</li>
              <li>• AICTE Pragati & Saksham National Scholarship Fund</li>
            </ul>
          </div>

          {/* Column 4: Security Certification & Portal Stats */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#ffffff', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #1e3a8a', paddingBottom: '6px' }}>
              Cyber Security & Standards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>✓ ISO/IEC 27001 Certified Architecture</span>
                <p style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '2px' }}>STQC Audited & CERT-In Compliant Gateway</p>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                <div>• Zero-Trust Role-Based Authentication</div>
                <div>• SHA-256 Cryptographic Block Ledger</div>
                <div>• Last Updated: 25 October 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Indian Flag Accent Ribbon */}
        <div className="tricolor-ribbon" style={{ height: '3px' }}></div>

        {/* Bottom Sub-bar */}
        <div style={{ 
          background: '#040d1a', 
          padding: '14px 28px', 
          borderTop: '1px solid #0f2e5a',
          fontSize: '0.72rem',
          color: '#64748b'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              Website Content Managed by <strong>All India Council for Technical Education (AICTE), Ministry of Education, Govt. of India</strong>.
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>Terms of Use</span>
              <span>•</span>
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Hyperlinking Policy</span>
              <span>•</span>
              <span>Disclaimer</span>
              <span>•</span>
              <span style={{ color: '#fbbf24' }}>Visitors: 14,892,104</span>
            </div>
          </div>
        </div>
      </footer>

      {/* FDR Details Modal */}
      {selectedFdrForModal && (
        <FdrDetailsModal 
          fdr={selectedFdrForModal}
          onClose={() => setSelectedFdrForModal(null)}
          onOpenAccreditationAudit={(fdr) => {
            setSelectedFdrForModal(null);
            setSelectedFdrForAccreditation(fdr || selectedFdrForModal);
          }}
        />
      )}

      {/* Official AICTE EVC Placard Modal */}
      {selectedFdrForPlacard && (
        <EvcPlacardModal 
          fdr={selectedFdrForPlacard}
          onClose={() => setSelectedFdrForPlacard(null)}
          onOpenInspector={(fdr) => {
            setEvcInspectorTarget(fdr || null);
            setShowEvcInspector(true);
          }}
        />
      )}

      {/* AICTE EVC On-Site Mobile Inspection Terminal */}
      {showEvcInspector && (
        <EvcInspectorModal 
          preselectedFdr={evcInspectorTarget}
          onClose={() => {
            setShowEvcInspector(false);
            setEvcInspectorTarget(null);
          }}
          onRefresh={refreshData}
        />
      )}

      {/* AICTE EVC Field Inspection Dossier & Audit Report (Desk Review) */}
      {selectedFdrForDossier && (
        <EvcDossierModal 
          fdr={selectedFdrForDossier}
          onClose={() => setSelectedFdrForDossier(null)}
        />
      )}

      {/* Pan-India NeSL Collateral & Multi-Lien Radar Modal */}
      {selectedFdrForRadar && (
        <MultiLienRadarModal 
          fdr={selectedFdrForRadar}
          onClose={() => setSelectedFdrForRadar(null)}
          onRefresh={refreshData}
        />
      )}

      {/* AICTE SWASTIK: Defunct Institutional Asset Repatriation & Scholarship Corpus Modal */}
      {showDormantModal && (
        <DormantRecoveryModal 
          onClose={() => setShowDormantModal(false)}
          onRefresh={refreshData}
        />
      )}

      {/* NBA & NAAC Accreditation / Statutory Deposit Concession Cross-Validator Modal */}
      {selectedFdrForAccreditation && (
        <AccreditationAuditModal 
          fdr={selectedFdrForAccreditation}
          onClose={() => setSelectedFdrForAccreditation(null)}
          onRefresh={refreshData}
        />
      )}
    </div>
  );
}
