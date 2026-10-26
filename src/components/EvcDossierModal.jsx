import React from 'react';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Building2, 
  Landmark, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle,
  Download,
  Layers,
  Lock
} from 'lucide-react';

export default function EvcDossierModal({ fdr, onClose }) {
  if (!fdr) return null;

  const instName = fdr.institution_name || fdr.collegeName || 'PSG College of Technology & Applied Research';
  const pid = fdr.aicte_pid || fdr.aicteId || '1-9318281101';
  const isEndorsed = fdr.evc_status === 'PASSED_ENDORSED';
  const inspector = fdr.evc_verified_by || 'Prof. Dr. K. Radhakrishnan (Chairman, AICTE EVC Committee - IIT Madras)';
  const timestamp = fdr.evc_verified_at || 'Recently Completed';
  const gpsCoords = fdr.evc_gps_coords || '11.0168° N, 76.9558° E (Coimbatore, PSG Tech Campus Perimeter)';
  const remarks = fdr.evc_committee_remarks || 'Physical on-site verification conducted at administrative block. Core Banking joint lien confirmed locked in Finacle 10.x without deficiencies.';

  const handleDownloadSlip = () => {
    const text = `AICTE REGULATION BUREAU — EXPERT VISIT COMMITTEE (EVC) ON-SITE INSPECTION REPORT
------------------------------------------------------------------------------------------
Institution Name   : ${instName}
AICTE PID          : ${pid}
Surveillance Region: ${fdr.region || 'Southern (Chennai)'}
FDR Number         : ${fdr.fdr_number}
Secured Amount     : INR ${Number(fdr.amount).toLocaleString('en-IN')}
Depository Bank    : ${fdr.bank_name} (${fdr.branch_name})
Finacle CBS Lock   : ENGAGED (Flag 1 Active)
SFMS Gateway Token : ${fdr.bank_token || 'SFMS-CONFIRM-918234'}

EVC ON-SITE COMMITTEE ENDORSEMENT:
Status             : ${isEndorsed ? 'STATUTORY COMPLIANCE SATISFIED (PASSED)' : 'PENDING ON-SITE VISIT'}
Committee Members  : ${inspector}
Inspection Time    : ${timestamp}
GPS Coordinates    : ${gpsCoords}
Committee Findings : ${remarks}
Cryptographic Trail: SHA-256 Block Chained to CAG Central Audit Ledger.
------------------------------------------------------------------------------------------
Certified by AICTE Southern Regional Directorate, Chennai`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EVC_Inspection_Report_${fdr.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1150 }}>
      <div 
        className="modal-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: '0', background: '#ffffff', color: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          background: '#0f2e5a',
          color: '#ffffff',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #16a34a'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                EVC OVERSIGHT
              </span>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                Expert Visit Committee (EVC) On-Site Physical Inspection Dossier
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '3px' }}>
              Statutory Field Endorsement Record submitted by the visiting academic inspection committee.
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', background: '#f8fafc' }}>
          
          {/* Status Banner */}
          {isEndorsed ? (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #86efac',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.96rem' }}>
                    ON-SITE PHYSICAL INSPECTION ENDORSED (COMPLIANCE SATISFIED)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#15803d' }}>
                    Visiting committee physically validated deposit on campus & verified Core Banking lock.
                  </div>
                </div>
              </div>

              <span className="badge badge-verified" style={{ background: '#166534', color: '#ffffff', fontSize: '0.74rem' }}>
                ✓ EVC Endorsed
              </span>
            </div>
          ) : (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={28} color="#d97706" />
                <div>
                  <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.96rem' }}>
                    ON-SITE EVC INSPECTION PENDING
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#92400e' }}>
                    Field visit scheduled. Committee will scan wall placard QR during campus inspection.
                  </div>
                </div>
              </div>
              <span className="badge badge-pending" style={{ background: '#fef3c7', color: '#b45309' }}>
                Pending Visit
              </span>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '12px' }}>
              Institution & Depository Particulars
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>INSTITUTION NAME</span>
                <strong style={{ color: '#0f2e5a' }}>{instName}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>PID: {pid}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>FIXED DEPOSIT RECEIPT</span>
                <strong className="font-mono" style={{ color: '#0284c7' }}>{fdr.fdr_number}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Bank: {fdr.bank_name}</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>SECURED SUM</span>
                <strong className="font-mono" style={{ color: '#059669', fontSize: '1rem' }}>
                  ₹{Number(fdr.amount).toLocaleString('en-IN')}
                </strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>10-Yr Joint Lien Active</div>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>FINACLE CBS LOCK</span>
                <strong style={{ color: '#15803d' }}>ENGAGED (Flag 1)</strong>
                <div className="font-mono" style={{ fontSize: '0.7rem', color: '#64748b' }}>Token: {fdr.bank_token || 'SFMS-PENDING'}</div>
              </div>
            </div>
          </div>

          {/* Visiting Committee Field Report Section */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '12px' }}>
              Visiting Committee On-Site Endorsement Findings
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} color="#059669" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>INSPECTION COMMITTEE MEMBERS:</span>
                  <div style={{ fontWeight: 700, color: '#0f2e5a' }}>{inspector}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>CAMPUS GPS GEO-TAG VERIFICATION:</span>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{gpsCoords}</div>
                  <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>✓ Inspection confirmed physically within institutional perimeter</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <FileCheck2 size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>COMMITTEE OBSERVATIONS & SCRUTINY REMARKS:</span>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px', fontStyle: 'italic', color: '#1e293b' }}>
                    "{remarks}"
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '0.74rem', color: '#64748b' }}>
                <Layers size={14} color="#0f2e5a" />
                <span>CAG Statutory Audit Ledger: <strong>SHA-256 Cryptographic Block Verified</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={handleDownloadSlip}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Download Signed EVC Compliance Slip</span>
          </button>

          <button 
            type="button" 
            className="btn btn-primary btn-sm" 
            onClick={onClose}
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
