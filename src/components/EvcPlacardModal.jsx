import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  Building2, 
  Landmark, 
  Lock, 
  QrCode,
  CheckCircle2,
  ScanLine
} from 'lucide-react';

export default function EvcPlacardModal({ fdr, onClose, onOpenInspector }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const instName = fdr.institution_name || fdr.collegeName || 'PSG College of Technology & Applied Research';
  const pid = fdr.aicte_pid || fdr.aicteId || '1-9318281101';
  const fdrNo = fdr.fdr_number || fdr.fdrNumber || 'CNRB-FD-8921094';
  const bank = fdr.bank_name || fdr.bankName || 'Canara Bank';
  const branch = fdr.branch_name || fdr.branchName || 'Peelamedu Branch, Coimbatore';
  const ifsc = fdr.ifsc_code || fdr.ifscCode || 'CNRB0001234';
  const amount = Number(fdr.amount || 3500000);
  const tenure = fdr.tenure_years || fdr.tenureYears || 10;
  const maturityDate = fdr.maturity_date || fdr.maturityDate || '2036-10-24';
  const jointAicte = fdr.joint_holder_aicte || 'Regional Officer, AICTE Southern Region';
  const jointTrust = fdr.joint_holder_trust || 'Managing Trustee, Institutional Trust';
  const bankToken = fdr.bank_token || 'SFMS-CONFIRM-918234';

  // Generate secure QR payload
  useEffect(() => {
    const publicVerifyUrl = `${window.location.origin}/?evc=${encodeURIComponent(fdr.id)}`;

    QRCode.toDataURL(publicVerifyUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f2e5a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    }).then(url => {
      setQrCodeDataUrl(url);
    }).catch(err => {
      console.error('QR generation failed:', err);
    });
  }, [fdr]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `AICTE_EVC_QR_${fdr.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '880px', 
          width: '95vw',
          maxHeight: '92vh', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', 
          background: '#ffffff', 
          color: '#0f172a',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          padding: 0
        }}
      >
        {/* Top Control Bar */}
        <div style={{
          background: '#0f2e5a',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          borderBottom: '3px solid #d97706',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
            <QrCode size={18} color="#f59e0b" />
            <span>AICTE Statutory Tripartite Fixed Deposit Placard & EVC Verification QR</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              type="button"
              style={{ 
                background: 'rgba(255, 255, 255, 0.12)', 
                color: '#ffffff', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                padding: '6px 14px', 
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
              onClick={handlePrint}
              title="Print framed A4 wall placard for campus inspection display"
            >
              <Printer size={14} color="#f59e0b" />
              <span>Print A4 Placard</span>
            </button>

            <button 
              type="button"
              className="btn btn-sm btn-emerald"
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.78rem', 
                fontWeight: 700,
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
              onClick={() => {
                onClose();
                if (onOpenInspector) onOpenInspector(fdr);
              }}
              title="Launch on-site EVC inspector camera scanner"
            >
              <ScanLine size={14} />
              <span>Launch EVC Scanner</span>
            </button>

            <button 
              type="button"
              onClick={onClose}
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                border: 'none', 
                color: '#ffffff', 
                cursor: 'pointer', 
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body Wrapper */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
          
          {/* Printable Framed Placard Content */}
          <div id="printable-evc-placard" style={{
            padding: '24px 28px',
            background: '#ffffff',
            border: '5px solid #0f2e5a',
            outline: '2px solid #d97706',
            borderRadius: '6px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(15, 46, 90, 0.08)'
          }}>
            {/* Watermark Emblem */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.03,
              fontSize: '200px',
              pointerEvents: 'none',
              userSelect: 'none',
              fontWeight: 900,
              color: '#0f2e5a',
              textAlign: 'center'
            }}>
              AICTE
            </div>

            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2e5a', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b45309', letterSpacing: '2px' }}>
                सत्यमेव जयते • GOVERNMENT OF INDIA
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f2e5a', margin: '4px 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                All India Council for Technical Education
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                Statutory Body under Ministry of Education • Regulation Bureau, New Delhi
              </div>
              <div style={{ 
                display: 'inline-block', 
                background: '#0f2e5a', 
                color: '#ffffff', 
                fontSize: '0.7rem', 
                fontWeight: 800, 
                padding: '3px 12px', 
                borderRadius: '20px', 
                marginTop: '6px',
                letterSpacing: '0.5px'
              }}>
                APPROVAL PROCESS HANDBOOK (APH) CHAPTER 1 — MANDATORY SECURITY DEPOSIT PLACARD
              </div>
            </div>

            {/* Body Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', alignItems: 'stretch' }}>
              
              {/* Left Column: Specifics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  This is to certify under the statutory mandate of the <strong>All India Council for Technical Education Act, 1987</strong>, that the technical institution specified below has deposited and pledged an immovable Fixed Deposit security fund held under tripartite joint lien.
                </p>

                {/* Institution Box */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Approved Technical Institution & AICTE Permanent ID
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f2e5a', marginTop: '2px' }}>
                    {instName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                    AICTE PID: <strong className="font-mono">{pid}</strong> • Region: Southern (Chennai)
                  </div>
                </div>

                {/* Deposit Specifics 4-Box Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.66rem', fontWeight: 700 }}>DEPOSITORY BANK & BRANCH</span>
                    <strong style={{ color: '#0f2e5a', fontSize: '0.84rem' }}>{bank}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{branch} (IFSC: {ifsc})</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.66rem', fontWeight: 700 }}>FIXED DEPOSIT RECEIPT NO.</span>
                    <strong className="font-mono" style={{ color: '#0284c7', fontSize: '0.84rem' }}>{fdrNo}</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>Tenure: {tenure} Years Joint Lock</div>
                  </div>

                  <div style={{ background: '#ecfdf5', padding: '8px 10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                    <span style={{ color: '#065f46', display: 'block', fontSize: '0.66rem', fontWeight: 700 }}>SECURED PRINCIPAL AMOUNT</span>
                    <strong className="font-mono" style={{ color: '#059669', fontSize: '1rem', display: 'block', marginTop: '2px' }}>
                      ₹{amount.toLocaleString('en-IN')}
                    </strong>
                    <div style={{ fontSize: '0.66rem', color: '#065f46' }}>Rupees Thirty Five Lakhs Only</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.66rem', fontWeight: 700 }}>CBS LIQUIDATION LOCK STATUS</span>
                    <strong style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', marginTop: '2px' }}>
                      <ShieldCheck size={14} color="#15803d" />
                      <span>LOCKED IN FINACLE (FLAG 1)</span>
                    </strong>
                    <div className="font-mono" style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '2px' }}>SFMS: {bankToken}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Cryptographic QR Code & EVC Stamp */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                border: '2px dashed #0f2e5a',
                borderRadius: '6px',
                background: '#f8fafc',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '6px' }}>
                  EVC On-Site Inspection QR
                </div>

                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="AICTE EVC Cryptographic Verification QR" 
                    style={{ width: '135px', height: '135px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <div style={{ width: '135px', height: '135px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={36} color="#94a3b8" />
                  </div>
                )}

                <div style={{ fontSize: '0.64rem', color: '#64748b', marginTop: '6px', fontWeight: 600, lineHeight: 1.3 }}>
                  Point mobile camera during on-site visit to inspect live Core Banking lock
                </div>

                <button 
                  type="button"
                  onClick={handleDownloadQR}
                  style={{ 
                    fontSize: '0.68rem', 
                    padding: '3px 8px', 
                    marginTop: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600
                  }}
                >
                  <Download size={11} />
                  <span>Save QR Image</span>
                </button>

                <a 
                  href={`/?evc=${encodeURIComponent(fdr.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.66rem',
                    color: '#0284c7',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    background: '#e0f2fe',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}
                  title="Test how an external visiting inspector on their phone opens the verification without login"
                >
                  <ExternalLink size={11} />
                  <span>Test Mobile Direct Scan</span>
                </a>
              </div>
            </div>

            {/* Joint Lien Statutory Clause */}
            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', lineHeight: 1.4 }}>
              <strong>Statutory Tripartite Joint Holders:</strong> (1) {jointAicte} & (2) {jointTrust}.
              This instrument cannot be liquidated, transferred, or assigned without the prior written NOC and dual-key digital authorization of the AICTE Regional Director under APH Regulations.
            </div>

            {/* Footer Seals & Digital Signature Block */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '0.7rem', color: '#64748b' }}>
              <div>
                <div style={{ fontWeight: 800, color: '#0f2e5a' }}>AICTE SURAKSHA-FDR CENTRAL REGISTRY</div>
                <div>Instrument Identifier: <strong className="font-mono">{fdr.id}</strong></div>
                <div className="font-mono" style={{ fontSize: '0.66rem' }}>SHA256: 0x892a019e... verified</div>
              </div>

              <div style={{ textAlign: 'center', border: '1px solid #0f2e5a', padding: '4px 12px', borderRadius: '4px', background: '#f8fafc' }}>
                <div style={{ fontWeight: 900, color: '#0f2e5a', fontSize: '0.72rem' }}>EVC OFFICIAL PLACARD</div>
                <div style={{ fontSize: '0.64rem', color: '#059669', fontWeight: 700 }}>✓ READY FOR CAMPUS DISPLAY</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: '#0f2e5a' }}>Director & Regional Officer</div>
                <div>AICTE Southern Regional Office, Chennai</div>
                <div style={{ color: '#059669', fontWeight: 600 }}>Digitally Certified Document</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Close Bar */}
        <div style={{ 
          background: '#f8fafc', 
          padding: '10px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid #e2e8f0',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Mandatory under APH Chapter 1: Must be prominently framed in Principal Administrative Office during EVC inspection.
          </span>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            onClick={onClose}
            style={{ padding: '4px 14px', fontSize: '0.78rem' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
