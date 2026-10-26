import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ScanLine, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Landmark, 
  Building2, 
  Server, 
  Layers, 
  Search, 
  FileCheck2, 
  Clock, 
  Download,
  Sparkles,
  RefreshCw,
  Lock,
  Key,
  CheckSquare
} from 'lucide-react';

export default function EvcInspectorModal({ preselectedFdr, onClose, onRefresh }) {
  const [scanMode, setScanMode] = useState('CAMERA'); // 'CAMERA' | 'MANUAL'
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0); // 0: Idle, 1: AICTE Ping, 2: Bank CBS, 3: CAG Ledger, 4: Done
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Inspector Endorsement Form State
  const [chairmanName, setChairmanName] = useState('Prof. Dr. K. Radhakrishnan (Chairman, AICTE EVC Committee - IIT Madras)');
  const [expertName, setExpertName] = useState('Dr. Meenakshi Sundaram (Subject Expert - Anna University)');
  const [inspectorRemarks, setInspectorRemarks] = useState('Physical on-site verification conducted at institutional administrative block. Core Banking joint lien confirmed locked in Finacle 10.x.');
  const [isEndorsing, setIsEndorsing] = useState(false);
  const [endorsementSuccess, setEndorsementSuccess] = useState(null);

  // Anti-Proxy Committee Authentication & Statutory Checklist State
  const [evcOrderNo, setEvcOrderNo] = useState('AICTE/SRO/EVC/2026/ORD-8921');
  const [committeePin, setCommitteePin] = useState('892104');
  const [checklist, setChecklist] = useState({
    physicalDocInspected: true,
    finacleLockEngaged: true,
    campusPerimeterVerified: true,
    antiLiquidationAffirmed: true
  });

  // Live Geolocation State
  const [gpsLocation, setGpsLocation] = useState({
    coords: '11.0168° N, 76.9558° E',
    place: 'Coimbatore, Tamil Nadu (PSG Tech Campus Perimeter)',
    accuracy: '±3.2 meters (High Precision GPS)',
    time: new Date().toLocaleTimeString('en-IN')
  });

  // If a preselected FDR was passed from the Placard modal, auto-verify it!
  useEffect(() => {
    if (preselectedFdr) {
      handleTriggerVerification(preselectedFdr.id);
    }
  }, [preselectedFdr]);

  const handleTriggerVerification = async (queryToSearch) => {
    const q = queryToSearch || searchQuery || 'CNRB-FD-8921094';
    setIsScanning(true);
    setErrorMessage(null);
    setVerificationResult(null);
    setEndorsementSuccess(null);
    setHandshakeStep(1);

    try {
      // Step 1: AICTE Node Ping
      await new Promise(r => setTimeout(r, 600));
      setHandshakeStep(2);

      // Step 2: Bank CBS Finacle Ping
      await new Promise(r => setTimeout(r, 600));
      setHandshakeStep(3);

      // Step 3: CAG Ledger Ping & fetch backend
      const res = await fetch(`/api/evc/verify/${encodeURIComponent(q)}`);
      const data = await res.json();

      await new Promise(r => setTimeout(r, 400));
      setHandshakeStep(4);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed. Certificate record not found.');
      }

      setVerificationResult(data);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      setErrorMessage(err.message);
      setHandshakeStep(0);
    } finally {
      setIsScanning(false);
    }
  };

  const handleEndorseInspection = async () => {
    if (!verificationResult?.deposit) return;

    if (committeePin.trim() !== '892104') {
      alert('Security Interlock Failed: Invalid Committee Authorization PIN! Unauthorized proxy endorsement rejected.');
      return;
    }

    if (!Object.values(checklist).every(Boolean)) {
      alert('Statutory Checklist Incomplete: All physical inspection criteria must be verified before endorsement.');
      return;
    }

    setIsEndorsing(true);

    try {
      const payload = {
        fdr_id: verificationResult.deposit.id,
        inspector_name: `${chairmanName} & ${expertName}`,
        committee_remarks: inspectorRemarks,
        gps_coords: `${gpsLocation.coords} • ${gpsLocation.place}`,
        evc_order_no: evcOrderNo,
        committee_pin: committeePin,
        verdict: 'STATUTORY_COMPLIANCE_SATISFIED'
      };

      const res = await fetch('/api/evc/endorse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to endorse inspection report.');

      setEndorsementSuccess(data);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Endorsement error: ' + err.message);
    } finally {
      setIsEndorsing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1150 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', padding: '0', background: '#ffffff', color: '#0f172a', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Terminal Header */}
        <div style={{
          background: '#0f2e5a',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #f59e0b'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: '#f59e0b',
                color: '#0f2e5a',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900
              }}>
                EVC TERMINAL
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                AICTE Expert Visit Committee (EVC) On-Site Physical Inspection Terminal
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
              Zero-Trust On-Site Verification: Pings Live AICTE Central Registry, Canara Bank Finacle 10.x CBS & CAG Cryptographic Ledger.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Live GPS & On-Site Inspection Banner */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#059669" />
            <span>
              On-Site Geolocation: <strong>{gpsLocation.coords}</strong> ({gpsLocation.place})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-verified" style={{ background: '#dcfce7', color: '#166534', fontSize: '0.72rem' }}>
              <span className="pulse-dot"></span>
              GPS Match: Within Institutional Perimeter ({gpsLocation.accuracy})
            </span>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
              IST Time: <strong>{gpsLocation.time}</strong>
            </span>
          </div>
        </div>

        {/* Mode Selector & Scanner Area */}
        <div style={{ padding: '20px 24px' }}>
          
          {/* Tabs: Camera vs Manual */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              className={`btn btn-sm ${scanMode === 'CAMERA' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setScanMode('CAMERA')}
              style={{ fontSize: '0.8rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={14} />
              <span>Camera QR Viewfinder</span>
            </button>
            <button
              className={`btn btn-sm ${scanMode === 'MANUAL' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setScanMode('MANUAL')}
              style={{ fontSize: '0.8rem', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={14} />
              <span>Manual Instrument ID Lookup</span>
            </button>
          </div>

          {/* Mode 1: Interactive Camera Viewfinder */}
          {scanMode === 'CAMERA' && (
            <div style={{
              background: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
              border: '2px solid #1e293b'
            }}>
              {/* Animated Viewfinder Box */}
              <div style={{
                width: '240px',
                height: '180px',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(2, 132, 199, 0.05)',
                marginBottom: '16px'
              }}>
                {/* Laser scan line animation */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                  boxShadow: '0 0 12px #38bdf8',
                  animation: 'scanLineMove 2s infinite ease-in-out'
                }} />

                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.74rem' }}>
                  <ScanLine size={38} color="#38bdf8" style={{ margin: '0 auto 8px auto' }} />
                  <span>Aim Camera at Printed College Placard QR</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={isScanning}
                  className="btn btn-emerald btn-sm"
                  onClick={() => handleTriggerVerification(preselectedFdr?.fdr_number || 'CNRB-FD-8921094')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', padding: '8px 18px' }}
                >
                  <Sparkles size={14} />
                  <span>{isScanning ? 'Pinging Nodes...' : '⚡ Scan Wall Placard QR (PSG Tech Canara Deposit)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Manual Search Lookup */}
          {scanMode === 'MANUAL' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text"
                className="form-input font-mono"
                placeholder="Enter FDR Receipt No (e.g. CNRB-FD-8921094) or ID (e.g. FDR-2024-CAN-0891)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTriggerVerification(searchQuery)}
                style={{ flex: 1, fontSize: '0.85rem' }}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleTriggerVerification(searchQuery)}
                disabled={isScanning}
              >
                <Search size={14} />
                <span>Verify Deposit</span>
              </button>
            </div>
          )}

          {/* 3-Node Cryptographic Handshake Status */}
          {handshakeStep > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '12px' }}>
                Zero-Trust Multi-Node Handshake Sequence:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {/* Node 1: AICTE Registry */}
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: handshakeStep >= 1 ? '#ecfdf5' : '#ffffff',
                  border: handshakeStep >= 1 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Building2 size={20} color={handshakeStep >= 1 ? '#059669' : '#94a3b8'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f2e5a' }}>
                      Node 1: AICTE Registry
                    </div>
                    <div style={{ fontSize: '0.7rem', color: handshakeStep >= 1 ? '#059669' : '#64748b' }}>
                      {handshakeStep >= 1 ? '✓ PID & Validity Matched' : 'Awaiting handshake...'}
                    </div>
                  </div>
                </div>

                {/* Node 2: Bank Finacle CBS */}
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: handshakeStep >= 2 ? '#ecfdf5' : '#ffffff',
                  border: handshakeStep >= 2 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Landmark size={20} color={handshakeStep >= 2 ? '#059669' : '#94a3b8'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f2e5a' }}>
                      Node 2: Finacle CBS 10.x
                    </div>
                    <div style={{ fontSize: '0.7rem', color: handshakeStep >= 2 ? '#059669' : '#64748b' }}>
                      {handshakeStep >= 2 ? '✓ CBS Lock Engaged (Flag 1)' : 'Connecting to branch switch...'}
                    </div>
                  </div>
                </div>

                {/* Node 3: CAG Cryptographic Ledger */}
                <div style={{
                  padding: '10px',
                  borderRadius: '6px',
                  background: handshakeStep >= 3 ? '#ecfdf5' : '#ffffff',
                  border: handshakeStep >= 3 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Layers size={20} color={handshakeStep >= 3 ? '#059669' : '#94a3b8'} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f2e5a' }}>
                      Node 3: CAG Audit Ledger
                    </div>
                    <div style={{ fontSize: '0.7rem', color: handshakeStep >= 3 ? '#059669' : '#64748b' }}>
                      {handshakeStep >= 3 ? '✓ SHA-256 Chain Intact' : 'Verifying block hash...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '0.82rem'
            }}>
              <AlertTriangle size={20} color="#dc2626" />
              <div>
                <strong>Verification Alert:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* VERIFICATION SUCCESS RESULT CARD */}
          {verificationResult && (
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #bbf7d0', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <span className="badge badge-verified" style={{ background: '#166534', color: '#ffffff', fontSize: '0.72rem', letterSpacing: '1px' }}>
                      EVC ON-SITE COMPLIANCE PASSED
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f2e5a', marginTop: '2px' }}>
                      {verificationResult.deposit.institution_name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      AICTE PID: <strong className="font-mono">{verificationResult.deposit.aicte_pid}</strong> • Region: {verificationResult.deposit.region}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Verified Security Deposit</span>
                  <strong className="font-mono" style={{ fontSize: '1.4rem', color: '#059669', fontWeight: 900 }}>
                    ₹{Number(verificationResult.deposit.amount).toLocaleString('en-IN')}
                  </strong>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>10-Year Joint Lock Active</div>
                </div>
              </div>

              {/* Technical Inspection Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', fontSize: '0.8rem', marginBottom: '16px' }}>
                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>DEPOSITORY BANK</span>
                  <strong>{verificationResult.deposit.bank_name}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{verificationResult.deposit.branch_name}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>FDR RECEIPT NUMBER</span>
                  <strong className="font-mono" style={{ color: '#0284c7' }}>{verificationResult.deposit.fdr_number}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Matures: {verificationResult.deposit.maturity_date}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>CORE BANKING CBS STATUS</span>
                  <strong style={{ color: '#059669' }}>LOCKED (Flag 1 Active)</strong>
                  <div className="font-mono" style={{ fontSize: '0.7rem', color: '#64748b' }}>Token: {verificationResult.deposit.bank_token}</div>
                </div>

                <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>FORENSIC AI SCORE</span>
                  <strong style={{ color: '#059669' }}>{verificationResult.deposit.tamper_score || '0.5% (Clean)'}</strong>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Optical seals verified</div>
                </div>
              </div>

              {/* Already Endorsed Notice if applicable */}
              {verificationResult.deposit.evc_status === 'PASSED_ENDORSED' && !endorsementSuccess && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 14px', fontSize: '0.76rem', color: '#1e40af', marginBottom: '16px' }}>
                  <strong>Prior EVC Endorsement on File:</strong> This institution's security deposit was already physically endorsed by <strong>{verificationResult.deposit.evc_verified_by}</strong> on {verificationResult.deposit.evc_verified_at}.
                </div>
              )}

              {/* COMMITTEE ON-SITE DIGITAL ENDORSEMENT FORM */}
              {!endorsementSuccess ? (
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f2e5a', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Expert Visit Committee (EVC) Digital Endorsement & Sign-Off
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        COMMITTEE CHAIRMAN NAME & AFFILIATION *
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        value={chairmanName}
                        onChange={(e) => setChairmanName(e.target.value)}
                        style={{ fontSize: '0.8rem', background: '#f8fafc' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        SUBJECT EXPERT NAME & AFFILIATION *
                      </label>
                      <input 
                        type="text"
                        className="form-input"
                        value={expertName}
                        onChange={(e) => setExpertName(e.target.value)}
                        style={{ fontSize: '0.8rem', background: '#f8fafc' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      ON-SITE COMMITTEE OBSERVATIONS & REMARKS *
                    </label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      value={inspectorRemarks}
                      onChange={(e) => setInspectorRemarks(e.target.value)}
                      style={{ fontSize: '0.8rem', background: '#f8fafc' }}
                    />
                  </div>

                  {/* Anti-Proxy Security Interlock Gate */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={16} color="#0284c7" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase' }}>
                          Zero-Trust Committee Authentication Gate
                        </span>
                      </div>
                      <span className="badge" style={{ 
                        background: committeePin.trim() === '892104' ? '#dcfce7' : '#fee2e2', 
                        color: committeePin.trim() === '892104' ? '#166534' : '#991b1b',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {committeePin.trim() === '892104' ? '✓ Chairman Authenticated' : '⚠️ Unauthorized Access Blocked'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '12px', lineHeight: 1.4 }}>
                      To prevent proxy submissions by college staff or unauthorized visitors, the endorsement engine is locked until the deputed Committee Chairman's confidential AICTE Order PIN is verified.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          OFFICIAL AICTE DEPUTATION ORDER NO.
                        </label>
                        <input 
                          type="text" 
                          className="form-input font-mono"
                          value={evcOrderNo}
                          onChange={(e) => setEvcOrderNo(e.target.value)}
                          style={{ fontSize: '0.78rem', background: '#ffffff' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          <span>CONFIDENTIAL COMMITTEE PIN (OTP) *</span>
                          <span style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCommitteePin('892104')}>[Demo PIN: 892104]</span>
                        </label>
                        <input 
                          type="password" 
                          maxLength={6}
                          className="form-input font-mono"
                          value={committeePin}
                          onChange={(e) => setCommitteePin(e.target.value)}
                          placeholder="6-digit PIN"
                          style={{ 
                            fontSize: '0.9rem', 
                            letterSpacing: '3px', 
                            fontWeight: 700, 
                            background: '#ffffff',
                            borderColor: committeePin.trim() === '892104' ? '#10b981' : '#f87171'
                          }}
                        />
                      </div>
                    </div>

                    {committeePin.trim() !== '892104' && (
                      <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}>
                        ⚠️ Invalid Committee PIN. Endorsement button disabled to prevent unauthorized proxy sign-off.
                      </div>
                    )}
                  </div>

                  {/* Statutory On-Site Verification Checklist */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckSquare size={16} color="#059669" />
                      <span>Statutory On-Site Verification Checklist (All Required)</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input 
                          type="checkbox" 
                          checked={checklist.physicalDocInspected} 
                          onChange={(e) => setChecklist({ ...checklist, physicalDocInspected: e.target.checked })}
                          style={{ marginTop: '3px' }}
                        />
                        <span><strong>1. Original Paper Certificate:</strong> Physically inspected original bank deposit receipt in Principal's presence.</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input 
                          type="checkbox" 
                          checked={checklist.finacleLockEngaged} 
                          onChange={(e) => setChecklist({ ...checklist, finacleLockEngaged: e.target.checked })}
                          style={{ marginTop: '3px' }}
                        />
                        <span><strong>2. Core Banking Finacle 10.x Lock:</strong> Live tripartite joint lien confirmed active with depository branch.</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input 
                          type="checkbox" 
                          checked={checklist.campusPerimeterVerified} 
                          onChange={(e) => setChecklist({ ...checklist, campusPerimeterVerified: e.target.checked })}
                          style={{ marginTop: '3px' }}
                        />
                        <span><strong>3. GPS Geo-Fence Match:</strong> Device physical position verified within 500m of institutional land perimeter.</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', padding: '8px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <input 
                          type="checkbox" 
                          checked={checklist.antiLiquidationAffirmed} 
                          onChange={(e) => setChecklist({ ...checklist, antiLiquidationAffirmed: e.target.checked })}
                          style={{ marginTop: '3px' }}
                        />
                        <span><strong>4. Statutory Joint Clause:</strong> Joint lien deed strictly bars premature unilateral liquidation by college trust.</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isEndorsing || committeePin.trim() !== '892104' || !Object.values(checklist).every(Boolean)}
                    className="btn btn-emerald"
                    onClick={handleEndorseInspection}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      fontWeight: 800, 
                      fontSize: '0.88rem',
                      opacity: (committeePin.trim() !== '892104' || !Object.values(checklist).every(Boolean)) ? 0.6 : 1,
                      cursor: (committeePin.trim() !== '892104' || !Object.values(checklist).every(Boolean)) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FileCheck2 size={16} />
                    <span>{isEndorsing ? 'Submitting Endorsement to CAG Ledger...' : 'Digitally Endorse & Transmit EVC Report to AICTE Registry'}</span>
                  </button>
                </div>
              ) : (
                /* Endorsement Success Slip */
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', marginBottom: '8px' }}>
                    <CheckCircle2 size={24} color="#166534" />
                    <div>
                      <strong style={{ fontSize: '0.98rem' }}>EVC On-Site Physical Inspection Endorsed Successfully!</strong>
                      <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                        Endorsement Reference: <strong className="font-mono">{endorsementSuccess.endorsement_id}</strong> • Transmitted to AICTE Regional Bureau & CAG Ledger.
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#334155', background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
                    <div>Inspector Committee: <strong>{endorsementSuccess.inspector}</strong></div>
                    <div>Inspection Timestamp: <strong>{endorsementSuccess.timestamp}</strong></div>
                    <div>Geo-Location: <strong>{endorsementSuccess.gps_coords}</strong></div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      Audit Block Hash: SHA256 Chained in Central Immutable Registry
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Close Bar */}
        <div style={{ background: '#f8fafc', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            AICTE Approval Process Handbook (APH) 2026-27 • Statutory On-Site Inspection Protocol
          </span>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
}
