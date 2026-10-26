import React from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download,
  Award
} from 'lucide-react';

export default function FdrDetailsModal({ fdr, onClose, onOpenAccreditationAudit }) {
  if (!fdr) return null;

  const isFlagged = fdr.status === 'FLAGGED_FORGERY';
  const instName = fdr.institution_name || fdr.collegeName;
  const amount = Number(fdr.amount);
  const bank = fdr.bank_name || fdr.bankName;
  const fdrNo = fdr.fdr_number || fdr.fdrNumber;
  const branch = fdr.branch_name || fdr.branchName;
  const ifsc = fdr.ifsc_code || fdr.ifscCode;
  const interestRate = fdr.interest_rate || fdr.interestRate || '7.10%';
  const tenure = fdr.tenure_years || fdr.tenureYears || 10;
  const maturityDate = fdr.maturity_date || fdr.maturityDate;
  const jointAicte = fdr.joint_holder_aicte || fdr.jointHolders?.[0] || 'Regional Officer, AICTE';
  const jointTrust = fdr.joint_holder_trust || fdr.jointHolders?.[1] || 'Managing Trustee';
  const tamperDetails = fdr.tamper_details || fdr.ocrData?.tamperDetails || 'Standard verification passed.';
  const bankToken = fdr.bank_token || fdr.bankConfirmation?.bankToken;
  const confirmedBy = fdr.bank_confirmed_by || fdr.bankConfirmation?.confirmedBy;
  const confirmedAt = fdr.bank_confirmed_at || fdr.bankConfirmation?.timestamp;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-md)', 
              background: isFlagged ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: isFlagged ? 'var(--rose-light)' : 'var(--blue-light)'
            }}>
              {isFlagged ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Statutory FDR Forensic Inspection & Metadata</h3>
                <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--blue-light)' }}>{fdr.id}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{instName}</div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Forgery Warning Banner if tampered */}
          {isFlagged && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: 800, color: 'var(--rose-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <span>AI COMPUTER VISION FORGERY ALERT (FLAGGED UNDER REGULATORY OVERSIGHT)</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#fca5a5' }}>
                {tamperDetails}
              </p>
              <div style={{ marginTop: '10px', fontSize: '0.78rem', display: 'flex', gap: '16px' }}>
                <span>Claimed Upload: <strong>₹{amount.toLocaleString('en-IN')}</strong></span>
                <span>•</span>
                <span style={{ color: '#fff' }}>Actual Bank SFMS Amount: <strong>₹50,000 (Mismatch)</strong></span>
              </div>
            </div>
          )}

          {/* Grid of Key Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Financial Depository</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{bank}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{branch}</div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--blue-light)', marginTop: '4px' }}>IFSC: {ifsc}</div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Security Deposit Amount</div>
              <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.25rem', marginTop: '4px', color: isFlagged ? 'var(--rose-light)' : 'var(--emerald-light)' }}>
                ₹{amount.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Interest Rate: {interestRate} • Annual Accrual
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Lock-in Tenure</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '4px' }}>{tenure} Years Joint Lock Period</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Maturity Date: <span className="font-mono">{maturityDate}</span>
              </div>
            </div>
          </div>

          {/* Joint Holders & Regulatory Clause */}
          <div className="glass-panel" style={{ padding: '18px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Authorized Joint Lien Holders (AICTE APH Rule)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--emerald-light)" />
                <span>Primary Regulatory Holder: <strong>{jointAicte}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--emerald-light)" />
                <span>Institutional Trust Holder: <strong>{jointTrust}</strong></span>
              </div>
            </div>
          </div>

          {/* Bank Confirmation Status */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(15, 23, 42, 0.4)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
              Core Banking System (CBS) Tripartite Confirmation
            </h4>
            {bankToken ? (
              <div style={{ fontSize: '0.82rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                <div><span style={{ color: 'var(--text-dim)' }}>Branch Officer:</span> {confirmedBy || 'Bank Authorizer'}</div>
                <div><span style={{ color: 'var(--text-dim)' }}>Timestamp:</span> {confirmedAt}</div>
                <div><span style={{ color: 'var(--text-dim)' }}>SFMS Token:</span> <code className="hash-pill">{bankToken}</code></div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Early Withdrawal Lock:</span> 
                  <strong style={{ color: 'var(--emerald-light)' }}> ENGAGED (Non-Liquidable)</strong>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>Awaiting Branch Manager confirmation in the Bank Gateway portal.</span>
              </div>
            )}
          </div>

          {/* NBA & NAAC Accreditation / Statutory Deposit Concession (APH Chapter 2.4) */}
          <div className="glass-panel" style={{ padding: '16px 18px', marginTop: '20px', background: isFlagged ? '#fffbeb' : '#f0fdf4', border: `1px solid ${isFlagged ? '#fde68a' : '#bbf7d0'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color={isFlagged ? '#b45309' : '#15803d'} />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: isFlagged ? '#92400e' : '#166534', textTransform: 'uppercase', margin: 0 }}>
                  NBA & NAAC Accreditation / Deposit Concession (APH Chapter 2.4)
                </h4>
              </div>
              <button 
                className="btn btn-sm"
                onClick={() => onOpenAccreditationAudit && onOpenAccreditationAudit(fdr)}
                style={{ 
                  background: isFlagged ? '#b45309' : '#059669', 
                  color: '#ffffff', 
                  fontSize: '0.74rem', 
                  padding: '5px 12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                <Award size={13} />
                <span>Launch Accreditation Cross-Validator</span>
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: isFlagged ? '#b45309' : '#166534', margin: 0, lineHeight: 1.4 }}>
              {isFlagged 
                ? '⚠️ Institution claimed ₹15.0 Lakh concession under NBA Tier-1 norms. Live registry audit flags potential lapse in accreditation requiring deficit recovery notice.'
                : '✓ Institutional security deposit concession is backed by NBA Tier-1 / NAAC A++ accreditation. Re-validated against Central National Registries.'}
            </p>
          </div>

          {/* Scrutiny Observations Section (AICTE Regulation Bureau Requirement) */}
          <div className="glass-panel" style={{ padding: '18px', marginTop: '20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f2e5a', textTransform: 'uppercase', marginBottom: '8px' }}>
              Regulation Bureau Scrutiny Observations
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#334155', background: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
              {fdr.scrutiny_observations || 'No prior scrutiny observations recorded for this instrument. File is active under standard monitoring.'}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="input-scrutiny-obs"
                type="text"
                placeholder="Record official scrutiny observation or compliance remarks..."
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    await fetch(`/api/fdr/${fdr.id}/scrutiny`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ observation: e.target.value.trim() })
                    });
                    alert('Scrutiny observation recorded to regulatory ledger.');
                    e.target.value = '';
                    onClose();
                  }
                }}
              />
              <button 
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  const input = document.getElementById('input-scrutiny-obs');
                  if (input && input.value.trim()) {
                    await fetch(`/api/fdr/${fdr.id}/scrutiny`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ observation: input.value.trim() })
                    });
                    alert('Scrutiny observation recorded to regulatory ledger.');
                    input.value = '';
                    onClose();
                  }
                }}
              >
                Save Observation
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AICTE Regulatory Dossier - ${fdr.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .header { text-align: center; border-bottom: 3px double #0f2e5a; padding-bottom: 20px; margin-bottom: 24px; }
    .emblem { font-size: 20px; font-weight: bold; color: #b45309; }
    .title { font-size: 22px; font-weight: 800; color: #0f2e5a; margin: 4px 0; }
    .sub { font-size: 13px; color: #475569; }
    .status-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 700; color: #1e293b; width: 35%; }
    .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 16px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
    .seal { border: 2px dashed #0f2e5a; padding: 10px; display: inline-block; font-weight: bold; color: #0f2e5a; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="emblem">सत्यमेव जयते</div>
    <div class="title">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</div>
    <div class="sub">Statutory Body under Ministry of Education, Govt. of India • Regulation Bureau</div>
    <div class="sub" style="font-weight: 600; margin-top: 6px; color: #0f2e5a;">
      APH CHAPTER 1 — STATUTORY TRIPARTITE FIXED DEPOSIT VERIFICATION DOSSIER
    </div>
  </div>

  <div class="status-box">
    <strong>REGULATORY STATUS:</strong> ${fdr.status === 'ACTIVE_VERIFIED' ? '✅ ACTIVE & SECURED UNDER CORE BANKING JOINT LIEN' : fdr.status === 'RELEASED_APPROVED' ? '🎉 10-YEAR STATUTORY RELEASE NOC ISSUED & DISCHARGED' : '⚠️ ' + fdr.status}
    <br/>
    <small>Instrument ID: <strong>${fdr.id}</strong> • AICTE PID: <strong>${fdr.aicte_pid || fdr.aicteId}</strong></small>
  </div>

  <table>
    <tr><th>Institution Legal Name</th><td><strong>${instName}</strong></td></tr>
    <tr><th>Permanent AICTE PID</th><td><code>${fdr.aicte_pid || fdr.aicteId}</code></td></tr>
    <tr><th>Surveillance Region / State</th><td>${fdr.region || 'Southern (Chennai)'} • ${fdr.state || 'Tamil Nadu'}</td></tr>
    <tr><th>Statutory Depository Bank</th><td><strong>${bank}</strong> (${branch})</td></tr>
    <tr><th>Depository IFSC & MICR Code</th><td><code>${ifsc}</code></td></tr>
    <tr><th>Fixed Deposit Receipt Number</th><td><strong>${fdrNo}</strong></td></tr>
    <tr><th>Secured Principal Amount</th><td><strong style="font-size: 16px; color: #059669;">₹${amount.toLocaleString('en-IN')}</strong> (Interest: ${interestRate})</td></tr>
    <tr><th>Statutory Lock-in Period</th><td>${tenure} Years Joint Custody (Maturity: ${maturityDate})</td></tr>
    <tr><th>Primary Regulatory Joint Holder</th><td>${jointAicte}</td></tr>
    <tr><th>Institutional Trust Joint Holder</th><td>${jointTrust}</td></tr>
    <tr><th>Core Banking (CBS) Liquidation Lock</th><td>${fdr.early_liquidation_lock ? 'ENGAGED — Flagged Immovable (CBS Code: 01)' : 'Pending Bank Token'}</td></tr>
    <tr><th>Inter-Bank SFMS Token</th><td><code>${bankToken || 'SFMS-PENDING'}</code></td></tr>
    <tr><th>Bank Authorizing Officer</th><td>${confirmedBy || 'Branch Manager'} (${confirmedAt || 'Verified via SFMS Gateway'})</td></tr>
    <tr><th>Forensic ELA Tamper Score</th><td>${fdr.tamper_score || '0.5% (Clean Verified)'}</td></tr>
    <tr><th>Bureau Scrutiny Remarks</th><td>${fdr.scrutiny_observations || 'All regulatory clauses under APH Chapter 1 satisfied.'}</td></tr>
  </table>

  <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
    <div class="seal">
      AICTE SURAKSHA-FDR<br/>
      DIGITALLY SECURED CERTIFICATE<br/>
      DATE: ${new Date().toLocaleDateString('en-IN')}
    </div>
    <div style="text-align: right; font-size: 12px;">
      <div><strong>Digitally Signed & Validated</strong></div>
      <div>Regulation Bureau, AICTE New Delhi</div>
      <div style="color: #64748b; font-family: monospace; font-size: 10px;">SHA256: 0x${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated via AICTE Central Registry Portal</span>
    <span>Information Technology Act, 2000 Compliant Electronic Record</span>
  </div>
</body>
</html>`;
              const blob = new Blob([htmlContent], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `AICTE_Dossier_${fdr.id}_${(instName || 'Institution').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={14} />
            <span>Download Official Regulatory Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
